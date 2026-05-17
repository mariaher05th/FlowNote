import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RemindersService } from './reminders.service';
import { RemindersController } from './reminders.controller';
import { RemindersScheduler } from './reminders.scheduler';
import { Reminder, ReminderSchema } from './schemas/reminder.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Reminder.name, schema: ReminderSchema }]),
  ],
  providers: [RemindersService, RemindersScheduler],
  controllers: [RemindersController],
  exports: [RemindersService],
})
export class RemindersModule {}