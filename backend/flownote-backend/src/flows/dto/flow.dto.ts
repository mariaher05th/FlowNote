import {
  IsString, IsOptional, IsArray, ValidateNested, IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

export class FlowNodeDto {
  @IsString()
  id: string;

  @IsString()
  etiqueta: string;

  @IsOptional()
  @IsString()
  tipo?: string;

  @IsOptional()
  @IsNumber()
  x?: number;

  @IsOptional()
  @IsNumber()
  y?: number;

  @IsOptional()
  @IsString()
  estado?: string;
}

export class FlowEdgeDto {
  @IsString()
  id: string;

  @IsString()
  origen_id: string;

  @IsString()
  destino_id: string;

  @IsOptional()
  @IsString()
  etiqueta?: string;
}

export class UpdateFlowDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FlowNodeDto)
  nodos?: FlowNodeDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FlowEdgeDto)
  conexiones?: FlowEdgeDto[];
}
