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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpeechController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const speech_service_1 = require("./speech.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
let SpeechController = class SpeechController {
    constructor(speechService) {
        this.speechService = speechService;
    }
    async transcribir(file) {
        if (!file) {
            throw new common_1.BadRequestException('No se recibió ningún archivo de audio');
        }
        return this.speechService.transcribir(file.path, file.mimetype);
    }
};
exports.SpeechController = SpeechController;
__decorate([
    (0, common_1.Post)('transcribe'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('audio', {
        storage: (0, multer_1.diskStorage)({
            destination: '/tmp',
            filename: (req, file, cb) => {
                const nombre = `audio-${Date.now()}${(0, path_1.extname)(file.originalname)}`;
                cb(null, nombre);
            },
        }),
        limits: { fileSize: 25 * 1024 * 1024 },
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SpeechController.prototype, "transcribir", null);
exports.SpeechController = SpeechController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('speech'),
    __metadata("design:paramtypes", [speech_service_1.SpeechService])
], SpeechController);
//# sourceMappingURL=speech.controller.js.map