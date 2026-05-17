import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { CollaborationGateway } from './collaboration.gateway';
import { CollaborationRoomService } from './collaboration-room.service';
import { LockService } from './lock.service';
import { LockExpiryScheduler } from './lock-expiry.scheduler';
import {
  CollaborationLock,
  CollaborationLockSchema,
} from './schemas/collaboration-lock.schema';
import { Note, NoteSchema } from '../notes/schemas/note.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CollaborationLock.name, schema: CollaborationLockSchema },
      { name: Note.name, schema: NoteSchema },
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secreto_temporal',
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
    }),
  ],
  providers: [
    CollaborationGateway,
    CollaborationRoomService,
    LockService,
    LockExpiryScheduler,
  ],
  exports: [LockService],
})
export class CollaborationModule {}
