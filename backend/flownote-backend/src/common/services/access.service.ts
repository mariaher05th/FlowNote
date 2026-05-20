import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Note, NoteDocument } from '../../notes/schemas/note.schema';
import { Space, SpaceDocument } from '../../spaces/schemas/space.schema';

export type RolEspacio = 'editor' | 'revisor' | 'observador';
export type RolNotaColaborador = 'admin' | 'editor' | 'revisor' | 'observador';

const ROLES_EDICION_NOTA: RolNotaColaborador[] = ['admin', 'editor'];

@Injectable()
export class AccessService {
  constructor(
    @InjectModel(Note.name) private noteModel: Model<NoteDocument>,
    @InjectModel(Space.name) private spaceModel: Model<SpaceDocument>,
  ) {}

  private coincideColaborador(
    col: { usuario_id?: string; username?: string },
    userId: string,
    username?: string,
  ): boolean {
    if (col.usuario_id && col.usuario_id.toString() === userId) return true;
    if (username && col.username?.toLowerCase() === username.toLowerCase()) return true;
    return false;
  }

  async obtenerRolEnEspacio(
    espacioId: Types.ObjectId | string | null | undefined,
    userId: string,
  ): Promise<RolEspacio | null> {
    if (!espacioId) return null;
    const espacio = await this.spaceModel.findById(espacioId);
    if (!espacio) return null;
    const miembro = espacio.miembros.find(m => m.usuario_id.toString() === userId);
    return (miembro?.rol as RolEspacio) ?? null;
  }

  async obtenerRolEnNota(
    nota: NoteDocument,
    userId: string,
    username?: string,
  ): Promise<RolNotaColaborador | null> {
    const col = nota.colaboradores?.find(c =>
      this.coincideColaborador(c, userId, username),
    );
    return (col?.rol as RolNotaColaborador) ?? null;
  }

  esColaboradorDeNota(
    nota: NoteDocument,
    userId: string,
    username?: string,
  ): boolean {
    return !!nota.colaboradores?.some(c =>
      this.coincideColaborador(c, userId, username),
    );
  }

  async puedeLeerNota(
    nota: NoteDocument,
    userId: string,
    username?: string,
  ): Promise<boolean> {
    if (nota.autor_id.toString() === userId) return true;
    if (this.esColaboradorDeNota(nota, userId, username)) return true;
    if (nota.espacio_id) {
      const rol = await this.obtenerRolEnEspacio(nota.espacio_id, userId);
      return rol !== null;
    }
    return false;
  }

  async puedeEditarNota(
    nota: NoteDocument,
    userId: string,
    username?: string,
  ): Promise<boolean> {
    if (nota.autor_id.toString() === userId) return true;

    const rolNota = await this.obtenerRolEnNota(nota, userId, username);
    if (rolNota && ROLES_EDICION_NOTA.includes(rolNota)) return true;

    if (nota.espacio_id) {
      const rol = await this.obtenerRolEnEspacio(nota.espacio_id, userId);
      return rol === 'editor';
    }
    return false;
  }

  async puedeEliminarNota(
    nota: NoteDocument,
    userId: string,
    username?: string,
  ): Promise<boolean> {
    if (nota.autor_id.toString() === userId) return true;

    const rolNota = await this.obtenerRolEnNota(nota, userId, username);
    if (rolNota === 'admin') return true;

    if (nota.espacio_id) {
      const rol = await this.obtenerRolEnEspacio(nota.espacio_id, userId);
      return rol === 'editor';
    }
    return false;
  }

  filtroNotasAccesibles(
    userId: string,
    espacioIds: Types.ObjectId[],
    username?: string,
  ) {
    const userOid = new Types.ObjectId(userId);
    const or: Record<string, unknown>[] = [
      { autor_id: userOid },
      { espacio_id: { $in: espacioIds } },
      { 'colaboradores.usuario_id': userId },
      { 'colaboradores.usuario_id': userOid },
    ];
    if (username) {
      or.push({ 'colaboradores.username': username });
    }
    return { $or: or };
  }

  async idsEspaciosDelUsuario(userId: string): Promise<Types.ObjectId[]> {
    const espacios = await this.spaceModel.find({
      'miembros.usuario_id': new Types.ObjectId(userId),
    }).select('_id');
    return espacios.map(e => e._id as Types.ObjectId);
  }
}
