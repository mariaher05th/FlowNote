import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model, Types } from 'mongoose';
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
    const existeEmail = await this.userModel.findOne({ email: dto.email });
    if (existeEmail) throw new ConflictException('El correo ya está registrado');

    const existeUsername = await this.userModel.findOne({ username: dto.username });
    if (existeUsername) throw new ConflictException('El nombre de usuario ya está en uso');

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
    const usuario = await this.userModel.findOne({ username: dto.username });
    if (!usuario) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos');
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

  async buscarUsuarios(
    q: string,
    excludeUserId: string,
  ): Promise<{ _id: string; nombre: string; apellido: string; username: string }[]> {
    const term = q.trim().replace(/^@+/, '');
    if (!term) return [];

    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const filtro: Record<string, unknown> = {
      $or: [
        { username: { $regex: escaped, $options: 'i' } },
        { nombre: { $regex: escaped, $options: 'i' } },
        { apellido: { $regex: escaped, $options: 'i' } },
      ],
    };

    if (excludeUserId && Types.ObjectId.isValid(excludeUserId)) {
      filtro._id = { $ne: new Types.ObjectId(excludeUserId) };
    }

    const usuarios = await this.userModel
      .find(filtro)
      .select('_id nombre apellido username')
      .limit(8)
      .lean();

    return usuarios.map(u => ({
      ...u,
      _id: u._id.toString(),
    }));
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
      id: usuario._id.toString(),
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      username: usuario.username,
      email: usuario.email,
      tema_interfaz: usuario.tema_interfaz,
    };
  }

  private generarToken(usuario: UserDocument) {
    return this.jwtService.sign({
      sub: usuario._id.toString(),
      email: usuario.email,
      nombre: usuario.nombre,
      username: usuario.username,
    });
  }
}
