import { IsOptional, IsString } from 'class-validator';

export class SpeechResponseDto {
  texto: string;
}

export class TranscribeDto {
  @IsOptional()
  @IsString()
  idioma?: string; // por defecto 'es', pero permite cambiarlo si lo necesitan
}