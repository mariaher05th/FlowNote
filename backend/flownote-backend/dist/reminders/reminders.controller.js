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
exports.RemindersController = void 0;
const common_1 = require("@nestjs/common");
const reminders_service_1 = require("./reminders.service");
const reminder_dto_1 = require("./dto/reminder.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
let RemindersController = class RemindersController {
    constructor(remindersService) {
        this.remindersService = remindersService;
    }
    crear(dto, req) {
        return this.remindersService.crear(dto, req.user.sub);
    }
    misRecordatorios(req) {
        return this.remindersService.misRecordatorios(req.user.sub);
    }
    proximos(req) {
        return this.remindersService.proximos(req.user.sub);
    }
    porNota(notaId, req) {
        return this.remindersService.porNota(notaId, req.user.sub);
    }
    actualizar(id, dto, req) {
        return this.remindersService.actualizar(id, dto, req.user.sub);
    }
    eliminar(id, req) {
        return this.remindersService.eliminar(id, req.user.sub);
    }
};
exports.RemindersController = RemindersController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reminder_dto_1.CreateReminderDto, Object]),
    __metadata("design:returntype", void 0)
], RemindersController.prototype, "crear", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RemindersController.prototype, "misRecordatorios", null);
__decorate([
    (0, common_1.Get)('proximos'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RemindersController.prototype, "proximos", null);
__decorate([
    (0, common_1.Get)('nota/:notaId'),
    __param(0, (0, common_1.Param)('notaId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], RemindersController.prototype, "porNota", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, reminder_dto_1.UpdateReminderDto, Object]),
    __metadata("design:returntype", void 0)
], RemindersController.prototype, "actualizar", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], RemindersController.prototype, "eliminar", null);
exports.RemindersController = RemindersController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('reminders'),
    __metadata("design:paramtypes", [reminders_service_1.RemindersService])
], RemindersController);
//# sourceMappingURL=reminders.controller.js.map