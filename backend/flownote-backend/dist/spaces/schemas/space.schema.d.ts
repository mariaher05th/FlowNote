import { Document, Types } from 'mongoose';
export type SpaceDocument = Space & Document;
export declare class Space {
    nombre: string;
    descripcion: string;
    creador_id: Types.ObjectId;
    miembros: Array<{
        usuario_id: Types.ObjectId;
        rol: string;
        joined_at: Date;
    }>;
}
export declare const SpaceSchema: import("mongoose").Schema<Space, import("mongoose").Model<Space, any, any, any, Document<unknown, any, Space, any, {}> & Space & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Space, Document<unknown, {}, import("mongoose").FlatRecord<Space>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Space> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
