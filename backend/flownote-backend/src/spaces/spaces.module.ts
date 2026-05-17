import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SpacesService } from './spaces.service';
import { SpacesController } from './spaces.controller';
import { Space, SpaceSchema } from './schemas/space.schema';
import { Note, NoteSchema } from '../notes/schemas/note.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Space.name, schema: SpaceSchema },
      { name: Note.name, schema: NoteSchema },
    ]),
  ],
  providers: [SpacesService],
  controllers: [SpacesController],
  exports: [SpacesService],
})
export class SpacesModule {}
