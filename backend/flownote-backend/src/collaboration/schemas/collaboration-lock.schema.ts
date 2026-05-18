import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { LOCK_RESOURCE_TYPES, LockResourceType } from '../collaboration.types';

export type CollaborationLockDocument = CollaborationLock & Document;

@Schema({ timestamps: true })
export class CollaborationLock {
  @Prop({ required: true, index: true })
  room: string;

  @Prop({ required: true, enum: LOCK_RESOURCE_TYPES })
  resource_type: LockResourceType;

  @Prop({ required: true })
  resource_id: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  holder_id: Types.ObjectId;

  @Prop({ required: true })
  holder_nombre: string;

  @Prop({ required: true })
  socket_id: string;

  @Prop({ required: true, index: true })
  expires_at: Date;

  @Prop({ required: true })
  last_renewed_at: Date;
}

export const CollaborationLockSchema = SchemaFactory.createForClass(CollaborationLock);

CollaborationLockSchema.index(
  { room: 1, resource_type: 1, resource_id: 1 },
  { unique: true },
);
