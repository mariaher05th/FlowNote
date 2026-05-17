import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SpacesService } from './spaces.service';
import { SpacesController } from './spaces.controller';
import { Space, SpaceSchema } from './schemas/space.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Space.name, schema: SpaceSchema }])],
  providers: [SpacesService],
  controllers: [SpacesController],
  exports: [SpacesService],
})
export class SpacesModule {}
