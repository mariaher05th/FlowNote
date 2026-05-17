import { IsString, IsDateString, IsOptional, IsBoolean } from 'class-validator';

export class CreateReminderDto {
  @IsString()
  nota_id: string;

  @IsString()
  mensaje: string;

  @IsDateString()
  fecha_hora: string; // ISO 8601: "2025-06-01T10:00:00.000Z"
}

export class UpdateReminderDto {
  @IsOptional()
  @IsString()
  mensaje?: string;

  @IsOptional()
  @IsDateString()
  fecha_hora?: string;

  @IsOptional()
  @IsBoolean()
  enviado?: boolean;
}