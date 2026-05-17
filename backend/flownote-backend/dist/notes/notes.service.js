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
exports.NotesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const note_schema_1 = require("./schemas/note.schema");
let NotesService = class NotesService {
    constructor(noteModel) {
        this.noteModel = noteModel;
    }
    async crear(dto, userId) {
        const nota = await this.noteModel.create({
            ...dto,
            autor_id: new mongoose_2.Types.ObjectId(userId),
            espacio_id: dto.espacio_id ? new mongoose_2.Types.ObjectId(dto.espacio_id) : null,
        });
        return nota;
    }
    async obtenerMias(userId) {
        return this.noteModel
            .find({ autor_id: new mongoose_2.Types.ObjectId(userId) })
            .sort({ updatedAt: -1 });
    }
    async obtenerUna(id, userId) {
        const nota = await this.noteModel.findById(id);
        if (!nota)
            throw new common_1.NotFoundException('Nota no encontrada');
        if (nota.autor_id.toString() !== userId && !nota.es_colaborativa) {
            throw new common_1.ForbiddenException('No tienes acceso a esta nota');
        }
        return nota;
    }
    async actualizar(id, dto, userId) {
        const nota = await this.noteModel.findById(id);
        if (!nota)
            throw new common_1.NotFoundException('Nota no encontrada');
        if (nota.autor_id.toString() !== userId) {
            throw new common_1.ForbiddenException('No puedes editar esta nota');
        }
        return this.noteModel.findByIdAndUpdate(id, dto, { new: true });
    }
    async eliminar(id, userId) {
        const nota = await this.noteModel.findById(id);
        if (!nota)
            throw new common_1.NotFoundException('Nota no encontrada');
        if (nota.autor_id.toString() !== userId) {
            throw new common_1.ForbiddenException('No puedes eliminar esta nota');
        }
        await this.noteModel.findByIdAndDelete(id);
        return { mensaje: 'Nota eliminada correctamente' };
    }
    async buscar(query, userId) {
        if (!query || query.trim().length === 0)
            return [];
        const q = query.trim().substring(0, 200);
        return this.noteModel.find({
            autor_id: new mongoose_2.Types.ObjectId(userId),
            $text: { $search: q },
        }, { score: { $meta: 'textScore' } })
            .sort({ score: { $meta: 'textScore' } })
            .limit(20);
    }
    async sugerirVinculos(id, userId) {
        const nota = await this.obtenerUna(id, userId);
        if (!nota.contenido)
            return [];
        const palabras = nota.contenido
            .toLowerCase()
            .split(/\W+/)
            .filter(p => p.length > 4)
            .slice(0, 10);
        if (palabras.length === 0)
            return [];
        return this.noteModel.find({
            _id: { $ne: nota._id },
            autor_id: new mongoose_2.Types.ObjectId(userId),
            $or: palabras.map(p => ({
                $or: [
                    { titulo: { $regex: p, $options: 'i' } },
                    { contenido: { $regex: p, $options: 'i' } },
                ],
            })),
        }).limit(5);
    }
    async porEstado(estado, userId) {
        return this.noteModel.find({
            autor_id: new mongoose_2.Types.ObjectId(userId),
            estado,
        }).sort({ updatedAt: -1 });
    }
};
exports.NotesService = NotesService;
exports.NotesService = NotesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(note_schema_1.Note.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], NotesService);
//# sourceMappingURL=notes.service.js.map