import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<{
        mensaje: string;
        token: string;
        usuario: {
            id: import("mongoose").Types.ObjectId;
            nombre: string;
            email: string;
        };
    }>;
    login(dto: LoginDto): Promise<{
        token: string;
        usuario: {
            id: import("mongoose").Types.ObjectId;
            nombre: string;
            email: string;
        };
    }>;
    perfil(req: any): Promise<import("mongoose").Document<unknown, {}, import("./schemas/user.schema").UserDocument, {}, {}> & import("./schemas/user.schema").User & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
}
