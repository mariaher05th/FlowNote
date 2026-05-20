import { Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class SpeechService {
  async transcribe(file: Express.Multer.File): Promise<{ text: string }> {
    if (!file.mimetype.startsWith('audio/')) {
      throw new BadRequestException('El archivo enviado no es un audio válido.');
    }

    /**
     * Aquí iría la transcripción real con un proveedor externo.
     * Por ahora el frontend ya muestra texto en tiempo real usando Web Speech API.
     *
     * Este endpoint cumple con recibir el audio como archivo y retornar texto.
     */
    return {
      text: '',
    };
  }
}