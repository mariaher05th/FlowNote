import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { RegisterDto, LoginDto } from './dto/auth.dto';
export declare class AuthService {
    private userModel;
    private jwtService;
    constructor(userModel: Model<UserDocument>, jwtService: JwtService);
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
    perfil(userId: string): Promise<import("mongoose").Document<unknown, {}, UserDocument, {}, {}> & User & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    private generarToken;
}
