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
exports.SpacesController = void 0;
const common_1 = require("@nestjs/common");
const spaces_service_1 = require("./spaces.service");
const space_dto_1 = require("./dto/space.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
let SpacesController = class SpacesController {
    constructor(spacesService) {
        this.spacesService = spacesService;
    }
    crear(dto, req) {
        return this.spacesService.crear(dto, req.user.sub);
    }
    misEspacios(req) {
        return this.spacesService.misEspacios(req.user.sub);
    }
    obtenerUno(id, req) {
        return this.spacesService.obtenerUno(id, req.user.sub);
    }
    invitar(id, dto, req) {
        return this.spacesService.invitar(id, dto, req.user.sub);
    }
    cambiarRol(id, miembroId, dto, req) {
        return this.spacesService.cambiarRol(id, miembroId, dto, req.user.sub);
    }
    eliminarMiembro(id, miembroId, req) {
        return this.spacesService.eliminarMiembro(id, miembroId, req.user.sub);
    }
};
exports.SpacesController = SpacesController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [space_dto_1.CreateSpaceDto, Object]),
    __metadata("design:returntype", void 0)
], SpacesController.prototype, "crear", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SpacesController.prototype, "misEspacios", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SpacesController.prototype, "obtenerUno", null);
__decorate([
    (0, common_1.Post)(':id/miembros'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, space_dto_1.InviteMemberDto, Object]),
    __metadata("design:returntype", void 0)
], SpacesController.prototype, "invitar", null);
__decorate([
    (0, common_1.Put)(':id/miembros/:miembroId'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('miembroId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, space_dto_1.UpdateMemberRoleDto, Object]),
    __metadata("design:returntype", void 0)
], SpacesController.prototype, "cambiarRol", null);
__decorate([
    (0, common_1.Delete)(':id/miembros/:miembroId'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('miembroId')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], SpacesController.prototype, "eliminarMiembro", null);
exports.SpacesController = SpacesController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('spaces'),
    __metadata("design:paramtypes", [spaces_service_1.SpacesService])
], SpacesController);
//# sourceMappingURL=spaces.controller.js.map