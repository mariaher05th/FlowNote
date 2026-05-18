import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { Types } from 'mongoose';
import { RemindersService } from './reminders.service';
import { Reminder } from './schemas/reminder.schema';
import { createMockModel } from '../../test/helpers/model.mock';

describe('RemindersService', () => {
  let service: RemindersService;
  const reminderModel = createMockModel();

  const userId = new Types.ObjectId().toString();
  const otroId = new Types.ObjectId().toString();
  const reminderId = new Types.ObjectId();

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RemindersService,
        { provide: getModelToken(Reminder.name), useValue: reminderModel },
      ],
    }).compile();

    service = module.get<RemindersService>(RemindersService);
  });

  describe('crear', () => {
    it('crea un recordatorio', async () => {
      const dto = {
        nota_id: new Types.ObjectId().toString(),
        mensaje: 'Revisar nota',
        fecha_hora: new Date().toISOString(),
      };
      reminderModel.create.mockResolvedValue({ _id: reminderId, ...dto });

      const result = await service.crear(dto, userId);

      expect(reminderModel.create).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('actualizar', () => {
    it('actualiza si es el dueño', async () => {
      reminderModel.findById.mockResolvedValue({
        usuario_id: { toString: () => userId },
      });
      reminderModel.findByIdAndUpdate.mockResolvedValue({ _id: reminderId });

      const result = await service.actualizar(
        reminderId.toString(),
        { mensaje: 'Nuevo mensaje' },
        userId,
      );

      expect(result).toBeDefined();
    });

    it('lanza ForbiddenException si no es el dueño', async () => {
      reminderModel.findById.mockResolvedValue({
        usuario_id: { toString: () => otroId },
      });

      await expect(
        service.actualizar(reminderId.toString(), { mensaje: 'x' }, userId),
      ).rejects.toThrow(ForbiddenException);
    });

    it('lanza NotFoundException si no existe', async () => {
      reminderModel.findById.mockResolvedValue(null);

      await expect(
        service.actualizar(reminderId.toString(), { mensaje: 'x' }, userId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('eliminar', () => {
    it('elimina si es el dueño', async () => {
      reminderModel.findById.mockResolvedValue({
        usuario_id: { toString: () => userId },
      });
      reminderModel.findByIdAndDelete.mockResolvedValue({});

      const result = await service.eliminar(reminderId.toString(), userId);

      expect(result.mensaje).toContain('eliminado');
    });
  });

  describe('marcarEnviado', () => {
    it('marca el recordatorio como enviado', async () => {
      reminderModel.findByIdAndUpdate.mockResolvedValue({ enviado: true });

      const result = await service.marcarEnviado(reminderId.toString());

      expect(result.enviado).toBe(true);
    });
  });
});
