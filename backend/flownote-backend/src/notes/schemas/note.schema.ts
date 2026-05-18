import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type NoteDocument = Note & Document;

export type NoteEstado = 'pendiente' | 'en_progreso' | 'completado';

@Schema({ timestamps: true })
export class Note {
  @Prop({ required: true, trim: true })
  titulo: string;

  @Prop({ default: '' })
  contenido: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  autor_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Space', default: null })
  espacio_id: Types.ObjectId | null;

  @Prop({ enum: ['pendiente', 'en_progreso', 'completado'], default: 'pendiente' })
  estado: NoteEstado;

  @Prop({ default: false })
  es_colaborativa: boolean;

  @Prop({
    type: [{ usuario_id: String, username: String, nombre: String, rol: String }],
    default: [],
  })
  colaboradores: { usuario_id: string; username: string; nombre: string; rol: string }[];

  @Prop({ type: Types.ObjectId, ref: 'FlowDashboard', default: null })
  dashboard_id: Types.ObjectId | null;

  @Prop({ type: [String], default: [] })
  etiquetas: string[];
}

export const NoteSchema = SchemaFactory.createForClass(Note);

// Índice de texto para búsqueda global
NoteSchema.index({ titulo: 'text', contenido: 'text' });
