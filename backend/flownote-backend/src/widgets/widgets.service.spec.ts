import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { WidgetsService } from './widgets.service';
import { Widget } from './schemas/widget.schema';
import { createMockModel } from '../../test/helpers/model.mock';

describe('WidgetsService', () => {
  let service: WidgetsService;
  const widgetModel = createMockModel();

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WidgetsService,
        { provide: getModelToken(Widget.name), useValue: widgetModel },
      ],
    }).compile();

    service = module.get<WidgetsService>(WidgetsService);
  });

  describe('crear', () => {
    it('crea widget con nota_id', async () => {
      const notaId = new Types.ObjectId().toString();
      widgetModel.create.mockResolvedValue({ tipo: 'texto', nota_id: notaId });

      const result = await service.crear({ tipo: 'texto', nota_id: notaId });

      expect(widgetModel.create).toHaveBeenCalled();
      expect(result.tipo).toBe('texto');
    });

    it('lanza BadRequestException sin nota_id ni espacio_id', async () => {
      await expect(service.crear({ tipo: 'texto' })).rejects.toThrow(BadRequestException);
    });
  });

  describe('actualizarPosicion', () => {
    it('actualiza posición para drag and drop', async () => {
      widgetModel.findByIdAndUpdate.mockResolvedValue({ x: 50, y: 80 });

      const result = await service.actualizarPosicion('wid1', { x: 50, y: 80 });

      expect(result.x).toBe(50);
    });

    it('lanza NotFoundException si no existe', async () => {
      widgetModel.findByIdAndUpdate.mockResolvedValue(null);

      await expect(
        service.actualizarPosicion('invalid', { x: 0, y: 0 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('eliminar', () => {
    it('elimina widget existente', async () => {
      widgetModel.findByIdAndDelete.mockResolvedValue({ _id: 'wid1' });

      const result = await service.eliminar('wid1');

      expect(result.mensaje).toContain('eliminado');
    });
  });
});
