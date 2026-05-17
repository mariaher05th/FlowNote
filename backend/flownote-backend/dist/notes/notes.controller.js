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
exports.NotesController = void 0;
const common_1 = require("@nestjs/common");
const notes_service_1 = require("./notes.service");
const note_dto_1 = require("./dto/note.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const common_2 = require("@nestjs/common");
const export_service_1 = require("./export.service");
let NotesController = class NotesController {
    constructor(notesService, exportService) {
        this.notesService = notesService;
        this.exportService = exportService;
    }
    crear(dto, req) {
        return this.notesService.crear(dto, req.user.sub);
    }
    obtenerMias(req) {
        return this.notesService.obtenerMias(req.user.sub);
    }
    buscar(q, req) {
        return this.notesService.buscar(q, req.user.sub);
    }
    porEstado(estado, req) {
        return this.notesService.porEstado(estado, req.user.sub);
    }
    obtenerUna(id, req) {
        return this.notesService.obtenerUna(id, req.user.sub);
    }
    actualizar(id, dto, req) {
        return this.notesService.actualizar(id, dto, req.user.sub);
    }
    eliminar(id, req) {
        return this.notesService.eliminar(id, req.user.sub);
    }
    sugerirVinculos(id, req) {
        return this.notesService.sugerirVinculos(id, req.user.sub);
    }
    async exportarPDF(id, req, res) {
        const nota = await this.notesService.obtenerUna(id, req.user.sub);
        this.exportService.exportarPDF(nota.titulo, nota.contenido, res);
    }
    async exportarMarkdown(id, req, res) {
        const nota = await this.notesService.obtenerUna(id, req.user.sub);
        this.exportService.exportarMarkdown(nota.titulo, nota.contenido, res);
    }
};
exports.NotesController = NotesController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [note_dto_1.CreateNoteDto, Object]),
    __metadata("design:returntype", void 0)
], NotesController.prototype, "crear", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], NotesController.prototype, "obtenerMias", null);
__decorate([
    (0, common_1.Get)('buscar'),
    __param(0, (0, common_1.Query)('q')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], NotesController.prototype, "buscar", null);
__decorate([
    (0, common_1.Get)('estado/:estado'),
    __param(0, (0, common_1.Param)('estado')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], NotesController.prototype, "porEstado", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], NotesController.prototype, "obtenerUna", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, note_dto_1.UpdateNoteDto, Object]),
    __metadata("design:returntype", void 0)
], NotesController.prototype, "actualizar", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], NotesController.prototype, "eliminar", null);
__decorate([
    (0, common_1.Get)(':id/vinculos'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], NotesController.prototype, "sugerirVinculos", null);
__decorate([
    (0, common_1.Get)(':id/export/pdf'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_2.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], NotesController.prototype, "exportarPDF", null);
__decorate([
    (0, common_1.Get)(':id/export/markdown'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_2.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], NotesController.prototype, "exportarMarkdown", null);
exports.NotesController = NotesController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('notes'),
    __metadata("design:paramtypes", [notes_service_1.NotesService, export_service_1.ExportService])
], NotesController);
//# sourceMappingURL=notes.controller.js.map