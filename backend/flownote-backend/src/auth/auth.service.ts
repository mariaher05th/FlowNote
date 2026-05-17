import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from './schemas/user.schema';
import { RegisterDto, LoginDto, UpdateThemeDto } from './dto/auth.dto';

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
      apellido: dto.apellido,
      username: dto.username,
      email: dto.email,
      contrasena_hash: hash,
    });

    const token = this.generarToken(usuario);
    return {
      mensaje: `Bienvenido/a, ${usuario.nombre}!`,
      token,
      usuario: this.mapUsuario(usuario),
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
      usuario: this.mapUsuario(usuario),
    };
  }

  async perfil(userId: string) {
    return this.userModel.findById(userId).select('-contrasena_hash');
  }

  async actualizarTema(userId: string, dto: UpdateThemeDto) {
    const temasValidos = ['claro', 'oscuro', 'sistema'];
    if (!temasValidos.includes(dto.tema)) {
      throw new ConflictException(`Tema inválido. Usa: ${temasValidos.join(', ')}`);
    }
    const usuario = await this.userModel.findByIdAndUpdate(
      userId,
      { tema_interfaz: dto.tema },
      { new: true },
    ).select('-contrasena_hash');
    return { mensaje: 'Tema actualizado', usuario };
  }

  private mapUsuario(usuario: UserDocument) {
    return {
      id: usuario._id,
      nombre: usuario.nombre,
      email: usuario.email,
      tema_interfaz: usuario.tema_interfaz,
    };
  }

  private generarToken(usuario: UserDocument) {
    return this.jwtService.sign({
      sub: usuario._id,
      email: usuario.email,
      nombre: usuario.nombre,
    });
  }
}
