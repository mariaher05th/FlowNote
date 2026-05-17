import {
  IsString, IsOptional, IsNumber, IsObject, IsMongoId,
} from 'class-validator';

export class CreateWidgetDto {
  @IsString()
  tipo: string;

  @IsOptional()
  @IsMongoId()
  nota_id?: string;

  @IsOptional()
  @IsMongoId()
  espacio_id?: string;

  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;

  @IsOptional()
  @IsNumber()
  x?: number;

  @IsOptional()
  @IsNumber()
  y?: number;

  @IsOptional()
  @IsNumber()
  width?: number;

  @IsOptional()
  @IsNumber()
  height?: number;

  @IsOptional()
  @IsNumber()
  orden?: number;
}

export class UpdateWidgetDto {
  @IsOptional()
  @IsString()
  tipo?: string;

  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;

  @IsOptional()
  @IsNumber()
  x?: number;

  @IsOptional()
  @IsNumber()
  y?: number;

  @IsOptional()
  @IsNumber()
  width?: number;

  @IsOptional()
  @IsNumber()
  height?: number;

  @IsOptional()
  @IsNumber()
  orden?: number;
}

export class PatchWidgetPositionDto {
  @IsNumber()
  x: number;

  @IsNumber()
  y: number;

  @IsOptional()
  @IsNumber()
  width?: number;

  @IsOptional()
  @IsNumber()
  height?: number;

  @IsOptional()
  @IsNumber()
  orden?: number;
}
