import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { AccessService } from './access.service';
import { Note } from '../../notes/schemas/note.schema';
import { Space } from '../../spaces/schemas/space.schema';
import { createMockModel } from '../../../test/helpers/model.mock';

describe('AccessService', () => {
  let service: AccessService;
  const noteModel = createMockModel();
  const spaceModel = createMockModel();

  const userId = new Types.ObjectId().toString();
  const otroId = new Types.ObjectId().toString();
  const espacioId = new Types.ObjectId();

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccessService,
        { provide: getModelToken(Note.name), useValue: noteModel },
        { provide: getModelToken(Space.name), useValue: spaceModel },
      ],
    }).compile();

    service = module.get<AccessService>(AccessService);
  });

  const notaBase = (overrides: Record<string, unknown> = {}) => ({
    autor_id: { toString: () => userId },
    es_colaborativa: false,
    espacio_id: null,
    ...overrides,
  });

  describe('obtenerRolEnEspacio', () => {
    it('retorna null si no hay espacio', async () => {
      expect(await service.obtenerRolEnEspacio(null, userId)).toBeNull();
    });

    it('retorna el rol del miembro', async () => {
      spaceModel.findById.mockResolvedValue({
        miembros: [{ usuario_id: { toString: () => userId }, rol: 'editor' }],
      });

      const rol = await service.obtenerRolEnEspacio(espacioId, userId);
      expect(rol).toBe('editor');
    });
  });

  describe('puedeLeerNota', () => {
    it('autor siempre puede leer', async () => {
      const ok = await service.puedeLeerNota(notaBase() as any, userId);
      expect(ok).toBe(true);
    });

    it('cualquiera puede leer nota colaborativa', async () => {
      const ok = await service.puedeLeerNota(
        notaBase({ autor_id: { toString: () => otroId }, es_colaborativa: true }) as any,
        userId,
      );
      expect(ok).toBe(true);
    });

    it('miembro del espacio puede leer', async () => {
      spaceModel.findById.mockResolvedValue({
        miembros: [{ usuario_id: { toString: () => userId }, rol: 'observador' }],
      });
      const ok = await service.puedeLeerNota(
        notaBase({
          autor_id: { toString: () => otroId },
          espacio_id: espacioId,
        }) as any,
        userId,
      );
      expect(ok).toBe(true);
    });

    it('usuario ajeno no puede leer nota privada', async () => {
      const ok = await service.puedeLeerNota(
        notaBase({ autor_id: { toString: () => otroId } }) as any,
        userId,
      );
      expect(ok).toBe(false);
    });
  });

  describe('puedeEditarNota', () => {
    it('editor del espacio puede editar', async () => {
      spaceModel.findById.mockResolvedValue({
        miembros: [{ usuario_id: { toString: () => userId }, rol: 'editor' }],
      });
      const ok = await service.puedeEditarNota(
        notaBase({
          autor_id: { toString: () => otroId },
          espacio_id: espacioId,
        }) as any,
        userId,
      );
      expect(ok).toBe(true);
    });

    it('observador no puede editar', async () => {
      spaceModel.findById.mockResolvedValue({
        miembros: [{ usuario_id: { toString: () => userId }, rol: 'observador' }],
      });
      const ok = await service.puedeEditarNota(
        notaBase({
          autor_id: { toString: () => otroId },
          espacio_id: espacioId,
        }) as any,
        userId,
      );
      expect(ok).toBe(false);
    });
  });

  describe('idsEspaciosDelUsuario', () => {
    it('retorna ids de espacios donde es miembro', async () => {
      const id1 = new Types.ObjectId();
      spaceModel.find.mockReturnValue({
        select: jest.fn().mockResolvedValue([{ _id: id1 }]),
      });

      const ids = await service.idsEspaciosDelUsuario(userId);
      expect(ids).toEqual([id1]);
    });
  });
});
