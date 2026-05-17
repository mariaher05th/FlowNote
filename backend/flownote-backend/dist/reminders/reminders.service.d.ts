import { Model } from 'mongoose';
import { ReminderDocument } from './schemas/reminder.schema';
import { CreateReminderDto, UpdateReminderDto } from './dto/reminder.dto';
export declare class RemindersService {
    private reminderModel;
    constructor(reminderModel: Model<ReminderDocument>);
    crear(dto: CreateReminderDto, userId: string): Promise<ReminderDocument>;
    misRecordatorios(userId: string): Promise<ReminderDocument[]>;
    proximos(userId: string): Promise<ReminderDocument[]>;
    porNota(notaId: string, userId: string): Promise<ReminderDocument[]>;
    actualizar(id: string, dto: UpdateReminderDto, userId: string): Promise<ReminderDocument>;
    eliminar(id: string, userId: string): Promise<{
        mensaje: string;
    }>;
    marcarEnviado(id: string): Promise<ReminderDocument>;
}
