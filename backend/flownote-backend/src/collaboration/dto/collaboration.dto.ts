import {
  IsString, IsOptional, IsObject, IsNumber, IsIn, Allow,
} from 'class-validator';
import { LOCK_RESOURCE_TYPES, RoomType } from '../collaboration.types';

export class RoomBodyDto {
  @IsIn(['nota', 'espacio'])
  roomType: RoomType;

  @IsString()
  roomId: string;
}

export class LockBodyDto extends RoomBodyDto {
  @IsIn(LOCK_RESOURCE_TYPES)
  resourceType: (typeof LOCK_RESOURCE_TYPES)[number];

  @IsString()
  resourceId: string;
}

export class NoteUpdateDto extends RoomBodyDto {
  @IsIn(['titulo', 'contenido', 'estado', 'etiquetas', 'es_colaborativa'])
  field: string;

  @IsOptional()
  @Allow()
  payload?: Record<string, unknown>;
}

export class NoteCursorDto extends RoomBodyDto {
  @IsNumber()
  posicion: number;

  @IsOptional()
  @IsNumber()
  seleccion_inicio?: number;

  @IsOptional()
  @IsNumber()
  seleccion_fin?: number;
}

export class KanbanUpdateDto extends RoomBodyDto {
  @IsString()
  notaId: string;

  @IsIn(['pendiente', 'en_progreso', 'completado'])
  estado: string;
}

export class DrawingUpdateDto extends RoomBodyDto {
  @IsIn(['full', 'stroke', 'clear'])
  mode: 'full' | 'stroke' | 'clear';

  @Allow()
  @IsObject()
  payload: Record<string, unknown>;
}

export class CommentPayloadDto extends RoomBodyDto {
  @IsString()
  commentId: string;

  @IsOptional()
  @IsString()
  contenido?: string;

  @IsOptional()
  @IsNumber()
  posicion_inicio?: number;

  @IsOptional()
  @IsNumber()
  posicion_fin?: number;

  @IsOptional()
  @IsNumber()
  posicion_char?: number;
}

export class FlowUpdateDto extends RoomBodyDto {
  @IsObject()
  payload: Record<string, unknown>;
}

export class WidgetUpdateDto extends RoomBodyDto {
  @IsString()
  widgetId: string;

  @IsObject()
  payload: Record<string, unknown>;
}
