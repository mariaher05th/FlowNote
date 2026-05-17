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
exports.RemindersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const reminder_schema_1 = require("./schemas/reminder.schema");
let RemindersService = class RemindersService {
    constructor(reminderModel) {
        this.reminderModel = reminderModel;
    }
    async crear(dto, userId) {
        return this.reminderModel.create({
            nota_id: new mongoose_2.Types.ObjectId(dto.nota_id),
            usuario_id: new mongoose_2.Types.ObjectId(userId),
            mensaje: dto.mensaje,
            fecha_hora: new Date(dto.fecha_hora),
        });
    }
    async misRecordatorios(userId) {
        return this.reminderModel
            .find({ usuario_id: new mongoose_2.Types.ObjectId(userId) })
            .populate('nota_id', 'titulo')
            .sort({ fecha_hora: 1 });
    }
    async proximos(userId) {
        const ahora = new Date();
        const manana = new Date(ahora.getTime() + 24 * 60 * 60 * 1000);
        return this.reminderModel
            .find({
            usuario_id: new mongoose_2.Types.ObjectId(userId),
            fecha_hora: { $gte: ahora, $lte: manana },
            enviado: false,
        })
            .populate('nota_id', 'titulo')
            .sort({ fecha_hora: 1 });
    }
    async porNota(notaId, userId) {
        return this.reminderModel
            .find({
            nota_id: new mongoose_2.Types.ObjectId(notaId),
            usuario_id: new mongoose_2.Types.ObjectId(userId),
        })
            .sort({ fecha_hora: 1 });
    }
    async actualizar(id, dto, userId) {
        const recordatorio = await this.reminderModel.findById(id);
        if (!recordatorio)
            throw new common_1.NotFoundException('Recordatorio no encontrado');
        if (recordatorio.usuario_id.toString() !== userId) {
            throw new common_1.ForbiddenException('No puedes modificar este recordatorio');
        }
        const actualizado = { ...dto };
        if (dto.fecha_hora)
            actualizado.fecha_hora = new Date(dto.fecha_hora);
        return this.reminderModel.findByIdAndUpdate(id, actualizado, { new: true });
    }
    async eliminar(id, userId) {
        const recordatorio = await this.reminderModel.findById(id);
        if (!recordatorio)
            throw new common_1.NotFoundException('Recordatorio no encontrado');
        if (recordatorio.usuario_id.toString() !== userId) {
            throw new common_1.ForbiddenException('No puedes eliminar este recordatorio');
        }
        await this.reminderModel.findByIdAndDelete(id);
        return { mensaje: 'Recordatorio eliminado correctamente' };
    }
    async marcarEnviado(id) {
        return this.reminderModel.findByIdAndUpdate(id, { enviado: true }, { new: true });
    }
};
exports.RemindersService = RemindersService;
exports.RemindersService = RemindersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(reminder_schema_1.Reminder.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], RemindersService);
//# sourceMappingURL=reminders.service.js.map