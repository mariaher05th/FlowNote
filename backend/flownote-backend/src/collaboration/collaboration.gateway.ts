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
  async joinRoom(@ConnectedSocket() client: Socket, @MessageBody() body: RoomBodyDto) {
    const user = this.roomService.getUser(client);
    const room = this.roomService.roomKey(body);

    if (!(await this.roomService.puedeEntrar(body, user.sub))) {
      return {
        event: COLLABORATION_EVENTS.join_denied,
        data: { room, message: 'Sin acceso a esta sala' },
      };
    }

    await client.join(room);
    const locks = await this.lockService.listByRoom(room);
    const presencia = await this.roomService.presenciaEnSala(this.server, room);

    client.to(room).emit(COLLABORATION_EVENTS.presence_joined, {
      userId: user.sub,
      nombre: user.nombre,
      socketId: client.id,
    });

    return {
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
  async lockAcquire(@ConnectedSocket() client: Socket, @MessageBody() body: LockBodyDto) {
    return this.handleLock(client, body, 'acquire');
  }

  @SubscribeMessage('lock_renew')
  async lockRenew(@ConnectedSocket() client: Socket, @MessageBody() body: LockBodyDto) {
    return this.handleLock(client, body, 'renew');
  }

  @SubscribeMessage('lock_release')
  async lockRelease(@ConnectedSocket() client: Socket, @MessageBody() body: LockBodyDto) {
    return this.handleLock(client, body, 'release');
  }

  /** Nota: título, contenido, estado, etiquetas */
  @SubscribeMessage('note_update')
  async noteUpdate(@ConnectedSocket() client: Socket, @MessageBody() body: NoteUpdateDto) {
    const user = this.roomService.getUser(client);
    const room = this.roomService.roomKey(body);
    if (!this.roomService.assertInRoom(client, room)) return;

    const notaId = body.roomType === 'nota' ? body.roomId : (body.payload as any)?.notaId;
    if (notaId && !(await this.roomService.puedeEditarNota(notaId, user.sub))) {
      return { event: 'edit_denied', data: { message: 'Sin permiso de edición' } };
    }

    this.roomService.broadcast(
      this.server,
      client,
      room,
      COLLABORATION_EVENTS.note_updated,
      this.roomService.envelope(user, { field: body.field, value: body.payload }),
    );
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

    if (!(await this.roomService.puedeEditarNota(body.notaId, user.sub))) {
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
  async drawingUpdate(@ConnectedSocket() client: Socket, @MessageBody() body: DrawingUpdateDto) {
    const user = this.roomService.getUser(client);
    const room = this.roomService.roomKey(body);
    if (!this.roomService.assertInRoom(client, room)) return;

    const notaId = body.roomType === 'nota' ? body.roomId : null;
    if (notaId && !(await this.roomService.puedeEditarNota(notaId, user.sub))) {
      return { event: 'edit_denied', data: { message: 'Sin permiso de edición' } };
    }

    const event =
      body.mode === 'clear'
        ? COLLABORATION_EVENTS.drawing_cleared
        : body.mode === 'stroke'
          ? COLLABORATION_EVENTS.drawing_stroke_added
          : COLLABORATION_EVENTS.drawing_updated;

    this.roomService.broadcast(
      this.server,
      client,
      room,
      event,
      this.roomService.envelope(user, { mode: body.mode, ...body.payload }),
    );
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
    body: LockBodyDto,
    action: 'acquire' | 'renew' | 'release',
  ) {
    const user = this.roomService.getUser(client);
    const room = this.roomService.roomKey(body);
    const holder = { userId: user.sub, userName: user.nombre, socketId: client.id };

    if (!this.roomService.assertInRoom(client, room)) {
      return { event: 'lock_error', data: { message: 'Debes unirte a la sala primero' } };
    }

    if (action === 'acquire') {
      const result = await this.lockService.acquire(
        room,
        body.resourceType as LockResourceType,
        body.resourceId,
        holder,
      );
      if (!result.acquired) {
        return {
          event: COLLABORATION_EVENTS.lock_denied,
          data: {
            resourceType: body.resourceType,
            resourceId: body.resourceId,
            conflict: result.conflict,
          },
        };
      }
      client.to(room).emit(COLLABORATION_EVENTS.lock_acquired, {
        resourceType: body.resourceType,
        resourceId: body.resourceId,
        holder: { userId: user.sub, nombre: user.nombre, socketId: client.id },
        expiresAt: result.lock!.expires_at,
      });
      return {
        event: COLLABORATION_EVENTS.lock_granted,
        data: {
          resourceType: body.resourceType,
          resourceId: body.resourceId,
          expiresAt: result.lock!.expires_at,
          ttlMs: this.lockService.getTtlMs(),
        },
      };
    }

    if (action === 'renew') {
      const result = await this.lockService.renew(
        room,
        body.resourceType as LockResourceType,
        body.resourceId,
        holder,
      );
      if (!result.renewed) {
        return {
          event: COLLABORATION_EVENTS.lock_expired,
          data: { resourceType: body.resourceType, resourceId: body.resourceId },
        };
      }
      client.to(room).emit(COLLABORATION_EVENTS.lock_renewed, {
        resourceType: body.resourceType,
        resourceId: body.resourceId,
        expiresAt: result.lock!.expires_at,
      });
      return {
        event: 'lock_renewed_ack',
        data: { expiresAt: result.lock!.expires_at },
      };
    }

    const released = await this.lockService.release(
      room,
      body.resourceType as LockResourceType,
      body.resourceId,
      holder,
    );
    if (released) {
      client.to(room).emit(COLLABORATION_EVENTS.lock_released, {
        resourceType: body.resourceType,
        resourceId: body.resourceId,
        releasedBy: user.sub,
      });
    }
    return { event: 'lock_release_ack', data: { released } };
  }

  private autenticar(client: Socket): SocketUser {
    const token =
      (client.handshake.auth?.token as string)
      || (client.handshake.query?.token as string)
      || (client.handshake.headers?.authorization as string)?.replace('Bearer ', '');

    if (!token) throw new UnauthorizedException();
    return this.jwtService.verify<SocketUser>(token);
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
