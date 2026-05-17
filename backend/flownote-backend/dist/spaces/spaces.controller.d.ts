import { SpacesService } from './spaces.service';
import { CreateSpaceDto, InviteMemberDto, UpdateMemberRoleDto } from './dto/space.dto';
export declare class SpacesController {
    private readonly spacesService;
    constructor(spacesService: SpacesService);
    crear(dto: CreateSpaceDto, req: any): Promise<import("./schemas/space.schema").SpaceDocument>;
    misEspacios(req: any): Promise<import("./schemas/space.schema").SpaceDocument[]>;
    obtenerUno(id: string, req: any): Promise<import("./schemas/space.schema").SpaceDocument>;
    invitar(id: string, dto: InviteMemberDto, req: any): Promise<import("./schemas/space.schema").SpaceDocument>;
    cambiarRol(id: string, miembroId: string, dto: UpdateMemberRoleDto, req: any): Promise<import("./schemas/space.schema").SpaceDocument>;
    eliminarMiembro(id: string, miembroId: string, req: any): Promise<import("mongoose").Document<unknown, {}, import("./schemas/space.schema").SpaceDocument, {}, {}> & import("./schemas/space.schema").Space & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
}
