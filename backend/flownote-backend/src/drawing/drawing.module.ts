import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DrawingService } from './drawing.service';
import { DrawingController } from './drawing.controller';
import { DrawingLayer, DrawingLayerSchema } from './schemas/drawing.schema';
import { NotesModule } from '../notes/notes.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: DrawingLayer.name, schema: DrawingLayerSchema }]),
    forwardRef(() => NotesModule),
  ],
  providers: [DrawingService],
  controllers: [DrawingController],
  exports: [DrawingService],
})
export class DrawingModule {}
