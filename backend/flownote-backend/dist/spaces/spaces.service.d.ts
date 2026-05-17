import { Model, Types } from 'mongoose';
import { Space, SpaceDocument } from './schemas/space.schema';
import { CreateSpaceDto, InviteMemberDto, UpdateMemberRoleDto } from './dto/space.dto';
export declare class SpacesService {
    private spaceModel;
    constructor(spaceModel: Model<SpaceDocument>);
    crear(dto: CreateSpaceDto, userId: string): Promise<SpaceDocument>;
    misEspacios(userId: string): Promise<SpaceDocument[]>;
    obtenerUno(id: string, userId: string): Promise<SpaceDocument>;
    invitar(id: string, dto: InviteMemberDto, userId: string): Promise<SpaceDocument>;
    cambiarRol(espacioId: string, miembroId: string, dto: UpdateMemberRoleDto, userId: string): Promise<SpaceDocument>;
    eliminarMiembro(espacioId: string, miembroId: string, userId: string): Promise<import("mongoose").Document<unknown, {}, SpaceDocument, {}, {}> & Space & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
}
