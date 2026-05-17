import {
  Controller, Post,
  UseInterceptors, UploadedFile,
  UseGuards, BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { SpeechService } from './speech.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('speech')
export class SpeechController {
  constructor(private readonly speechService: SpeechService) {}

  /**
   * POST /api/speech/transcribe
   * Body: form-data con campo "audio" (archivo de audio)
   * Respuesta: { texto: "..." }
   *
   * El frontend puede usar:
   *   const formData = new FormData();
   *   formData.append('audio', audioBlob, 'grabacion.webm');
   *   fetch('/api/speech/transcribe', { method: 'POST', body: formData, headers: { Authorization: 'Bearer ...' } })
   */
  @Post('transcribe')
  @UseInterceptors(
    FileInterceptor('audio', {
      storage: diskStorage({
        destination: '/tmp',
        filename: (req, file, cb) => {
          const nombre = `audio-${Date.now()}${extname(file.originalname)}`;
          cb(null, nombre);
        },
      }),
      limits: { fileSize: 25 * 1024 * 1024 }, // máx 25MB (límite de Whisper)
    }),
  )
  async transcribir(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No se recibió ningún archivo de audio');
    }

    return this.speechService.transcribir(file.path, file.mimetype);
  }
}
