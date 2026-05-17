import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  nota_id: string;

  @IsString()
  contenido: string;

  @IsOptional()
  @IsNumber()
  posicion_char?: number; // posición en el texto donde se hace el comentario
}

export class UpdateCommentDto {
  @IsString()
  contenido: string;
}