import { SpeechService } from './speech.service';
export declare class SpeechController {
    private readonly speechService;
    constructor(speechService: SpeechService);
    transcribir(file: Express.Multer.File): Promise<{
        texto: string;
    }>;
}
