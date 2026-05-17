import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TemplateDocument = Template & Document;

@Schema({ timestamps: true })
export class Template {
  @Prop({ required: true, trim: true })
  titulo: string;

  @Prop({ default: '' })
  contenido: string;

  @Prop({ default: 'general' })
  categoria: string;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  autor_id: Types.ObjectId | null;

  @Prop({ default: false })
  es_sistema: boolean;
}

export const TemplateSchema = SchemaFactory.createForClass(Template);
