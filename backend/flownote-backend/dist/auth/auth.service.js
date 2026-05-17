"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const jwt_1 = require("@nestjs/jwt");
const mongoose_2 = require("mongoose");
const bcrypt = require("bcryptjs");
const user_schema_1 = require("./schemas/user.schema");
let AuthService = class AuthService {
    constructor(userModel, jwtService) {
        this.userModel = userModel;
        this.jwtService = jwtService;
    }
    async register(dto) {
        const existe = await this.userModel.findOne({ email: dto.email });
        if (existe) {
            throw new common_1.ConflictException('El correo ya está registrado');
        }
        const hash = await bcrypt.hash(dto.contrasena, 10);
        const usuario = await this.userModel.create({
            nombre: dto.nombre,
            email: dto.email,
            contrasena_hash: hash,
        });
        const token = this.generarToken(usuario);
        return {
            mensaje: `Bienvenido/a, ${usuario.nombre}!`,
            token,
            usuario: { id: usuario._id, nombre: usuario.nombre, email: usuario.email },
        };
    }
    async login(dto) {
        const usuario = await this.userModel.findOne({ email: dto.email });
        if (!usuario) {
            throw new common_1.UnauthorizedException('Credenciales incorrectas');
        }
        const valida = await bcrypt.compare(dto.contrasena, usuario.contrasena_hash);
        if (!valida) {
            throw new common_1.UnauthorizedException('Credenciales incorrectas');
        }
        const token = this.generarToken(usuario);
        return {
            token,
            usuario: { id: usuario._id, nombre: usuario.nombre, email: usuario.email },
        };
    }
    async perfil(userId) {
        return this.userModel.findById(userId).select('-contrasena_hash');
    }
    generarToken(usuario) {
        return this.jwtService.sign({
            sub: usuario._id,
            email: usuario.email,
            nombre: usuario.nombre,
        });
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map