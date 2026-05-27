import { io, Socket } from 'socket.io-client';
import { COLLAB_EVENTS, type RoomType } from './collaboration.types';
import type { LockResourceType } from './collaboration.types';

export function getWsBaseUrl(): string {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  return apiUrl.replace(/\/api\/?$/, '');
}

export interface PresenceUser {
  socketId: string;
  userId?: string;
  nombre?: string;
}

export interface ActiveLock {
  resourceType: LockResourceType;
  resourceId: string;
  holderId: string;
  holderNombre: string;
  socketId: string;
  expiresAt: string;
}

export function normalizeLock(raw: Record<string, unknown>): ActiveLock | null {
  if (!raw?.resourceType || !raw?.resourceId) return null;
  const holder = raw.holder as { userId?: string; nombre?: string } | undefined;
  const expiresAt = raw.expiresAt;
  return {
    resourceType: raw.resourceType as LockResourceType,
    resourceId: String(raw.resourceId),
    holderId: String(raw.holderId ?? holder?.userId ?? ''),
    holderNombre: String(raw.holderNombre ?? holder?.nombre ?? 'Usuario'),
    socketId: String(raw.socketId ?? ''),
    expiresAt: expiresAt instanceof Date
      ? expiresAt.toISOString()
      : String(expiresAt ?? ''),
  };
}

type AckResponse = { event: string; data?: Record<string, unknown> };

const ACK_TIMEOUT_MS = 12_000;

class CollaborationService {
  private socket: Socket | null = null;
  private renewTimer: ReturnType<typeof setInterval> | null = null;
  private activeLocks: { roomType: RoomType; roomId: string; resourceType: LockResourceType; resourceId: string }[] = [];
  private activeRoom: { roomType: RoomType; roomId: string } | null = null;
  private roomJoined = false;
  private authReady = false;
  private authReadyWaiters: Array<{ resolve: () => void; reject: (e: Error) => void }> = [];

  connect(): Socket {
    if (this.socket) {
      if (!this.socket.connected) this.socket.connect();
      return this.socket;
    }

    const token = localStorage.getItem('token');
    this.socket = io(`${getWsBaseUrl()}/collaboration`, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 15,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      this.authReady = false;
      this.roomJoined = false;
    });

    this.socket.on('disconnect', () => {
      this.authReady = false;
      this.roomJoined = false;
    });

    this.socket.on(COLLAB_EVENTS.connected, () => {
      this.authReady = true;
      this.flushAuthWaiters();
      if (this.activeRoom) {
        this.joinRoom(this.activeRoom.roomType, this.activeRoom.roomId).catch(() => {});
      }
    });

    this.socket.on('connect_error', () => {
      this.authReady = false;
      this.rejectAuthWaiters(new Error('Error de conexión WebSocket'));
    });

    return this.socket;
  }

  private flushAuthWaiters() {
    const waiters = [...this.authReadyWaiters];
    this.authReadyWaiters = [];
    waiters.forEach(w => w.resolve());
  }

  private rejectAuthWaiters(err: Error) {
    const waiters = [...this.authReadyWaiters];
    this.authReadyWaiters = [];
    waiters.forEach(w => w.reject(err));
  }

  private waitForAuth(): Promise<void> {
    if (this.authReady && this.socket?.connected) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const entry = { resolve, reject };
      this.authReadyWaiters.push(entry);
      setTimeout(() => {
        const idx = this.authReadyWaiters.indexOf(entry);
        if (idx >= 0) {
          this.authReadyWaiters.splice(idx, 1);
          reject(new Error('Tiempo de espera agotado al autenticar WebSocket'));
        }
      }, ACK_TIMEOUT_MS);
    });
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  isRoomJoined(): boolean {
    return this.roomJoined && !!this.socket?.connected;
  }

  isAuthReady(): boolean {
    return this.authReady && !!this.socket?.connected;
  }

  disconnect() {
    if (this.renewTimer) {
      clearInterval(this.renewTimer);
      this.renewTimer = null;
    }
    this.activeLocks = [];
    this.activeRoom = null;
    this.roomJoined = false;
    this.authReady = false;
    this.rejectAuthWaiters(new Error('Desconectado'));
    this.socket?.disconnect();
    this.socket = null;
  }

  private emitAck<T = AckResponse>(event: string, payload: Record<string, unknown>): Promise<T> {
    return new Promise((resolve, reject) => {
      const socket = this.connect();
      let settled = false;

      const finish = (fn: () => void) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        fn();
      };

      const timer = setTimeout(() => {
        finish(() => reject(new Error(`Sin respuesta del servidor (${event})`)));
      }, ACK_TIMEOUT_MS);

      const emit = () => {
        socket.emit(event, payload, (res: T) => {
          finish(() => resolve(res));
        });
      };

      const run = async () => {
        try {
          await this.waitForAuth();
          if (!socket.connected) {
            socket.once('connect', emit);
            return;
          }
          emit();
        } catch (e) {
          finish(() => reject(e instanceof Error ? e : new Error(String(e))));
        }
      };

      run();
    });
  }

  async joinRoom(roomType: RoomType, roomId: string) {
    this.activeRoom = { roomType, roomId };
    this.roomJoined = false;

    await this.waitForAuth();
    const socket = this.connect();

    const res = await new Promise<{ event: string; data?: Record<string, unknown> }>((resolve, reject) => {
      let settled = false;
      const finish = (value: { event: string; data?: Record<string, unknown> }) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        socket.off(COLLAB_EVENTS.joinResult, onJoinResult);
        resolve(value);
      };

      const timer = setTimeout(() => {
        if (settled) return;
        settled = true;
        socket.off(COLLAB_EVENTS.joinResult, onJoinResult);
        reject(new Error('Sin respuesta del servidor (join_room)'));
      }, ACK_TIMEOUT_MS);

      const onJoinResult = (payload: { event: string; data?: Record<string, unknown> }) => {
        finish(payload);
      };

      socket.on(COLLAB_EVENTS.joinResult, onJoinResult);
      socket.emit('join_room', { roomType, roomId: String(roomId) }, (ack: { event: string; data?: Record<string, unknown> }) => {
        if (ack?.event) finish(ack);
      });
    });

    this.roomJoined = res?.event === 'joined';
    return res;
  }

  async leaveRoom(roomType: RoomType, roomId: string) {
    if (!this.socket?.connected) return;
    try {
      const res = await this.emitAck('leave_room', { roomType, roomId });
      if (this.activeRoom?.roomType === roomType && this.activeRoom?.roomId === roomId) {
        this.activeRoom = null;
        this.roomJoined = false;
      }
      return res;
    } catch {
      this.activeRoom = null;
      this.roomJoined = false;
    }
  }

  async acquireLock(
    roomType: RoomType,
    roomId: string,
    resourceType: LockResourceType,
    resourceId: string,
  ): Promise<{ event: string; data?: Record<string, unknown> }> {
    await this.waitForAuth();
    const socket = this.connect();
    const payload = { roomType, roomId: String(roomId), resourceType, resourceId: String(resourceId) };

    const res = await new Promise<{ event: string; data?: Record<string, unknown> }>((resolve, reject) => {
      let settled = false;
      const finish = (value: { event: string; data?: Record<string, unknown> }) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        socket.off(COLLAB_EVENTS.lockResult, onResult);
        resolve(value);
      };

      const timer = setTimeout(() => {
        finish({ event: 'timeout', data: { message: 'Sin respuesta del servidor (lock_acquire)' } });
      }, ACK_TIMEOUT_MS);

      const onResult = (result: { event: string; data?: Record<string, unknown> }) => finish(result);

      socket.on(COLLAB_EVENTS.lockResult, onResult);
      socket.emit('lock_acquire', payload, (ack: { event: string; data?: Record<string, unknown> }) => {
        if (ack?.event) finish(ack);
      });
    });

    if (res?.event === 'lock_granted') {
      const entry = { roomType, roomId, resourceType, resourceId };
      if (!this.activeLocks.some(l => l.resourceId === resourceId && l.resourceType === resourceType)) {
        this.activeLocks.push(entry);
      }
      this.startRenewLoop();
    }
    return res;
  }

  releaseLock(
    roomType: RoomType,
    roomId: string,
    resourceType: LockResourceType,
    resourceId: string,
  ) {
    if (!this.socket?.connected) return;
    this.connect().emit('lock_release', {
      roomType,
      roomId: String(roomId),
      resourceType,
      resourceId: String(resourceId),
    });
    this.activeLocks = this.activeLocks.filter(
      l => !(l.resourceType === resourceType && l.resourceId === resourceId),
    );
  }

  private startRenewLoop() {
    if (this.renewTimer) return;
    this.renewTimer = setInterval(() => {
      for (const lock of [...this.activeLocks]) {
        this.emitAck('lock_renew', {
          roomType: lock.roomType,
          roomId: lock.roomId,
          resourceType: lock.resourceType,
          resourceId: lock.resourceId,
        }).catch(() => {});
      }
    }, 15_000);
  }

  noteUpdate(roomType: RoomType, roomId: string, field: string, payload: unknown) {
    if (!this.isRoomJoined()) return;
    this.connect().emit('note_update', { roomType, roomId, field, payload });
  }

  drawingUpdate(
    roomType: RoomType,
    roomId: string,
    mode: 'full' | 'stroke' | 'clear',
    payload: Record<string, unknown>,
  ) {
    if (!this.isRoomJoined()) return;
    this.connect().emit('drawing_update', { roomType, roomId, mode, payload });
  }

  boardCursorMove(roomType: RoomType, roomId: string, x: number, y: number) {
    if (!this.isRoomJoined() || !this.socket) return;
    this.socket.emit('board_cursor', { roomType, roomId, x, y });
  }

  on(event: string, handler: (...args: unknown[]) => void) {
    this.connect().on(event, handler);
  }

  off(event: string, handler: (...args: unknown[]) => void) {
    this.socket?.off(event, handler);
  }
}

export const collaborationService = new CollaborationService();
