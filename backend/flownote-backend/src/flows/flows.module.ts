import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FlowsService } from './flows.service';
import { FlowsController } from './flows.controller';
import { FlowDashboard, FlowDashboardSchema } from './schemas/flow.schema';
import { NotesModule } from '../notes/notes.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: FlowDashboard.name, schema: FlowDashboardSchema }]),
    forwardRef(() => NotesModule),
  ],
  providers: [FlowsService],
  controllers: [FlowsController],
  exports: [FlowsService],
})
export class FlowsModule {}
