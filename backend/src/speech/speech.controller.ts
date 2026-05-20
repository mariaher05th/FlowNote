import {
  Controller,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { SpeechService } from './speech.service';

@UseGuards(JwtAuthGuard)
@Controller('speech')
export class SpeechController {
  constructor(private readonly speechService: SpeechService) {}

  @Post('transcribe')
  @UseInterceptors(AnyFilesInterceptor())
  async transcribe(@UploadedFiles() files: Express.Multer.File[]) {
    const file = files?.[0];

    if (!file) {
      throw new BadRequestException('No se recibió ningún archivo de audio.');
    }

    return this.speechService.transcribe(file);
  }
}