import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  nota_id: string;

  @IsString()
  contenido: string;

  @IsOptional()
  @IsNumber()
  posicion_char?: number;

  @IsOptional()
  @IsNumber()
  posicion_inicio?: number;

  @IsOptional()
  @IsNumber()
  posicion_fin?: number;
}

export class UpdateCommentDto {
  @IsString()
  contenido: string;
}