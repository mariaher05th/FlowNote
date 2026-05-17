import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Note, NoteDocument } from '../../notes/schemas/note.schema';
import { Space, SpaceDocument } from '../../spaces/schemas/space.schema';

export type RolEspacio = 'editor' | 'revisor' | 'observador';

@Injectable()
export class AccessService {
  constructor(
    @InjectModel(Note.name) private noteModel: Model<NoteDocument>,
    @InjectModel(Space.name) private spaceModel: Model<SpaceDocument>,
  ) {}

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

  async puedeLeerNota(nota: NoteDocument, userId: string): Promise<boolean> {
    if (nota.autor_id.toString() === userId) return true;
    if (nota.es_colaborativa) return true;
    if (nota.espacio_id) {
      const rol = await this.obtenerRolEnEspacio(nota.espacio_id, userId);
      return rol !== null;
    }
    return false;
  }

  async puedeEditarNota(nota: NoteDocument, userId: string): Promise<boolean> {
    if (nota.autor_id.toString() === userId) return true;
    if (nota.espacio_id) {
      const rol = await this.obtenerRolEnEspacio(nota.espacio_id, userId);
      return rol === 'editor';
    }
    return false;
  }

  async puedeEliminarNota(nota: NoteDocument, userId: string): Promise<boolean> {
    if (nota.autor_id.toString() === userId) return true;
    if (nota.espacio_id) {
      const rol = await this.obtenerRolEnEspacio(nota.espacio_id, userId);
      return rol === 'editor';
    }
    return false;
  }

  async idsEspaciosDelUsuario(userId: string): Promise<Types.ObjectId[]> {
    const espacios = await this.spaceModel.find({
      'miembros.usuario_id': new Types.ObjectId(userId),
    }).select('_id');
    return espacios.map(e => e._id as Types.ObjectId);
  }
}
