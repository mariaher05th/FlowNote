import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { createReadStream } from 'fs';
import OpenAI from 'openai';

@Injectable()
export class SpeechService {
  private openai: OpenAI | null = null;

 constructor() {
  if (process.env.OPENAI_API_KEY) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
}

  /**
   * Recibe la ruta temporal del archivo de audio subido por Multer
   * y devuelve el texto transcrito usando OpenAI Whisper.
   */
  async transcribir(filePath: string, mimetype: string): Promise<{ texto: string }> {
    const formatosValidos = ['audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/wav', 'audio/ogg'];

    if (!this.openai) {
      throw new InternalServerErrorException(
        'Speech-to-Text no está configurado. Agrega OPENAI_API_KEY al .env',
      );
    }

    if (!formatosValidos.includes(mimetype)) {
      throw new BadRequestException(
        `Formato no soportado: ${mimetype}. Usa webm, mp4, mp3, wav u ogg.`,
      );
    }

    try {
      const respuesta = await this.openai.audio.transcriptions.create({
        file: createReadStream(filePath),
        model: 'whisper-1',
        language: 'es',   // español por defecto para FlowNote
      });

      return { texto: respuesta.text };
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al transcribir el audio. Intenta de nuevo.',
      );
    }
  }
}
