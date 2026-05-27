import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { LockService } from './lock.service';
import { CollaborationRoomService, SocketUser } from './collaboration-room.service';
import { CollaborationLockDocument } from './schemas/collaboration-lock.schema';
import {
  COLLABORATION_EVENTS,
  LOCK_RESOURCE_TYPES,
  LockResourceType,
  RoomRef,
} from './collaboration.types';
import {
  RoomBodyDto,
  LockBodyDto,
  NoteUpdateDto,
  NoteCursorDto,
  KanbanUpdateDto,
  DrawingUpdateDto,
  CommentPayloadDto,
  FlowUpdateDto,
  WidgetUpdateDto,
} from './dto/collaboration.dto';

@WebSocketGateway({
  cors: { origin: '*', credentials: true },
  namespace: '/collaboration',
})
export class CollaborationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(CollaborationGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly lockService: LockService,
    private readonly roomService: CollaborationRoomService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const user = this.autenticar(client);
      client.data.user = user;
      client.emit(COLLABORATION_EVENTS.connected, {
        socketId: client.id,
        userId: user.sub,
        lockTtlMs: this.lockService.getTtlMs(),
        renewIntervalMs: Math.floor(this.lockService.getTtlMs() / 2),
        resourceTypes: LOCK_RESOURCE_TYPES,
        events: COLLABORATION_EVENTS,
      });
    } catch {
      client.emit('error', { message: 'Token JWT inválido o ausente' });
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const count = await this.lockService.releaseAllForSocket(client.id);
    if (count > 0) {
      const rooms = [...client.rooms].filter(r => r !== client.id);
      for (const room of rooms) {
        client.to(room).emit(COLLABORATION_EVENTS.locks_released, {
          socketId: client.id,
          count,
          reason: 'disconnect',
        });
        await this.emitLocksActivos(room);
      }
    }
  }

  @SubscribeMessage('join_room')
  async joinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { roomType?: string; roomId?: string },
  ) {
    let result: { event: string; data?: Record<string, unknown> };

    try {
      const roomType = body?.roomType;
      const roomId = body?.roomId ? String(body.roomId) : '';
      if (roomType !== 'nota' && roomType !== 'espacio') {
        result = { event: 'invalid_body', data: { message: 'roomType debe ser nota o espacio' } };
        client.emit(COLLABORATION_EVENTS.join_result, result);
        return result;
      }
      if (!roomId) {
        result = { event: 'invalid_body', data: { message: 'roomId es requerido' } };
        client.emit(COLLABORATION_EVENTS.join_result, result);
        return result;
      }

      if (!client.data.user) {
        client.data.user = this.autenticar(client);
      }

      const user = this.roomService.getUser(client);
      const ref: RoomRef = { roomType, roomId };
      const room = this.roomService.roomKey(ref);

      if (!(await this.roomService.puedeEntrar(ref, user.sub, user.username))) {
        result = {
          event: COLLABORATION_EVENTS.join_denied,
          data: { room, message: 'Sin acceso a esta sala' },
        };
        client.emit(COLLABORATION_EVENTS.join_result, result);
        return result;
      }

      await client.join(room);
      const locks = await this.lockService.listByRoom(room);
      const presencia = await this.roomService.presenciaEnSala(this.server, room);

      client.to(room).emit(COLLABORATION_EVENTS.presence_joined, {
        userId: user.sub,
        nombre: user.nombre,
        socketId: client.id,
      });

      result = {
        event: COLLABORATION_EVENTS.joined,
        data: {
          room,
          locks: locks.map(l => this.mapLock(l)),
          presencia,
          lockTtlMs: this.lockService.getTtlMs(),
          capabilities: {
            note: ['note_title', 'note_content', 'note_metadata'],
            drawing: ['drawing_canvas', 'drawing_stroke'],
            comments: ['comment', 'comment_anchor'],
            kanban: ['note_metadata'],
            flow: ['board', 'flow_node', 'flow_edge'],
            widgets: ['widget'],
          },
        },
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al unirse a la sala';
      this.logger.error(`join_room error: ${message}`, err instanceof Error ? err.stack : undefined);
      result = {
        event: err instanceof UnauthorizedException ? 'auth_required' : 'error',
        data: { message },
      };
    }

    client.emit(COLLABORATION_EVENTS.join_result, result);
    return result;
  }

  @SubscribeMessage('leave_room')
  async leaveRoom(@ConnectedSocket() client: Socket, @MessageBody() body: RoomBodyDto) {
    const user = this.roomService.getUser(client);
    const room = this.roomService.roomKey(body);
    await client.leave(room);

    const locks = await this.lockService.listByRoom(room);
    for (const lock of locks) {
      if (lock.socket_id === client.id) {
        await this.lockService.release(
          room,
          lock.resource_type,
          lock.resource_id,
          { userId: user.sub, userName: user.nombre, socketId: client.id },
          true,
        );
      }
    }

    client.to(room).emit(COLLABORATION_EVENTS.presence_left, {
      userId: user.sub,
      socketId: client.id,
    });

    return { event: COLLABORATION_EVENTS.left, data: { room } };
  }

  @SubscribeMessage('lock_acquire')
  async lockAcquire(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { roomType?: string; roomId?: string; resourceType?: string; resourceId?: string },
  ) {
    return this.handleLock(client, body, 'acquire');
  }

  @SubscribeMessage('lock_renew')
  async lockRenew(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { roomType?: string; roomId?: string; resourceType?: string; resourceId?: string },
  ) {
    return this.handleLock(client, body, 'renew');
  }

  @SubscribeMessage('lock_release')
  async lockRelease(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { roomType?: string; roomId?: string; resourceType?: string; resourceId?: string },
  ) {
    return this.handleLock(client, body, 'release');
  }

  /** Nota: título, contenido, estado, etiquetas */
  @SubscribeMessage('note_update')
  async noteUpdate(@ConnectedSocket() client: Socket, @MessageBody() body: NoteUpdateDto) {
    const user = this.roomService.getUser(client);
    const room = this.roomService.roomKey(body);
    if (!this.roomService.assertInRoom(client, room)) {
      this.logger.warn(`note_update ignorado: cliente no está en sala ${room}`);
      return { event: 'not_in_room', data: { room } };
    }

    const notaId = body.roomType === 'nota' ? body.roomId : (body.payload as Record<string, unknown>)?.notaId as string;
    if (notaId && !(await this.roomService.puedeEditarNota(notaId, user.sub, user.username))) {
      return { event: 'edit_denied', data: { message: 'Sin permiso de edición' } };
    }

    this.roomService.broadcast(
      this.server,
      client,
      room,
      COLLABORATION_EVENTS.note_updated,
      this.roomService.envelope(user, { field: body.field, value: body.payload }),
    );
    return { event: 'note_update_ack', data: { ok: true } };
  }

  /** Cursor / selección del editor de nota */
  @SubscribeMessage('note_cursor')
  async noteCursor(@ConnectedSocket() client: Socket, @MessageBody() body: NoteCursorDto) {
    const user = this.roomService.getUser(client);
    const room = this.roomService.roomKey(body);
    if (!this.roomService.assertInRoom(client, room)) return;

    this.roomService.broadcast(
      this.server,
      client,
      room,
      COLLABORATION_EVENTS.note_cursor,
      this.roomService.envelope(user, {
        posicion: body.posicion,
        seleccion_inicio: body.seleccion_inicio,
        seleccion_fin: body.seleccion_fin,
      }),
    );
  }

  /** Kanban: mover nota de columna */
  @SubscribeMessage('kanban_update')
  async kanbanUpdate(@ConnectedSocket() client: Socket, @MessageBody() body: KanbanUpdateDto) {
    const user = this.roomService.getUser(client);
    const room = this.roomService.roomKey(body);
    if (!this.roomService.assertInRoom(client, room)) return;

    if (!(await this.roomService.puedeEditarNota(body.notaId, user.sub, user.username))) {
      return { event: 'edit_denied', data: { message: 'Sin permiso de edición' } };
    }

    this.roomService.broadcast(
      this.server,
      client,
      room,
      COLLABORATION_EVENTS.kanban_updated,
      this.roomService.envelope(user, { notaId: body.notaId, estado: body.estado }),
    );
  }

  /** Canvas / dibujo: trazo completo, un trazo o limpiar */
  @SubscribeMessage('drawing_update')
  async drawingUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: {
      roomType?: string;
      roomId?: string;
      mode?: string;
      payload?: Record<string, unknown>;
    },
  ) {
    const roomType = body?.roomType;
    const roomId = body?.roomId ? String(body.roomId) : '';
    const mode = body?.mode ?? 'stroke';
    if ((roomType !== 'nota' && roomType !== 'espacio') || !roomId) {
      return { event: 'invalid_body', data: { message: 'roomType/roomId inválidos' } };
    }

    const user = this.roomService.getUser(client);
    const ref: RoomRef = { roomType, roomId };
    const room = this.roomService.roomKey(ref);
    if (!this.roomService.assertInRoom(client, room)) {
      return { event: 'not_in_room', data: { room } };
    }

    const notaId = roomType === 'nota' ? roomId : null;
    if (notaId && !(await this.roomService.puedeEditarNota(notaId, user.sub, user.username))) {
      return { event: 'edit_denied', data: { message: 'Sin permiso de edición' } };
    }

    const event =
      mode === 'clear'
        ? COLLABORATION_EVENTS.drawing_cleared
        : mode === 'stroke' || mode === 'segment'
          ? COLLABORATION_EVENTS.drawing_stroke_added
          : COLLABORATION_EVENTS.drawing_updated;

    this.roomService.broadcast(
      this.server,
      client,
      room,
      event,
      this.roomService.envelope(user, { mode, ...(body.payload ?? {}) }),
    );
    return { event: 'drawing_update_ack', data: { ok: true } };
  }

  @SubscribeMessage('comment_add')
  async commentAdd(@ConnectedSocket() client: Socket, @MessageBody() body: CommentPayloadDto) {
    return this.broadcastComment(client, body, COLLABORATION_EVENTS.comment_added);
  }

  @SubscribeMessage('comment_update')
  async commentUpdate(@ConnectedSocket() client: Socket, @MessageBody() body: CommentPayloadDto) {
    return this.broadcastComment(client, body, COLLABORATION_EVENTS.comment_updated);
  }

  @SubscribeMessage('comment_delete')
  async commentDelete(@ConnectedSocket() client: Socket, @MessageBody() body: CommentPayloadDto) {
    return this.broadcastComment(client, body, COLLABORATION_EVENTS.comment_deleted);
  }

  @SubscribeMessage('flow_update')
  async flowUpdate(@ConnectedSocket() client: Socket, @MessageBody() body: FlowUpdateDto) {
    const user = this.roomService.getUser(client);
    const room = this.roomService.roomKey(body);
    if (!this.roomService.assertInRoom(client, room)) return;

    this.roomService.broadcast(
      this.server,
      client,
      room,
      COLLABORATION_EVENTS.flow_updated,
      this.roomService.envelope(user, { payload: body.payload }),
    );
  }

  @SubscribeMessage('widget_update')
  async widgetUpdate(@ConnectedSocket() client: Socket, @MessageBody() body: WidgetUpdateDto) {
    const user = this.roomService.getUser(client);
    const room = this.roomService.roomKey(body);
    if (!this.roomService.assertInRoom(client, room)) return;

    this.roomService.broadcast(
      this.server,
      client,
      room,
      COLLABORATION_EVENTS.widget_updated,
      this.roomService.envelope(user, { widgetId: body.widgetId, payload: body.payload }),
    );
  }

  @SubscribeMessage('board_cursor')
  boardCursor(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { roomType?: string; roomId?: string; x?: number; y?: number; typing?: boolean },
  ) {
    const roomType = body?.roomType;
    const roomId = body?.roomId ? String(body.roomId) : '';
    if ((roomType !== 'nota' && roomType !== 'espacio') || !roomId) return;
    const user = this.roomService.getUser(client);
    const ref: RoomRef = { roomType, roomId };
    const room = this.roomService.roomKey(ref);
    if (!this.roomService.assertInRoom(client, room)) return;
    this.roomService.broadcast(
      this.server,
      client,
      room,
      COLLABORATION_EVENTS.board_cursor,
      this.roomService.envelope(user, { x: body.x ?? 0, y: body.y ?? 0, typing: body.typing ?? false }),
    );
  }

  @SubscribeMessage('presence_ping')
  async presencePing(@ConnectedSocket() client: Socket, @MessageBody() body: RoomBodyDto) {
    const room = this.roomService.roomKey(body);
    return {
      event: COLLABORATION_EVENTS.presence,
      data: { presencia: await this.roomService.presenciaEnSala(this.server, room) },
    };
  }

  private async broadcastComment(
    client: Socket,
    body: CommentPayloadDto,
    event: string,
  ) {
    const user = this.roomService.getUser(client);
    const room = this.roomService.roomKey(body);
    if (!this.roomService.assertInRoom(client, room)) return;

    this.roomService.broadcast(
      this.server,
      client,
      room,
      event,
      this.roomService.envelope(user, {
        commentId: body.commentId,
        contenido: body.contenido,
        posicion_inicio: body.posicion_inicio,
        posicion_fin: body.posicion_fin,
        posicion_char: body.posicion_char,
      }),
    );
  }

  private async handleLock(
    client: Socket,
    body: { roomType?: string; roomId?: string; resourceType?: string; resourceId?: string },
    action: 'acquire' | 'renew' | 'release',
  ) {
    let result: { event: string; data?: Record<string, unknown> };

    try {
      const roomType = body?.roomType;
      const roomId = body?.roomId ? String(body.roomId) : '';
      const resourceType = body?.resourceType as LockResourceType | undefined;
      const resourceId = body?.resourceId ? String(body.resourceId) : '';

      if ((roomType !== 'nota' && roomType !== 'espacio') || !roomId || !resourceType || !resourceId) {
        result = { event: 'invalid_body', data: { message: 'Datos de lock incompletos' } };
        client.emit(COLLABORATION_EVENTS.lock_result, result);
        return result;
      }

      if (!client.data.user) {
        client.data.user = this.autenticar(client);
      }

      const user = this.roomService.getUser(client);
      const ref: RoomRef = { roomType, roomId };
      const room = this.roomService.roomKey(ref);
      const holder = { userId: user.sub, userName: user.nombre, socketId: client.id };

      if (!this.roomService.assertInRoom(client, room)) {
        result = { event: 'lock_error', data: { message: 'Debes unirte a la sala primero' } };
        client.emit(COLLABORATION_EVENTS.lock_result, result);
        return result;
      }

      if (action === 'acquire') {
        const acquired = await this.lockService.acquire(room, resourceType, resourceId, holder);
        if (!acquired.acquired) {
          result = {
            event: COLLABORATION_EVENTS.lock_denied,
            data: {
              resourceType,
              resourceId,
              conflict: acquired.conflict,
            },
          };
        } else {
          const lockView = this.mapLock(acquired.lock!);
          client.to(room).emit(COLLABORATION_EVENTS.lock_acquired, lockView);
          await this.emitLocksActivos(room);
          result = {
            event: COLLABORATION_EVENTS.lock_granted,
            data: {
              resourceType,
              resourceId,
              lock: lockView,
              ttlMs: this.lockService.getTtlMs(),
            },
          };
        }
      } else if (action === 'renew') {
        const renewed = await this.lockService.renew(room, resourceType, resourceId, holder);
        if (!renewed.renewed) {
          result = {
            event: COLLABORATION_EVENTS.lock_expired,
            data: { resourceType, resourceId },
          };
        } else {
          const lockView = this.mapLock(renewed.lock!);
          client.to(room).emit(COLLABORATION_EVENTS.lock_renewed, lockView);
          result = { event: 'lock_renewed_ack', data: { lock: lockView } };
        }
      } else {
        const released = await this.lockService.release(room, resourceType, resourceId, holder);
        if (released) {
          client.to(room).emit(COLLABORATION_EVENTS.lock_released, {
            resourceType,
            resourceId,
            releasedBy: user.sub,
          });
          await this.emitLocksActivos(room);
        }
        result = { event: 'lock_release_ack', data: { released, resourceType, resourceId } };
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error de lock';
      this.logger.warn(`handleLock ${action}: ${message}`);
      result = { event: 'error', data: { message } };
    }

    client.emit(COLLABORATION_EVENTS.lock_result, result);
    return result;
  }

  private autenticar(client: Socket): SocketUser {
    const token =
      (client.handshake.auth?.token as string)
      || (client.handshake.query?.token as string)
      || (client.handshake.headers?.authorization as string)?.replace('Bearer ', '');

    if (!token) throw new UnauthorizedException();
    const payload = this.jwtService.verify<{
      sub: string;
      email: string;
      nombre: string;
      username?: string;
    }>(token);
    return {
      sub: String(payload.sub),
      email: payload.email,
      nombre: payload.nombre,
      username: payload.username,
    };
  }

  private async emitLocksActivos(room: string) {
    const locks = await this.lockService.listByRoom(room);
    this.server.to(room).emit(COLLABORATION_EVENTS.locks_snapshot, {
      locks: locks.map(l => this.mapLock(l)),
    });
  }

  private mapLock(lock: CollaborationLockDocument) {
    return {
      resourceType: lock.resource_type,
      resourceId: lock.resource_id,
      holderId: lock.holder_id.toString(),
      holderNombre: lock.holder_nombre,
      socketId: lock.socket_id,
      expiresAt: lock.expires_at,
    };
  }
}
