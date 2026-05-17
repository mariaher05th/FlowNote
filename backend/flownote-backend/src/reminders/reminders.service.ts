import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Reminder, ReminderDocument } from './schemas/reminder.schema';
import { CreateReminderDto, UpdateReminderDto } from './dto/reminder.dto';

@Injectable()
export class RemindersService {
  constructor(
    @InjectModel(Reminder.name) private reminderModel: Model<ReminderDocument>,
  ) {}

  // Crear recordatorio asociado a una nota
  async crear(dto: CreateReminderDto, userId: string): Promise<ReminderDocument> {
    return this.reminderModel.create({
      nota_id: new Types.ObjectId(dto.nota_id),
      usuario_id: new Types.ObjectId(userId),
      mensaje: dto.mensaje,
      fecha_hora: new Date(dto.fecha_hora),
    });
  }

  // Obtener todos los recordatorios del usuario
  async misRecordatorios(userId: string): Promise<ReminderDocument[]> {
    return this.reminderModel
      .find({ usuario_id: new Types.ObjectId(userId) })
      .populate('nota_id', 'titulo')
      .sort({ fecha_hora: 1 }); // ordenados por fecha ascendente
  }

  // Obtener recordatorios próximos (próximas 24 horas)
  async proximos(userId: string): Promise<ReminderDocument[]> {
    const ahora = new Date();
    const manana = new Date(ahora.getTime() + 24 * 60 * 60 * 1000);

    return this.reminderModel
      .find({
        usuario_id: new Types.ObjectId(userId),
        fecha_hora: { $gte: ahora, $lte: manana },
        enviado: false,
      })
      .populate('nota_id', 'titulo')
      .sort({ fecha_hora: 1 });
  }

  // Obtener recordatorios de una nota específica
  async porNota(notaId: string, userId: string): Promise<ReminderDocument[]> {
    return this.reminderModel
      .find({
        nota_id: new Types.ObjectId(notaId),
        usuario_id: new Types.ObjectId(userId),
      })
      .sort({ fecha_hora: 1 });
  }

  // Actualizar recordatorio
  async actualizar(
    id: string, dto: UpdateReminderDto, userId: string,
  ): Promise<ReminderDocument> {
    const recordatorio = await this.reminderModel.findById(id);
    if (!recordatorio) throw new NotFoundException('Recordatorio no encontrado');
    if (recordatorio.usuario_id.toString() !== userId) {
      throw new ForbiddenException('No puedes modificar este recordatorio');
    }

    const actualizado: any = { ...dto };
    if (dto.fecha_hora) actualizado.fecha_hora = new Date(dto.fecha_hora);

    return this.reminderModel.findByIdAndUpdate(id, actualizado, { new: true });
  }

  // Eliminar recordatorio
  async eliminar(id: string, userId: string): Promise<{ mensaje: string }> {
    const recordatorio = await this.reminderModel.findById(id);
    if (!recordatorio) throw new NotFoundException('Recordatorio no encontrado');
    if (recordatorio.usuario_id.toString() !== userId) {
      throw new ForbiddenException('No puedes eliminar este recordatorio');
    }

    await this.reminderModel.findByIdAndDelete(id);
    return { mensaje: 'Recordatorio eliminado correctamente' };
  }

  // Marcar como enviado (para uso interno o futuro sistema de notificaciones)
  async marcarEnviado(id: string): Promise<ReminderDocument> {
    return this.reminderModel.findByIdAndUpdate(
      id, { enviado: true }, { new: true },
    );
  }
}