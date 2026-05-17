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
exports.CommentsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const comment_schema_1 = require("./schemas/comment.schema");
let CommentsService = class CommentsService {
    constructor(commentModel) {
        this.commentModel = commentModel;
    }
    async crear(dto, userId) {
        return this.commentModel.create({
            usuario_id: new mongoose_2.Types.ObjectId(userId),
            nota_id: new mongoose_2.Types.ObjectId(dto.nota_id),
            contenido: dto.contenido,
            posicion_char: dto.posicion_char ?? null,
        });
    }
    async porNota(notaId) {
        return this.commentModel
            .find({ nota_id: new mongoose_2.Types.ObjectId(notaId) })
            .populate('usuario_id', 'nombre email')
            .sort({ createdAt: 1 });
    }
    async actualizar(id, dto, userId) {
        const comentario = await this.commentModel.findById(id);
        if (!comentario)
            throw new common_1.NotFoundException('Comentario no encontrado');
        if (comentario.usuario_id.toString() !== userId) {
            throw new common_1.ForbiddenException('Solo el autor puede editar este comentario');
        }
        return this.commentModel.findByIdAndUpdate(id, { contenido: dto.contenido }, { new: true });
    }
    async eliminar(id, userId) {
        const comentario = await this.commentModel.findById(id);
        if (!comentario)
            throw new common_1.NotFoundException('Comentario no encontrado');
        if (comentario.usuario_id.toString() !== userId) {
            throw new common_1.ForbiddenException('Solo el autor puede eliminar este comentario');
        }
        await this.commentModel.findByIdAndDelete(id);
        return { mensaje: 'Comentario eliminado correctamente' };
    }
};
exports.CommentsService = CommentsService;
exports.CommentsService = CommentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(comment_schema_1.Comment.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], CommentsService);
//# sourceMappingURL=comments.service.js.map