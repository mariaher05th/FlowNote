import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CommentDocument = Comment & Document;

@Schema({ timestamps: true })
export class Comment {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  usuario_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Note', required: true })
  nota_id: Types.ObjectId;

  @Prop({ required: true })
  contenido: string;

  // Posición dentro de la nota (para comentarios en secciones específicas)
  @Prop({ default: null })
  posicion_char: number | null;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);