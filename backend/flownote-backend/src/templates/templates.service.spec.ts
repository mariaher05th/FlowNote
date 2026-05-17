import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { TemplatesService } from './templates.service';
import { Template } from './schemas/template.schema';
import { createMockModel } from '../../test/helpers/model.mock';

describe('TemplatesService', () => {
  let service: TemplatesService;
  const templateModel = createMockModel();

  const userId = new Types.ObjectId().toString();
  const otroId = new Types.ObjectId().toString();
  const templateId = new Types.ObjectId();

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TemplatesService,
        { provide: getModelToken(Template.name), useValue: templateModel },
      ],
    }).compile();

    service = module.get<TemplatesService>(TemplatesService);
  });

  describe('onModuleInit', () => {
    it('inserta plantillas del sistema si no existen', async () => {
      templateModel.countDocuments.mockResolvedValue(0);
      templateModel.insertMany.mockResolvedValue([]);

      await service.onModuleInit();

      expect(templateModel.insertMany).toHaveBeenCalled();
    });

    it('no inserta si ya hay plantillas de sistema', async () => {
      templateModel.countDocuments.mockResolvedValue(4);

      await service.onModuleInit();

      expect(templateModel.insertMany).not.toHaveBeenCalled();
    });
  });

  describe('obtener', () => {
    it('permite acceso a plantilla del sistema', async () => {
      templateModel.findById.mockResolvedValue({
        es_sistema: true,
        autor_id: null,
      });

      const result = await service.obtener(templateId.toString(), userId);
      expect(result.es_sistema).toBe(true);
    });

    it('deniega plantilla privada de otro usuario', async () => {
      templateModel.findById.mockResolvedValue({
        es_sistema: false,
        autor_id: { toString: () => otroId },
      });

      await expect(service.obtener(templateId.toString(), userId)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('lanza NotFoundException si no existe', async () => {
      templateModel.findById.mockResolvedValue(null);

      await expect(service.obtener(templateId.toString(), userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('eliminar', () => {
    it('no permite eliminar plantillas del sistema', async () => {
      templateModel.findById.mockResolvedValue({
        es_sistema: true,
        autor_id: null,
      });

      await expect(service.eliminar(templateId.toString(), userId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
