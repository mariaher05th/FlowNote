import {
  IsString, IsOptional, IsArray, ValidateNested, IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

export class StrokePointDto {
  @IsNumber()
  x: number;

  @IsNumber()
  y: number;

  @IsOptional()
  @IsNumber()
  presion?: number;
}

export class StrokeDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StrokePointDto)
  puntos: StrokePointDto[];

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsNumber()
  grosor?: number;
}

export class SaveDrawingDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StrokeDto)
  trazos: StrokeDto[];

  @IsOptional()
  @IsString()
  svg_data?: string;
}

export class AddStrokeDto {
  @ValidateNested()
  @Type(() => StrokeDto)
  trazo: StrokeDto;
}
