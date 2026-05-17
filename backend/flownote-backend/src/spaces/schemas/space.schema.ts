import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SpaceDocument = Space & Document;

@Schema({ timestamps: true })
export class Space {
  @Prop({ required: true, trim: true })
  nombre: string;

  @Prop({ default: '' })
  descripcion: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  creador_id: Types.ObjectId;

  // Miembros: [{ usuario_id, rol }]
  @Prop({
    type: [{
      usuario_id: { type: Types.ObjectId, ref: 'User' },
      rol: { type: String, enum: ['editor', 'revisor', 'observador'], default: 'observador' },
      joined_at: { type: Date, default: Date.now },
    }],
    default: [],
  })
  miembros: Array<{
    usuario_id: Types.ObjectId;
    rol: string;
    joined_at: Date;
  }>;
}

export const SpaceSchema = SchemaFactory.createForClass(Space);
