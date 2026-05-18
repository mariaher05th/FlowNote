import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { DrawingService } from './drawing.service';
import { DrawingLayer } from './schemas/drawing.schema';
import { createMockModel } from '../../test/helpers/model.mock';

describe('DrawingService', () => {
  let service: DrawingService;
  const drawingModel = createMockModel();

  const notaId = new Types.ObjectId().toString();

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DrawingService,
        { provide: getModelToken(DrawingLayer.name), useValue: drawingModel },
      ],
    }).compile();

    service = module.get<DrawingService>(DrawingService);
  });

  describe('obtener', () => {
    it('crea capa vacía si no existe', async () => {
      drawingModel.findOne.mockResolvedValue(null);
      drawingModel.create.mockResolvedValue({ nota_id: notaId, trazos: [] });

      const result = await service.obtener(notaId);

      expect(drawingModel.create).toHaveBeenCalled();
      expect(result.trazos).toEqual([]);
    });

    it('retorna capa existente', async () => {
      const capa = { nota_id: notaId, trazos: [{ puntos: [] }] };
      drawingModel.findOne.mockResolvedValue(capa);

      const result = await service.obtener(notaId);

      expect(result).toBe(capa);
      expect(drawingModel.create).not.toHaveBeenCalled();
    });
  });

  describe('agregarTrazo', () => {
    it('añade trazo a la capa', async () => {
      const capa = {
        trazos: [],
        save: jest.fn().mockResolvedValue({ trazos: [{ puntos: [{ x: 1, y: 2 }] }] }),
      };
      drawingModel.findOne.mockResolvedValue(capa);

      const result = await service.agregarTrazo(notaId, {
        trazo: { puntos: [{ x: 1, y: 2 }], color: '#ff0000', grosor: 3 },
      });

      expect(capa.trazos).toHaveLength(1);
      expect(capa.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('limpiar', () => {
    it('vacía trazos y svg', async () => {
      drawingModel.findOneAndUpdate.mockResolvedValue({ trazos: [], svg_data: '' });

      const result = await service.limpiar(notaId);

      expect(result.trazos).toEqual([]);
      expect(drawingModel.findOneAndUpdate).toHaveBeenCalled();
    });
  });
});
