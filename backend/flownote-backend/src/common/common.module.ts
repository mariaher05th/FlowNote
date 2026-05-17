import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AccessService } from './services/access.service';
import { Note, NoteSchema } from '../notes/schemas/note.schema';
import { Space, SpaceSchema } from '../spaces/schemas/space.schema';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Note.name, schema: NoteSchema },
      { name: Space.name, schema: SpaceSchema },
    ]),
  ],
  providers: [AccessService],
  exports: [AccessService],
})
export class CommonModule {}
