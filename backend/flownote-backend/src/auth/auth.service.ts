import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from './schemas/user.schema';
import { RegisterDto, LoginDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    // Verificar si el correo ya existe
    const existe = await this.userModel.findOne({ email: dto.email });
    if (existe) {
      throw new ConflictException('El correo ya está registrado');
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

  async login(dto: LoginDto) {
    const usuario = await this.userModel.findOne({ email: dto.email });
    if (!usuario) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const valida = await bcrypt.compare(dto.contrasena, usuario.contrasena_hash);
    if (!valida) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const token = this.generarToken(usuario);
    return {
      token,
      usuario: { id: usuario._id, nombre: usuario.nombre, email: usuario.email },
    };
  }

  async perfil(userId: string) {
    return this.userModel.findById(userId).select('-contrasena_hash');
  }

  private generarToken(usuario: UserDocument) {
    return this.jwtService.sign({
      sub: usuario._id,
      email: usuario.email,
      nombre: usuario.nombre,
    });
  }
}
