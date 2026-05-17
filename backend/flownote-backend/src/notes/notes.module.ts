import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotesService } from './notes.service';
import { NotesController } from './notes.controller';
import { Note, NoteSchema } from './schemas/note.schema';
import { ExportService } from './export.service';
import { FlowsModule } from '../flows/flows.module';
import { TemplatesModule } from '../templates/templates.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Note.name, schema: NoteSchema }]),
    forwardRef(() => FlowsModule),
    TemplatesModule,
  ],
  providers: [NotesService, ExportService],
  controllers: [NotesController],
  exports: [NotesService],
})
export class NotesModule {}
