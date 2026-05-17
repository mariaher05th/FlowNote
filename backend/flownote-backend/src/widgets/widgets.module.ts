import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WidgetsService } from './widgets.service';
import { WidgetsController } from './widgets.controller';
import { Widget, WidgetSchema } from './schemas/widget.schema';
import { NotesModule } from '../notes/notes.module';
import { SpacesModule } from '../spaces/spaces.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Widget.name, schema: WidgetSchema }]),
    forwardRef(() => NotesModule),
    SpacesModule,
  ],
  providers: [WidgetsService],
  controllers: [WidgetsController],
  exports: [WidgetsService],
})
export class WidgetsModule {}
