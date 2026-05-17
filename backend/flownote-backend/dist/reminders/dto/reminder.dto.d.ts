export declare class CreateReminderDto {
    nota_id: string;
    mensaje: string;
    fecha_hora: string;
}
export declare class UpdateReminderDto {
    mensaje?: string;
    fecha_hora?: string;
    enviado?: boolean;
}
