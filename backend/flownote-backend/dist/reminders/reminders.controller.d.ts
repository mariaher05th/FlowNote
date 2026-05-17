import { RemindersService } from './reminders.service';
import { CreateReminderDto, UpdateReminderDto } from './dto/reminder.dto';
export declare class RemindersController {
    private readonly remindersService;
    constructor(remindersService: RemindersService);
    crear(dto: CreateReminderDto, req: any): Promise<import("./schemas/reminder.schema").ReminderDocument>;
    misRecordatorios(req: any): Promise<import("./schemas/reminder.schema").ReminderDocument[]>;
    proximos(req: any): Promise<import("./schemas/reminder.schema").ReminderDocument[]>;
    porNota(notaId: string, req: any): Promise<import("./schemas/reminder.schema").ReminderDocument[]>;
    actualizar(id: string, dto: UpdateReminderDto, req: any): Promise<import("./schemas/reminder.schema").ReminderDocument>;
    eliminar(id: string, req: any): Promise<{
        mensaje: string;
    }>;
}
