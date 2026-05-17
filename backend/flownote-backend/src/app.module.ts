import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { NotesModule } from './notes/notes.module';
import { SpacesModule } from './spaces/spaces.module';
import { SpeechModule } from './speech/speech.module';
import { RemindersModule } from './reminders/reminders.module';
import { CommentsModule } from './comments/comments.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/flownote'),
    AuthModule,
    NotesModule,
    SpacesModule,
    SpeechModule,
    RemindersModule,
    CommentsModule,
  ],
})
export class AppModule {}
