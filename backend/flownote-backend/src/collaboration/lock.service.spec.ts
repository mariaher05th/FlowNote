import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { LockService } from './lock.service';
import { CollaborationLock } from './schemas/collaboration-lock.schema';
import { createMockModel } from '../../test/helpers/model.mock';

describe('LockService', () => {
  let service: LockService;
  const lockModel = createMockModel();

  const holder = {
    userId: new Types.ObjectId().toString(),
    userName: 'Ana',
    socketId: 'socket-1',
  };

  const room = 'nota:abc123';
  const resourceType = 'flow_node' as const;
  const resourceId = 'node-1';

  beforeEach(async () => {
    jest.clearAllMocks();
    process.env.LOCK_TTL_MS = '30000';

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LockService,
        { provide: getModelToken(CollaborationLock.name), useValue: lockModel },
      ],
    }).compile();

    service = module.get<LockService>(LockService);
    lockModel.deleteMany.mockResolvedValue({ deletedCount: 0 });
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
    expect(service.getTtlMs()).toBe(30000);
  });

  describe('acquire', () => {
    it('crea un lock cuando no existe', async () => {
      lockModel.findOne.mockResolvedValue(null);
      const nuevoLock = { _id: 'lock1', expires_at: new Date(Date.now() + 30000) };
      lockModel.create.mockResolvedValue(nuevoLock);

      const result = await service.acquire(room, resourceType, resourceId, holder);

      expect(result.acquired).toBe(true);
      expect(result.lock).toEqual(nuevoLock);
      expect(lockModel.create).toHaveBeenCalled();
    });

    it('deniega si otro usuario tiene el lock activo', async () => {
      const otroId = new Types.ObjectId();
      lockModel.findOne.mockResolvedValue({
        holder_id: otroId,
        holder_nombre: 'Bob',
        socket_id: 'socket-2',
        expires_at: new Date(Date.now() + 60000),
      });

      const result = await service.acquire(room, resourceType, resourceId, holder);

      expect(result.acquired).toBe(false);
      expect(result.conflict?.holder_nombre).toBe('Bob');
    });

    it('renueva el lock si el mismo holder lo tiene', async () => {
      const existente = {
        holder_id: new Types.ObjectId(holder.userId),
        holder_nombre: holder.userName,
        socket_id: holder.socketId,
        expires_at: new Date(Date.now() + 60000),
        save: jest.fn().mockResolvedValue(true),
      };
      lockModel.findOne.mockResolvedValue(existente);

      const result = await service.acquire(room, resourceType, resourceId, holder);

      expect(result.acquired).toBe(true);
      expect(existente.save).toHaveBeenCalled();
    });
  });

  describe('renew', () => {
    it('renueva un lock válido del mismo holder', async () => {
      const lock = {
        expires_at: new Date(Date.now() + 10000),
        save: jest.fn().mockResolvedValue(true),
      };
      lockModel.findOne.mockResolvedValue(lock);

      const result = await service.renew(room, resourceType, resourceId, holder);

      expect(result.renewed).toBe(true);
      expect(lock.save).toHaveBeenCalled();
    });

    it('falla si el lock no existe o expiró', async () => {
      lockModel.findOne.mockResolvedValue(null);

      const result = await service.renew(room, resourceType, resourceId, holder);

      expect(result.renewed).toBe(false);
    });
  });

  describe('release', () => {
    it('libera el lock del holder', async () => {
      lockModel.deleteOne.mockResolvedValue({ deletedCount: 1 });

      const released = await service.release(room, resourceType, resourceId, holder);

      expect(released).toBe(true);
    });
  });

  describe('expireStaleLocks', () => {
    it('elimina locks vencidos', async () => {
      lockModel.deleteMany.mockResolvedValue({ deletedCount: 3 });

      const count = await service.expireStaleLocks();

      expect(count).toBe(3);
      expect(lockModel.deleteMany).toHaveBeenCalledWith({
        expires_at: { $lte: expect.any(Date) },
      });
    });
  });

  describe('releaseAllForSocket', () => {
    it('libera todos los locks de un socket', async () => {
      lockModel.deleteMany.mockResolvedValue({ deletedCount: 2 });

      const count = await service.releaseAllForSocket('socket-1');

      expect(count).toBe(2);
      expect(lockModel.deleteMany).toHaveBeenCalledWith({ socket_id: 'socket-1' });
    });
  });
});
