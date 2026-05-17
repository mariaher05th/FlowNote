import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ReminderDocument = Reminder & Document;

@Schema({ timestamps: true })
export class Reminder {
  @Prop({ type: Types.ObjectId, ref: 'Note', required: true })
  nota_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  usuario_id: Types.ObjectId;

  @Prop({ required: true })
  mensaje: string;

  @Prop({ required: true })
  fecha_hora: Date;

  @Prop({ default: false })
  enviado: boolean;
}

export const ReminderSchema = SchemaFactory.createForClass(Reminder);