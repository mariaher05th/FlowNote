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
exports.SpacesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const space_schema_1 = require("./schemas/space.schema");
let SpacesService = class SpacesService {
    constructor(spaceModel) {
        this.spaceModel = spaceModel;
    }
    async crear(dto, userId) {
        const espacio = await this.spaceModel.create({
            ...dto,
            creador_id: new mongoose_2.Types.ObjectId(userId),
            miembros: [{
                    usuario_id: new mongoose_2.Types.ObjectId(userId),
                    rol: 'editor',
                }],
        });
        return espacio;
    }
    async misEspacios(userId) {
        return this.spaceModel.find({
            'miembros.usuario_id': new mongoose_2.Types.ObjectId(userId),
        }).populate('creador_id', 'nombre email');
    }
    async obtenerUno(id, userId) {
        const espacio = await this.spaceModel
            .findById(id)
            .populate('miembros.usuario_id', 'nombre email');
        if (!espacio)
            throw new common_1.NotFoundException('Espacio no encontrado');
        const esMiembro = espacio.miembros.some(m => m.usuario_id.toString() === userId);
        if (!esMiembro)
            throw new common_1.ForbiddenException('No eres miembro de este espacio');
        return espacio;
    }
    async invitar(id, dto, userId) {
        const espacio = await this.spaceModel.findById(id);
        if (!espacio)
            throw new common_1.NotFoundException('Espacio no encontrado');
        const solicitante = espacio.miembros.find(m => m.usuario_id.toString() === userId);
        if (!solicitante || solicitante.rol !== 'editor') {
            throw new common_1.ForbiddenException('Solo los editores pueden invitar miembros');
        }
        const yaExiste = espacio.miembros.some(m => m.usuario_id.toString() === dto.usuario_id);
        if (yaExiste)
            throw new common_1.ConflictException('El usuario ya es miembro de este espacio');
        espacio.miembros.push({
            usuario_id: new mongoose_2.Types.ObjectId(dto.usuario_id),
            rol: dto.rol,
            joined_at: new Date(),
        });
        return espacio.save();
    }
    async cambiarRol(espacioId, miembroId, dto, userId) {
        const espacio = await this.spaceModel.findById(espacioId);
        if (!espacio)
            throw new common_1.NotFoundException('Espacio no encontrado');
        if (espacio.creador_id.toString() !== userId) {
            throw new common_1.ForbiddenException('Solo el creador puede cambiar roles');
        }
        const miembro = espacio.miembros.find(m => m.usuario_id.toString() === miembroId);
        if (!miembro)
            throw new common_1.NotFoundException('Miembro no encontrado');
        miembro.rol = dto.rol;
        return espacio.save();
    }
    async eliminarMiembro(espacioId, miembroId, userId) {
        const espacio = await this.spaceModel.findById(espacioId);
        if (!espacio)
            throw new common_1.NotFoundException('Espacio no encontrado');
        if (espacio.creador_id.toString() !== userId && miembroId !== userId) {
            throw new common_1.ForbiddenException('No tienes permiso para esta acción');
        }
        espacio.miembros = espacio.miembros.filter(m => m.usuario_id.toString() !== miembroId);
        return espacio.save();
    }
};
exports.SpacesService = SpacesService;
exports.SpacesService = SpacesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(space_schema_1.Space.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], SpacesService);
//# sourceMappingURL=spaces.service.js.map