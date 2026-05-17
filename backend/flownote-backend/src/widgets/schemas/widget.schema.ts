import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type WidgetDocument = Widget & Document;

@Schema({ timestamps: true })
export class Widget {
  @Prop({ type: Types.ObjectId, ref: 'Note', default: null })
  nota_id: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, ref: 'Space', default: null })
  espacio_id: Types.ObjectId | null;

  @Prop({ required: true })
  tipo: string;

  @Prop({ type: Object, default: {} })
  config: Record<string, unknown>;

  @Prop({ default: 0 })
  x: number;

  @Prop({ default: 0 })
  y: number;

  @Prop({ default: 200 })
  width: number;

  @Prop({ default: 120 })
  height: number;

  @Prop({ default: 0 })
  orden: number;
}

export const WidgetSchema = SchemaFactory.createForClass(Widget);
