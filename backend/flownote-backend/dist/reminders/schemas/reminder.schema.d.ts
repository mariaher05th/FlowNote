import { Document, Types } from 'mongoose';
export type ReminderDocument = Reminder & Document;
export declare class Reminder {
    nota_id: Types.ObjectId;
    usuario_id: Types.ObjectId;
    mensaje: string;
    fecha_hora: Date;
    enviado: boolean;
}
export declare const ReminderSchema: import("mongoose").Schema<Reminder, import("mongoose").Model<Reminder, any, any, any, Document<unknown, any, Reminder, any, {}> & Reminder & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Reminder, Document<unknown, {}, import("mongoose").FlatRecord<Reminder>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Reminder> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
