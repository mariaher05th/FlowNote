import { Document, Types } from 'mongoose';
export type NoteDocument = Note & Document;
export type NoteEstado = 'pendiente' | 'en_progreso' | 'completado';
export declare class Note {
    titulo: string;
    contenido: string;
    autor_id: Types.ObjectId;
    espacio_id: Types.ObjectId | null;
    estado: NoteEstado;
    es_colaborativa: boolean;
    etiquetas: string[];
}
export declare const NoteSchema: import("mongoose").Schema<Note, import("mongoose").Model<Note, any, any, any, Document<unknown, any, Note, any, {}> & Note & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Note, Document<unknown, {}, import("mongoose").FlatRecord<Note>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Note> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
