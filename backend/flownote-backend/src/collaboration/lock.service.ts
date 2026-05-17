import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CollaborationLock, CollaborationLockDocument } from './schemas/collaboration-lock.schema';
import { LockResourceType } from './collaboration.types';

export interface LockHolder {
  userId: string;
  userName: string;
  socketId: string;
}

export interface AcquireLockResult {
  acquired: boolean;
  lock?: CollaborationLockDocument;
  conflict?: {
    holder_id: string;
    holder_nombre: string;
    expires_at: Date;
  };
}

@Injectable()
export class LockService {
  private readonly logger = new Logger(LockService.name);
  private readonly ttlMs: number;

  constructor(
    @InjectModel(CollaborationLock.name)
    private lockModel: Model<CollaborationLockDocument>,
  ) {
    this.ttlMs = Number(process.env.LOCK_TTL_MS) || 30_000;
  }

  getTtlMs(): number {
    return this.ttlMs;
  }

  async acquire(
    room: string,
    resourceType: LockResourceType,
    resourceId: string,
    holder: LockHolder,
  ): Promise<AcquireLockResult> {
    await this.expireStaleLocks();

    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.ttlMs);

    const existente = await this.lockModel.findOne({
      room,
      resource_type: resourceType,
      resource_id: resourceId,
    });

    if (existente) {
      if (existente.expires_at <= now) {
        await existente.deleteOne();
      } else if (
        existente.holder_id.toString() !== holder.userId
        || existente.socket_id !== holder.socketId
      ) {
        return {
          acquired: false,
          conflict: {
            holder_id: existente.holder_id.toString(),
            holder_nombre: existente.holder_nombre,
            expires_at: existente.expires_at,
          },
        };
      } else {
        existente.expires_at = expiresAt;
        existente.last_renewed_at = now;
        await existente.save();
        return { acquired: true, lock: existente };
      }
    }

    try {
      const lock = await this.lockModel.create({
        room,
        resource_type: resourceType,
        resource_id: resourceId,
        holder_id: new Types.ObjectId(holder.userId),
        holder_nombre: holder.userName,
        socket_id: holder.socketId,
        expires_at: expiresAt,
        last_renewed_at: now,
      });
      return { acquired: true, lock };
    } catch {
      const conflicto = await this.lockModel.findOne({
        room,
        resource_type: resourceType,
        resource_id: resourceId,
      });
      if (!conflicto) return { acquired: false };
      return {
        acquired: false,
        conflict: {
          holder_id: conflicto.holder_id.toString(),
          holder_nombre: conflicto.holder_nombre,
          expires_at: conflicto.expires_at,
        },
      };
    }
  }

  async renew(
    room: string,
    resourceType: LockResourceType,
    resourceId: string,
    holder: LockHolder,
  ): Promise<{ renewed: boolean; lock?: CollaborationLockDocument }> {
    const now = new Date();
    const lock = await this.lockModel.findOne({
      room,
      resource_type: resourceType,
      resource_id: resourceId,
      holder_id: new Types.ObjectId(holder.userId),
      socket_id: holder.socketId,
    });

    if (!lock || lock.expires_at <= now) {
      if (lock) await lock.deleteOne();
      return { renewed: false };
    }

    lock.expires_at = new Date(now.getTime() + this.ttlMs);
    lock.last_renewed_at = now;
    await lock.save();
    return { renewed: true, lock };
  }

  async release(
    room: string,
    resourceType: LockResourceType,
    resourceId: string,
    holder: LockHolder,
    force = false,
  ): Promise<boolean> {
    const filtro: Record<string, unknown> = {
      room,
      resource_type: resourceType,
      resource_id: resourceId,
    };
    if (!force) {
      filtro.holder_id = new Types.ObjectId(holder.userId);
      filtro.socket_id = holder.socketId;
    }
    const result = await this.lockModel.deleteOne(filtro);
    return result.deletedCount > 0;
  }

  async releaseAllForSocket(socketId: string): Promise<number> {
    const result = await this.lockModel.deleteMany({ socket_id: socketId });
    return result.deletedCount;
  }

  async listByRoom(room: string): Promise<CollaborationLockDocument[]> {
    await this.expireStaleLocks();
    return this.lockModel.find({ room, expires_at: { $gt: new Date() } });
  }

  async expireStaleLocks(): Promise<number> {
    const result = await this.lockModel.deleteMany({
      expires_at: { $lte: new Date() },
    });
    if (result.deletedCount > 0) {
      this.logger.debug(`Locks expirados liberados: ${result.deletedCount}`);
    }
    return result.deletedCount;
  }
}
