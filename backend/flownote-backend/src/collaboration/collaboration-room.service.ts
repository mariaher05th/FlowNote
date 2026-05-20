import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Server, Socket } from 'socket.io';
import { AccessService } from '../common/services/access.service';
import { Note, NoteDocument } from '../notes/schemas/note.schema';
import { RoomRef } from './collaboration.types';

export interface SocketUser {
  sub: string;
  email: string;
  nombre: string;
  username?: string;
}

@Injectable()
export class CollaborationRoomService {
  constructor(
    private readonly accessService: AccessService,
    @InjectModel(Note.name) private noteModel: Model<NoteDocument>,
  ) {}

  roomKey(ref: RoomRef): string {
    return `${ref.roomType}:${ref.roomId}`;
  }

  parseRoom(room: string): RoomRef | null {
    const [roomType, ...rest] = room.split(':');
    if ((roomType !== 'nota' && roomType !== 'espacio') || rest.length === 0) {
      return null;
    }
    return { roomType, roomId: rest.join(':') };
  }

  async puedeEntrar(ref: RoomRef, userId: string, username?: string): Promise<boolean> {
    if (ref.roomType === 'espacio') {
      const rol = await this.accessService.obtenerRolEnEspacio(ref.roomId, userId);
      return rol !== null;
    }
    const nota = await this.noteModel.findById(ref.roomId);
    if (!nota) return false;
    return this.accessService.puedeLeerNota(nota, userId, username);
  }

  async puedeEditarNota(notaId: string, userId: string, username?: string): Promise<boolean> {
    const nota = await this.noteModel.findById(notaId);
    if (!nota) return false;
    return this.accessService.puedeEditarNota(nota, userId, username);
  }

  getUser(client: Socket): SocketUser {
    if (!client.data.user) throw new UnauthorizedException();
    return client.data.user as SocketUser;
  }

  assertInRoom(client: Socket, room: string): boolean {
    return client.rooms.has(room);
  }

  broadcast(
    server: Server,
    client: Socket,
    room: string,
    event: string,
    payload: Record<string, unknown>,
    includeSelf = false,
  ) {
    const target = includeSelf ? server.to(room) : client.to(room);
    target.emit(event, payload);
  }

  async presenciaEnSala(server: Server, room: string) {
    const sockets = await server.in(room).fetchSockets();
    return sockets.map(s => ({
      socketId: s.id,
      userId: (s.data.user as SocketUser)?.sub,
      nombre: (s.data.user as SocketUser)?.nombre,
    }));
  }

  envelope(user: SocketUser, payload: Record<string, unknown>) {
    return {
      userId: user.sub,
      nombre: user.nombre,
      at: new Date().toISOString(),
      ...payload,
    };
  }
}
