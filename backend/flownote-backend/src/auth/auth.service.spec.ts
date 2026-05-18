import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { User } from './schemas/user.schema';
import { createMockModel } from '../../test/helpers/model.mock';

jest.mock('bcryptjs');

describe('AuthService', () => {
  let service: AuthService;
  const userModel = createMockModel();
  const jwtService = { sign: jest.fn().mockReturnValue('jwt-token') };

  const userId = new Types.ObjectId();
  const usuarioMock = {
    _id: userId,
    nombre: 'Ana',
    apellido: 'García',
    username: 'ana_g',
    email: 'ana@test.com',
    contrasena_hash: 'hash',
    tema_interfaz: 'claro',
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getModelToken(User.name), useValue: userModel },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    const dto = {
      nombre: 'Ana',
      apellido: 'García',
      username: 'ana_g',
      email: 'ana@test.com',
      contrasena: 'password123',
    };

    it('registra un usuario nuevo', async () => {
      userModel.findOne.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      userModel.create.mockResolvedValue(usuarioMock);

      const result = await service.register(dto);

      expect(result.token).toBe('jwt-token');
      expect(result.usuario.email).toBe(dto.email);
      expect(userModel.create).toHaveBeenCalled();
    });

    it('lanza ConflictException si el email existe', async () => {
      userModel.findOne.mockResolvedValue(usuarioMock);

      await expect(service.register(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    const dto = { email: 'ana@test.com', contrasena: 'password123' };

    it('inicia sesión con credenciales válidas', async () => {
      userModel.findOne.mockResolvedValue(usuarioMock);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login(dto);

      expect(result.token).toBe('jwt-token');
      expect(result.usuario.email).toBe(dto.email);
    });

    it('lanza UnauthorizedException si el usuario no existe', async () => {
      userModel.findOne.mockResolvedValue(null);

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });

    it('lanza UnauthorizedException si la contraseña es incorrecta', async () => {
      userModel.findOne.mockResolvedValue(usuarioMock);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('actualizarTema', () => {
    it('actualiza el tema con valor válido', async () => {
      userModel.findByIdAndUpdate.mockReturnValue({
        select: jest.fn().mockResolvedValue({ ...usuarioMock, tema_interfaz: 'oscuro' }),
      });

      const result = await service.actualizarTema(userId.toString(), { tema: 'oscuro' });

      expect(result.mensaje).toBe('Tema actualizado');
    });

    it('lanza ConflictException con tema inválido', async () => {
      await expect(
        service.actualizarTema(userId.toString(), { tema: 'neon' }),
      ).rejects.toThrow(ConflictException);
    });
  });
});
