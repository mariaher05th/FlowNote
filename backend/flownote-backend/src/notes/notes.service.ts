import {
  Injectable, NotFoundException, ForbiddenException, Inject, forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Note, NoteDocument, NoteEstado } from './schemas/note.schema';
import { CreateNoteDto, UpdateNoteDto } from './dto/note.dto';
import { AccessService } from '../common/services/access.service';
import { FlowsService } from '../flows/flows.service';
import { TemplatesService } from '../templates/templates.service';

const ESTADOS: NoteEstado[] = ['pendiente', 'en_progreso', 'completado'];

@Injectable()
export class NotesService {
  constructor(
    @InjectModel(Note.name) private noteModel: Model<NoteDocument>,
    private accessService: AccessService,
    @Inject(forwardRef(() => FlowsService))
    private flowsService: FlowsService,
    private templatesService: TemplatesService,
  ) {}

  async crear(dto: CreateNoteDto, userId: string): Promise<NoteDocument> {
    let titulo = dto.titulo;
    let contenido = dto.contenido ?? '';

    if (dto.plantilla_id) {
      const plantilla = await this.templatesService.obtener(dto.plantilla_id, userId);
      if (!contenido) contenido = plantilla.contenido;
    }

    // Creador siempre tiene invitacion aceptada; invitados quedan pendientes
    const colaboradoresConEstado = (dto.colaboradores ?? []).map(c => ({
      ...c,
      invitacion: c.usuario_id === userId ? 'aceptada' : 'pendiente',
    }));

    const nota = await this.noteModel.create({
      titulo,
      contenido,
      estado: dto.estado,
      etiquetas: dto.etiquetas ?? [],
      es_colaborativa: dto.es_colaborativa ?? false,
      colaboradores: dto.es_colaborativa ? colaboradoresConEstado : [],
      autor_id: new Types.ObjectId(userId),
      espacio_id: dto.espacio_id ? new Types.ObjectId(dto.espacio_id) : null,
    });

    if (dto.es_colaborativa) {
      return this.convertirAColaborativa(nota);
    }
    return nota;
  }

  async obtenerMias(userId: string, username?: string): Promise<NoteDocument[]> {
    const espacioIds = await this.accessService.idsEspaciosDelUsuario(userId);
    const filtro = this.accessService.filtroNotasAccesibles(userId, espacioIds, username);
    return this.noteModel.find(filtro).sort({ updatedAt: -1 });
  }

  async obtenerPorEspacio(espacioId: string, userId: string): Promise<NoteDocument[]> {
    const rol = await this.accessService.obtenerRolEnEspacio(espacioId, userId);
    if (!rol) throw new ForbiddenException('No eres miembro de este espacio');

    return this.noteModel
      .find({ espacio_id: new Types.ObjectId(espacioId) })
      .sort({ updatedAt: -1 });
  }

  async obtenerUna(id: string, userId: string, username?: string): Promise<NoteDocument> {
    const nota = await this.noteModel.findById(id);
    if (!nota) throw new NotFoundException('Nota no encontrada');
    if (!(await this.accessService.puedeLeerNota(nota, userId, username))) {
      throw new ForbiddenException('No tienes acceso a esta nota');
    }
    return nota;
  }

  async actualizar(id: string, dto: UpdateNoteDto, userId: string, username?: string): Promise<NoteDocument> {
    const nota = await this.noteModel.findById(id);
    if (!nota) throw new NotFoundException('Nota no encontrada');
    if (!(await this.accessService.puedeEditarNota(nota, userId, username))) {
      throw new ForbiddenException('No puedes editar esta nota');
    }

    const payload: Record<string, unknown> = { ...dto };
    if (dto.espacio_id !== undefined) {
      payload.espacio_id = dto.espacio_id
        ? new Types.ObjectId(dto.espacio_id)
        : null;
    }

    const actualizada = await this.noteModel.findByIdAndUpdate(id, payload, { new: true });
if (!actualizada) throw new NotFoundException('Nota no encontrada');
if (dto.es_colaborativa && !actualizada.dashboard_id) {
  return this.convertirAColaborativa(actualizada);
}
return actualizada;
  }

  async eliminar(id: string, userId: string, username?: string): Promise<{ mensaje: string }> {
    const nota = await this.noteModel.findById(id);
    if (!nota) throw new NotFoundException('Nota no encontrada');
    if (!(await this.accessService.puedeEliminarNota(nota, userId, username))) {
      throw new ForbiddenException('No puedes eliminar esta nota');
    }
    await this.noteModel.findByIdAndDelete(id);
    return { mensaje: 'Nota eliminada correctamente' };
  }

  async buscar(query: string, userId: string): Promise<NoteDocument[]> {
    if (!query || query.trim().length === 0) return [];
    const q = query.trim().substring(0, 200);
    const espacioIds = await this.accessService.idsEspaciosDelUsuario(userId);
    const acceso = this.accessService.filtroNotasAccesibles(userId, espacioIds);

    return this.noteModel.find({
      $and: [{ $text: { $search: q } }, acceso],
    }, { score: { $meta: 'textScore' } })
      .sort({ score: { $meta: 'textScore' } })
      .limit(20);
  }

  async sugerirVinculos(id: string, userId: string, username?: string): Promise<NoteDocument[]> {
    const nota = await this.obtenerUna(id, userId, username);
    if (!nota.contenido) return [];

    const palabras = nota.contenido
      .toLowerCase()
      .split(/\W+/)
      .filter(p => p.length > 4)
      .slice(0, 10);

    if (palabras.length === 0) return [];

    const espacioIds = await this.accessService.idsEspaciosDelUsuario(userId);

    const acceso = this.accessService.filtroNotasAccesibles(userId, espacioIds);

    return this.noteModel.find({
      _id: { $ne: nota._id },
      ...acceso,
      $and: [{
        $or: palabras.map(p => ({
          $or: [
            { titulo: { $regex: p, $options: 'i' } },
            { contenido: { $regex: p, $options: 'i' } },
          ],
        })),
      }],
    }).limit(5);
  }

  async porEstado(estado: string, userId: string): Promise<NoteDocument[]> {
    const espacioIds = await this.accessService.idsEspaciosDelUsuario(userId);
    return this.noteModel.find({
      estado,
      ...this.accessService.filtroNotasAccesibles(userId, espacioIds),
    }).sort({ updatedAt: -1 });
  }

  async tableroKanban(userId: string, espacioId?: string) {
    const filtro: Record<string, unknown> = {};

    if (espacioId) {
      const rol = await this.accessService.obtenerRolEnEspacio(espacioId, userId);
      if (!rol) throw new ForbiddenException('No eres miembro de este espacio');
      filtro.espacio_id = new Types.ObjectId(espacioId);
    } else {
      const espacioIds = await this.accessService.idsEspaciosDelUsuario(userId);
      Object.assign(filtro, this.accessService.filtroNotasAccesibles(userId, espacioIds));
    }

    const notas = await this.noteModel.find(filtro).sort({ updatedAt: -1 });
    const tablero: Record<NoteEstado, NoteDocument[]> = {
      pendiente: [],
      en_progreso: [],
      completado: [],
    };

    for (const nota of notas) {
      if (ESTADOS.includes(nota.estado)) {
        tablero[nota.estado].push(nota);
      }
    }
    return tablero;
  }

  // ── Invitaciones ──────────────────────────────────────

  async obtenerInvitaciones(userId: string, username: string): Promise<NoteDocument[]> {
    return this.noteModel.find({
      es_colaborativa: true,
      colaboradores: {
        $elemMatch: {
          $or: [{ usuario_id: userId }, { username }],
          invitacion: 'pendiente',
        },
      },
    }).sort({ createdAt: -1 });
  }

  async responderInvitacion(
    noteId: string,
    userId: string,
    username: string,
    respuesta: 'aceptada' | 'rechazada',
  ): Promise<NoteDocument> {
    const nota = await this.noteModel.findById(noteId);
    if (!nota) throw new NotFoundException('Nota no encontrada');

    const idx = nota.colaboradores.findIndex(
      c => c.usuario_id === userId || c.username === username,
    );
    if (idx === -1) throw new ForbiddenException('No eres colaborador de esta nota');

    nota.colaboradores[idx].invitacion = respuesta;
    await nota.save();
    return nota;
  }

  async agregarColaborador(
    noteId: string,
    userId: string,
    username: string,
    colaborador: { usuario_id: string; username: string; nombre: string; rol: string },
  ): Promise<NoteDocument> {
    const nota = await this.noteModel.findById(noteId);
    if (!nota) throw new NotFoundException('Nota no encontrada');

    const esAdmin = nota.autor_id.toString() === userId ||
      nota.colaboradores.some(c => (c.usuario_id === userId || c.username === username) && c.rol === 'admin');
    if (!esAdmin) throw new ForbiddenException('Solo los administradores pueden agregar colaboradores');

    const yaExiste = nota.colaboradores.some(c => c.usuario_id === colaborador.usuario_id || c.username === colaborador.username);
    if (yaExiste) throw new Error('El usuario ya es colaborador');

    nota.colaboradores.push({ ...colaborador, invitacion: 'pendiente' });
    await nota.save();
    return nota;
  }

  async cambiarRolColaborador(
    noteId: string,
    userId: string,
    username: string,
    targetUsername: string,
    nuevoRol: string,
  ): Promise<NoteDocument> {
    const nota = await this.noteModel.findById(noteId);
    if (!nota) throw new NotFoundException('Nota no encontrada');

    const esAdmin = nota.autor_id.toString() === userId ||
      nota.colaboradores.some(c => (c.usuario_id === userId || c.username === username) && c.rol === 'admin');
    if (!esAdmin) throw new ForbiddenException('Solo los administradores pueden cambiar roles');

    const idx = nota.colaboradores.findIndex(c => c.username === targetUsername);
    if (idx === -1) throw new NotFoundException('Colaborador no encontrado');

    nota.colaboradores[idx].rol = nuevoRol;
    await nota.save();
    return nota;
  }

  async eliminarColaborador(
    noteId: string,
    userId: string,
    username: string,
    targetUsername: string,
  ): Promise<NoteDocument> {
    const nota = await this.noteModel.findById(noteId);
    if (!nota) throw new NotFoundException('Nota no encontrada');

    const esAdmin = nota.autor_id.toString() === userId ||
      nota.colaboradores.some(c => (c.usuario_id === userId || c.username === username) && c.rol === 'admin');
    if (!esAdmin) throw new ForbiddenException('Solo los administradores pueden eliminar colaboradores');

    nota.colaboradores = nota.colaboradores.filter(c => c.username !== targetUsername);
    await nota.save();
    return nota;
  }

  private async convertirAColaborativa(nota: NoteDocument): Promise<NoteDocument> {
    const dashboard = await this.flowsService.crearDesdeNota(nota);
    return this.noteModel.findByIdAndUpdate(
      nota._id,
      { es_colaborativa: true, dashboard_id: dashboard._id },
      { new: true },
    );
  }
}
