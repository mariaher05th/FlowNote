import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type DrawingLayerDocument = DrawingLayer & Document;

@Schema({ _id: false })
export class StrokePoint {
  @Prop({ required: true })
  x: number;

  @Prop({ required: true })
  y: number;

  @Prop({ default: 1 })
  presion: number;
}

@Schema({ _id: false })
export class Stroke {
  @Prop({ type: [StrokePoint], default: [] })
  puntos: StrokePoint[];

  @Prop({ default: '#000000' })
  color: string;

  @Prop({ default: 2 })
  grosor: number;
}

@Schema({ timestamps: true })
export class DrawingLayer {
  @Prop({ type: Types.ObjectId, ref: 'Note', required: true, unique: true })
  nota_id: Types.ObjectId;

  @Prop({ type: [Stroke], default: [] })
  trazos: Stroke[];

  @Prop({ default: '' })
  svg_data: string;
}

export const DrawingLayerSchema = SchemaFactory.createForClass(DrawingLayer);
