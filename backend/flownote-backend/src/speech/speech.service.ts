import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { readFileSync, unlinkSync } from 'fs';
import { basename, extname } from 'path';

const MIME_VALIDOS = new Set([
  'audio/webm',
  'audio/mp4',
  'audio/mpeg',
  'audio/wav',
  'audio/ogg',
  'audio/x-wav',
  'audio/mp3',
  'audio/x-m4a',
  'video/mp4',
]);

const EXT_A_MIME: Record<string, string> = {
  '.webm': 'audio/webm',
  '.mp4': 'audio/mp4',
  '.m4a': 'audio/mp4',
  '.mp3': 'audio/mpeg',
  '.mpeg': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
};

@Injectable()
export class SpeechService {
  private readonly logger = new Logger(SpeechService.name);

  /**
   * Recibe la ruta temporal del archivo de audio subido por Multer
   * y devuelve el texto transcrito usando OpenAI Whisper.
   */
  async transcribir(filePath: string, mimetype: string): Promise<{ texto: string }> {
    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (!apiKey) {
      throw new InternalServerErrorException(
        'Speech-to-Text no está configurado. Agrega OPENAI_API_KEY al .env',
      );
    }

    const mime = this.resolverMime(mimetype, filePath);
    if (!MIME_VALIDOS.has(mime)) {
      throw new BadRequestException(
        `Formato no soportado: ${mimetype || mime}. Usa webm, mp4, mp3, wav u ogg.`,
      );
    }

    try {
      const buffer = readFileSync(filePath);
      const formData = new FormData();
      formData.append('file', new Blob([buffer], { type: mime }), basename(filePath));
      formData.append('model', 'whisper-1');
      formData.append('language', 'es');

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}` },
        body: formData,
      });

      const data = (await response.json().catch(() => ({}))) as {
        text?: string;
        error?: { message?: string; type?: string };
      };

      if (!response.ok) {
        const detalle = data.error?.message ?? response.statusText;
        this.logger.warn(`Whisper error ${response.status}: ${detalle}`);

        if (response.status === 401) {
          throw new InternalServerErrorException('API key de OpenAI inválida.');
        }
        if (response.status === 429) {
          throw new InternalServerErrorException(
            'Cuota de OpenAI agotada. Revisa el plan y la facturación en platform.openai.com',
          );
        }
        throw new InternalServerErrorException(
          detalle || 'Error al transcribir el audio. Intenta de nuevo.',
        );
      }

      return { texto: (data.text ?? '').trim() };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      this.logger.error('Error de conexión con OpenAI', error);
      throw new InternalServerErrorException(
        'No se pudo conectar con OpenAI. Verifica tu conexión e intenta de nuevo.',
      );
    } finally {
      try {
        unlinkSync(filePath);
      } catch {
        /* archivo temporal ya eliminado */
      }
    }
  }

  private resolverMime(mimetype: string, filePath: string): string {
    const limpio = (mimetype || '').split(';')[0].trim().toLowerCase();
    if (limpio && limpio !== 'application/octet-stream') return limpio;
    const ext = extname(filePath).toLowerCase();
    return EXT_A_MIME[ext] ?? limpio;
  }
}
