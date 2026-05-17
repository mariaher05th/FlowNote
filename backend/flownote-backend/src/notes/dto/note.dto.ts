import { IsString, IsOptional, IsEnum, IsArray, IsBoolean } from 'class-validator';

export class CreateNoteDto {
  @IsString()
  titulo: string;

  @IsOptional()
  @IsString()
  contenido?: string;

  @IsOptional()
  @IsEnum(['pendiente', 'en_progreso', 'completado'])
  estado?: string;

  @IsOptional()
  @IsArray()
  etiquetas?: string[];

  @IsOptional()
  @IsBoolean()
  es_colaborativa?: boolean;

  @IsOptional()
  @IsString()
  espacio_id?: string;
}

export class UpdateNoteDto {
  @IsOptional()
  @IsString()
  titulo?: string;

  @IsOptional()
  @IsString()
  contenido?: string;

  @IsOptional()
  @IsEnum(['pendiente', 'en_progreso', 'completado'])
  estado?: string;

  @IsOptional()
  @IsArray()
  etiquetas?: string[];

  @IsOptional()
  @IsBoolean()
  es_colaborativa?: boolean;
}

export class SearchNoteDto {
  @IsString()
  q: string;
}
