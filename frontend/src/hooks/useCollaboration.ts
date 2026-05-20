import { useEffect, useRef, useState, useCallback } from 'react';
import {
  collaborationService,
  PresenceUser,
  ActiveLock,
  normalizeLock,
} from '../services/collaboration.service';
import { COLLAB_EVENTS, LockResourceType, RoomType } from '../services/collaboration.types';
import { authService } from '../services/auth.service';

export interface UseCollaborationOptions {
  roomType: RoomType;
  roomId: string | null;
  enabled?: boolean;
  onRemoteNoteUpdate?: (field: string, value: unknown, fromUserId: string) => void;
  onRemoteDrawing?: (mode: string, payload: Record<string, unknown>, fromUserId: string) => void;
  onRemoteComment?: (action: 'add' | 'update' | 'delete', data: Record<string, unknown>, fromUserId: string) => void;
}

function normId(id?: string | null): string {
  if (id == null) return '';
  return String(id);
}

export function useCollaboration({
  roomType,
  roomId,
  enabled = true,
  onRemoteNoteUpdate,
  onRemoteDrawing,
  onRemoteComment,
}: UseCollaborationOptions) {
  const [connected, setConnected] = useState(false);
  const [roomReady, setRoomReady] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [presencia, setPresencia] = useState<PresenceUser[]>([]);
  const [locks, setLocks] = useState<ActiveLock[]>([]);
  const currentUserId = useRef<string | null>(null);

  const noteCb = useRef(onRemoteNoteUpdate);
  const drawCb = useRef(onRemoteDrawing);
  const commentCb = useRef(onRemoteComment);

  noteCb.current = onRemoteNoteUpdate;
  drawCb.current = onRemoteDrawing;
  commentCb.current = onRemoteComment;

  const isSelf = useCallback((userId?: string) => {
    if (!userId || !currentUserId.current) return false;
    return normId(userId) === normId(currentUserId.current);
  }, []);

  const applyJoined = useCallback((payload: { presencia?: PresenceUser[]; locks?: ActiveLock[] }) => {
    if (payload?.presencia) setPresencia(payload.presencia);
    if (payload?.locks) setLocks(payload.locks);
  }, []);

  const upsertLock = useCallback((raw: Record<string, unknown>) => {
    const lock = normalizeLock(raw);
    if (!lock) return;
    setLocks(prev => {
      const filtered = prev.filter(
        l => !(l.resourceType === lock.resourceType && l.resourceId === lock.resourceId),
      );
      return [...filtered, lock];
    });
  }, []);

  const getLock = useCallback(
    (resourceType: LockResourceType, resourceId: string) =>
      locks.find(l => l.resourceType === resourceType && l.resourceId === resourceId),
    [locks],
  );

  const iHaveLock = useCallback(
    (resourceType: LockResourceType, resourceId: string) => {
      const lock = getLock(resourceType, resourceId);
      return !!lock && normId(lock.holderId) === normId(currentUserId.current);
    },
    [getLock],
  );

  const isLockedByOther = useCallback(
    (resourceType: LockResourceType, resourceId: string) => {
      const lock = getLock(resourceType, resourceId);
      return !!lock && normId(lock.holderId) !== normId(currentUserId.current);
    },
    [getLock],
  );

  useEffect(() => {
    if (!enabled || !roomId) {
      setRoomReady(false);
      setJoinError(null);
      return;
    }

    const user = authService.getCurrentUser();
    currentUserId.current = normId(user?.id ?? user?._id);

    const socket = collaborationService.connect();

    const doJoinRoom = async () => {
      setJoinError(null);
      try {
        const ack = await collaborationService.joinRoom(roomType, roomId);
        if (ack?.event === 'joined') {
          setRoomReady(true);
          const data = ack.data ?? {};
          const rawLocks = (data.locks as Record<string, unknown>[]) ?? [];
          applyJoined({
            presencia: data.presencia as PresenceUser[],
            locks: rawLocks.map(l => normalizeLock(l)).filter(Boolean) as ActiveLock[],
          });
        } else {
          setRoomReady(false);
          const msg =
            ack?.event === 'join_denied'
              ? 'Sin acceso a esta sala'
              : ack?.event === 'auth_required'
                ? 'Sesión no válida — vuelve a iniciar sesión'
                : `No se pudo unir (${ack?.event ?? 'error'})`;
          setJoinError(msg);
        }
      } catch (err) {
        setRoomReady(false);
        setJoinError(err instanceof Error ? err.message : 'Error al unirse a la sala');
      }
    };

    const onSocketConnect = () => {
      setConnected(true);
      setRoomReady(false);
    };

    const onSocketDisconnect = () => {
      setConnected(false);
      setRoomReady(false);
    };

    const onServerConnected = (data: { userId?: string }) => {
      if (data?.userId) currentUserId.current = normId(data.userId);
      setConnected(true);
      doJoinRoom();
    };

    const onPresenceJoined = (p: PresenceUser) => {
      setPresencia(prev => {
        if (prev.some(x => x.socketId === p.socketId)) return prev;
        return [...prev, p];
      });
    };

    const onPresenceLeft = (p: { socketId: string }) => {
      setPresencia(prev => prev.filter(x => x.socketId !== p.socketId));
    };

    const onNoteUpdated = (msg: { userId?: string; field?: string; value?: unknown }) => {
      if (isSelf(msg.userId) || !msg.field) return;
      noteCb.current?.(msg.field, msg.value, msg.userId ?? '');
    };

    const onDrawing = (msg: { userId?: string; mode?: string } & Record<string, unknown>) => {
      if (isSelf(msg.userId)) return;
      const { userId, mode, ...rest } = msg;
      drawCb.current?.(mode ?? 'stroke', rest, userId ?? '');
    };

    const onComment = (action: 'add' | 'update' | 'delete') =>
      (msg: Record<string, unknown> & { userId?: string }) => {
        if (isSelf(msg.userId)) return;
        const { userId, ...data } = msg;
        commentCb.current?.(action, data, userId ?? '');
      };

    const onLockAcquired = (raw: Record<string, unknown>) => upsertLock(raw);

    const onLockReleased = (data: { resourceType: string; resourceId: string }) => {
      setLocks(prev =>
        prev.filter(
          l => !(l.resourceType === data.resourceType && l.resourceId === data.resourceId),
        ),
      );
    };

    const onLocksSnapshot = (data: { locks?: Record<string, unknown>[] }) => {
      if (!data.locks) return;
      setLocks(
        data.locks.map(l => normalizeLock(l)).filter(Boolean) as ActiveLock[],
      );
    };

    const onConnectError = (err: Error) => {
      setConnected(false);
      setRoomReady(false);
      setJoinError(err?.message || 'No se pudo conectar al servidor en tiempo real');
    };

    socket.on('connect', onSocketConnect);
    socket.on('disconnect', onSocketDisconnect);
    socket.on('connect_error', onConnectError);
    socket.on(COLLAB_EVENTS.connected, onServerConnected);
    socket.on(COLLAB_EVENTS.presenceJoined, onPresenceJoined);
    socket.on(COLLAB_EVENTS.presenceLeft, onPresenceLeft);
    socket.on(COLLAB_EVENTS.noteUpdated, onNoteUpdated);
    socket.on(COLLAB_EVENTS.drawingUpdated, onDrawing);
    socket.on(COLLAB_EVENTS.drawingStroke, onDrawing);
    socket.on(COLLAB_EVENTS.drawingCleared, onDrawing);
    socket.on(COLLAB_EVENTS.commentAdded, onComment('add'));
    socket.on(COLLAB_EVENTS.commentUpdated, onComment('update'));
    socket.on(COLLAB_EVENTS.commentDeleted, onComment('delete'));
    socket.on(COLLAB_EVENTS.lockAcquired, onLockAcquired);
    socket.on(COLLAB_EVENTS.lockReleased, onLockReleased);
    socket.on('locks_snapshot', onLocksSnapshot);

    setConnected(socket.connected);
    if (collaborationService.isAuthReady()) {
      doJoinRoom();
    }

    const authFallback = setTimeout(() => {
      if (!collaborationService.isAuthReady() && socket.connected) {
        socket.disconnect();
        socket.connect();
      }
    }, 2000);

    return () => {
      clearTimeout(authFallback);
      collaborationService.leaveRoom(roomType, roomId).catch(() => {});
      setRoomReady(false);
      setJoinError(null);
      socket.off('connect', onSocketConnect);
      socket.off('disconnect', onSocketDisconnect);
      socket.off('connect_error', onConnectError);
      socket.off(COLLAB_EVENTS.connected, onServerConnected);
      socket.off(COLLAB_EVENTS.presenceJoined, onPresenceJoined);
      socket.off(COLLAB_EVENTS.presenceLeft, onPresenceLeft);
      socket.off(COLLAB_EVENTS.noteUpdated, onNoteUpdated);
      socket.off(COLLAB_EVENTS.drawingUpdated, onDrawing);
      socket.off(COLLAB_EVENTS.drawingStroke, onDrawing);
      socket.off(COLLAB_EVENTS.drawingCleared, onDrawing);
      socket.off(COLLAB_EVENTS.lockAcquired, onLockAcquired);
      socket.off(COLLAB_EVENTS.lockReleased, onLockReleased);
      socket.off('locks_snapshot', onLocksSnapshot);
    };
  }, [enabled, roomId, roomType, isSelf, applyJoined, upsertLock]);

  const broadcastBoard = useCallback(
    (items: unknown[], strokes: unknown[]) => {
      if (!roomId || !collaborationService.isRoomJoined()) return;
      collaborationService.noteUpdate(roomType, roomId, 'contenido', { items, strokes });
    },
    [roomId, roomType],
  );

  const broadcastStroke = useCallback(
    (stroke: Record<string, unknown>) => {
      if (!roomId || !collaborationService.isRoomJoined()) return;
      collaborationService.drawingUpdate(roomType, roomId, 'stroke', stroke);
    },
    [roomId, roomType],
  );

  const acquireResourceLock = useCallback(
    async (resourceType: LockResourceType, resourceId: string) => {
      if (!roomId || !collaborationService.isRoomJoined()) return { ok: false as const, reason: 'offline' as const };
      const res = await collaborationService.acquireLock(roomType, roomId, resourceType, resourceId);
      if (res?.event === 'lock_granted') return { ok: true as const };
      if (res?.event === 'lock_denied') {
        const conflict = res.data?.conflict as { holder_nombre?: string } | undefined;
        return { ok: false as const, reason: 'denied' as const, holderName: conflict?.holder_nombre };
      }
      return { ok: false as const, reason: 'error' as const };
    },
    [roomId, roomType],
  );

  const releaseResourceLock = useCallback(
    (resourceType: LockResourceType, resourceId: string) => {
      if (!roomId) return;
      collaborationService.releaseLock(roomType, roomId, resourceType, resourceId);
    },
    [roomId, roomType],
  );

  return {
    connected,
    roomReady,
    joinError,
    presencia,
    locks,
    getLock,
    iHaveLock,
    isLockedByOther,
    broadcastBoard,
    broadcastStroke,
    acquireResourceLock,
    releaseResourceLock,
  };
}
