import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FlowDashboardDocument = FlowDashboard & Document;

@Schema({ _id: false })
export class FlowNode {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  etiqueta: string;

  @Prop({ default: 'tarea' })
  tipo: string;

  @Prop({ default: 0 })
  x: number;

  @Prop({ default: 0 })
  y: number;

  @Prop({ default: 'pendiente' })
  estado: string;
}

@Schema({ _id: false })
export class FlowEdge {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  origen_id: string;

  @Prop({ required: true })
  destino_id: string;

  @Prop({ default: '' })
  etiqueta: string;
}

@Schema({ timestamps: true })
export class FlowDashboard {
  @Prop({ type: Types.ObjectId, ref: 'Note', required: true, unique: true })
  nota_id: Types.ObjectId;

  @Prop({ type: [FlowNode], default: [] })
  nodos: FlowNode[];

  @Prop({ type: [FlowEdge], default: [] })
  conexiones: FlowEdge[];
}

export const FlowDashboardSchema = SchemaFactory.createForClass(FlowDashboard);
