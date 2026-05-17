import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Reminder, ReminderDocument } from './schemas/reminder.schema';

@Injectable()
export class RemindersScheduler {
  private readonly logger = new Logger(RemindersScheduler.name);

  constructor(
    @InjectModel(Reminder.name) private reminderModel: Model<ReminderDocument>,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async procesarRecordatoriosVencidos() {
    const ahora = new Date();
    const pendientes = await this.reminderModel.find({
      fecha_hora: { $lte: ahora },
      enviado: false,
    }).populate('nota_id', 'titulo');

    for (const recordatorio of pendientes) {
      const nota = recordatorio.nota_id as { titulo?: string } | null;
      this.logger.log(
        `Recordatorio para usuario ${recordatorio.usuario_id}: `
        + `"${recordatorio.mensaje}" (nota: ${nota?.titulo ?? 'N/A'})`,
      );
      recordatorio.enviado = true;
      await recordatorio.save();
    }
  }
}
