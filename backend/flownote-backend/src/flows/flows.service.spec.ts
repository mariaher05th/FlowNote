import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { FlowsService } from './flows.service';
import { FlowDashboard } from './schemas/flow.schema';
import { createMockModel } from '../../test/helpers/model.mock';

describe('FlowsService', () => {
  let service: FlowsService;
  const flowModel = createMockModel();

  const notaId = new Types.ObjectId();
  const nota = {
    _id: notaId,
    titulo: 'Mi flujo',
    estado: 'pendiente',
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FlowsService,
        { provide: getModelToken(FlowDashboard.name), useValue: flowModel },
      ],
    }).compile();

    service = module.get<FlowsService>(FlowsService);
  });

  describe('crearDesdeNota', () => {
    it('crea dashboard con nodo inicial', async () => {
      flowModel.findOne.mockResolvedValue(null);
      flowModel.create.mockResolvedValue({ nota_id: notaId, nodos: [{}] });

      const result = await service.crearDesdeNota(nota as any);

      expect(flowModel.create).toHaveBeenCalled();
      expect(result.nota_id).toEqual(notaId);
    });

    it('retorna dashboard existente sin duplicar', async () => {
      const existente = { nota_id: notaId, nodos: [{ id: '1' }] };
      flowModel.findOne.mockResolvedValue(existente);

      const result = await service.crearDesdeNota(nota as any);

      expect(result).toBe(existente);
      expect(flowModel.create).not.toHaveBeenCalled();
    });
  });

  describe('porNota', () => {
    it('lanza NotFoundException si no hay dashboard', async () => {
      flowModel.findOne.mockResolvedValue(null);

      await expect(service.porNota(notaId.toString())).rejects.toThrow(NotFoundException);
    });
  });

  describe('actualizar', () => {
    it('actualiza nodos y conexiones', async () => {
      const dashboard = {
        nodos: [],
        conexiones: [],
        save: jest.fn().mockResolvedValue({ nodos: [{ id: 'n1' }] }),
      };
      flowModel.findOne.mockResolvedValue(dashboard);

      const result = await service.actualizar(notaId.toString(), {
        nodos: [{ id: 'n1', etiqueta: 'Tarea', tipo: 'tarea' }],
      });

      expect(dashboard.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });
});
