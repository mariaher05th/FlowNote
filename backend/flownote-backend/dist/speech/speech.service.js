"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpeechService = void 0;
const common_1 = require("@nestjs/common");
const fs_1 = require("fs");
const openai_1 = require("openai");
let SpeechService = class SpeechService {
    constructor() {
        this.openai = null;
        if (process.env.OPENAI_API_KEY) {
            this.openai = new openai_1.default({
                apiKey: process.env.OPENAI_API_KEY,
            });
        }
    }
    async transcribir(filePath, mimetype) {
        const formatosValidos = ['audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/wav', 'audio/ogg'];
        if (!this.openai) {
            throw new common_1.InternalServerErrorException('Speech-to-Text no está configurado. Agrega OPENAI_API_KEY al .env');
        }
        if (!formatosValidos.includes(mimetype)) {
            throw new common_1.BadRequestException(`Formato no soportado: ${mimetype}. Usa webm, mp4, mp3, wav u ogg.`);
        }
        try {
            const respuesta = await this.openai.audio.transcriptions.create({
                file: (0, fs_1.createReadStream)(filePath),
                model: 'whisper-1',
                language: 'es',
            });
            return { texto: respuesta.text };
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Error al transcribir el audio. Intenta de nuevo.');
        }
    }
};
exports.SpeechService = SpeechService;
exports.SpeechService = SpeechService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], SpeechService);
//# sourceMappingURL=speech.service.js.map