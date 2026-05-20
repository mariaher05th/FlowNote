import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './auth/auth.module';
import { NotesModule } from './notes/notes.module';
import { SpacesModule } from './spaces/spaces.module';
import { SpeechModule } from './speech/speech.module';
import { RemindersModule } from './reminders/reminders.module';
import { CommentsModule } from './comments/comments.module';
import { CommonModule } from './common/common.module';
import { FlowsModule } from './flows/flows.module';
import { WidgetsModule } from './widgets/widgets.module';
import { DrawingModule } from './drawing/drawing.module';
import { TemplatesModule } from './templates/templates.module';
import { CollaborationModule } from './collaboration/collaboration.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/flownote'),
    CommonModule,
    AuthModule,
    NotesModule,
    SpacesModule,
    SpeechModule,
    RemindersModule,
    CommentsModule,
    FlowsModule,
    WidgetsModule,
    DrawingModule,
    TemplatesModule,
    CollaborationModule,
  ],
  controllers: [AppController],
})
export class AppModule {}