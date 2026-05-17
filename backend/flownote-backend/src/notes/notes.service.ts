import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Note, NoteDocument } from './schemas/note.schema';
import { CreateNoteDto, UpdateNoteDto } from './dto/note.dto';

@Injectable()
export class NotesService {
  constructor(@InjectModel(Note.name) private noteModel: Model<NoteDocument>) {}

  // Crear nota
  async crear(dto: CreateNoteDto, userId: string): Promise<NoteDocument> {
    const nota = await this.noteModel.create({
      ...dto,
      autor_id: new Types.ObjectId(userId),
      espacio_id: dto.espacio_id ? new Types.ObjectId(dto.espacio_id) : null,
    });
    return nota;
  }

  // Obtener todas las notas del usuario
  async obtenerMias(userId: string): Promise<NoteDocument[]> {
    return this.noteModel
      .find({ autor_id: new Types.ObjectId(userId) })
      .sort({ updatedAt: -1 });
  }

  // Obtener una nota por ID (verifica que sea del usuario)
  async obtenerUna(id: string, userId: string): Promise<NoteDocument> {
    const nota = await this.noteModel.findById(id);
    if (!nota) throw new NotFoundException('Nota no encontrada');
    if (nota.autor_id.toString() !== userId && !nota.es_colaborativa) {
      throw new ForbiddenException('No tienes acceso a esta nota');
    }
    return nota;
  }

  // Actualizar nota
  async actualizar(id: string, dto: UpdateNoteDto, userId: string): Promise<NoteDocument> {
    const nota = await this.noteModel.findById(id);
    if (!nota) throw new NotFoundException('Nota no encontrada');
    if (nota.autor_id.toString() !== userId) {
      throw new ForbiddenException('No puedes editar esta nota');
    }
    return this.noteModel.findByIdAndUpdate(id, dto, { new: true });
  }

  // Eliminar nota
  async eliminar(id: string, userId: string): Promise<{ mensaje: string }> {
    const nota = await this.noteModel.findById(id);
    if (!nota) throw new NotFoundException('Nota no encontrada');
    if (nota.autor_id.toString() !== userId) {
      throw new ForbiddenException('No puedes eliminar esta nota');
    }
    await this.noteModel.findByIdAndDelete(id);
    return { mensaje: 'Nota eliminada correctamente' };
  }

  // Búsqueda global por palabras clave (título y contenido)
  async buscar(query: string, userId: string): Promise<NoteDocument[]> {
    if (!query || query.trim().length === 0) return [];
    const q = query.trim().substring(0, 200); // límite según RNF

    return this.noteModel.find({
      autor_id: new Types.ObjectId(userId),
      $text: { $search: q },
    }, { score: { $meta: 'textScore' } })
      .sort({ score: { $meta: 'textScore' } })
      .limit(20);
  }

  // Sugerir vínculos entre notas por palabras clave compartidas
  async sugerirVinculos(id: string, userId: string): Promise<NoteDocument[]> {
    const nota = await this.obtenerUna(id, userId);
    if (!nota.contenido) return [];

    // Extraer palabras clave significativas (más de 4 letras)
    const palabras = nota.contenido
      .toLowerCase()
      .split(/\W+/)
      .filter(p => p.length > 4)
      .slice(0, 10); // top 10 palabras

    if (palabras.length === 0) return [];

    return this.noteModel.find({
      _id: { $ne: nota._id },
      autor_id: new Types.ObjectId(userId),
      $or: palabras.map(p => ({
        $or: [
          { titulo: { $regex: p, $options: 'i' } },
          { contenido: { $regex: p, $options: 'i' } },
        ],
      })),
    }).limit(5);
  }

  // Obtener notas por estado (para tablero kanban)
  async porEstado(estado: string, userId: string): Promise<NoteDocument[]> {
    return this.noteModel.find({
      autor_id: new Types.ObjectId(userId),
      estado,
    }).sort({ updatedAt: -1 });
  }
}
