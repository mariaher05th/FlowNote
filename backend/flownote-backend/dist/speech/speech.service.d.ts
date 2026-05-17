export declare class SpeechService {
    private openai;
    constructor();
    transcribir(filePath: string, mimetype: string): Promise<{
        texto: string;
    }>;
}
