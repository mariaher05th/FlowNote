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
exports.SpaceSchema = exports.Space = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let Space = class Space {
};
exports.Space = Space;
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], Space.prototype, "nombre", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '' }),
    __metadata("design:type", String)
], Space.prototype, "descripcion", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Space.prototype, "creador_id", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [{
                usuario_id: { type: mongoose_2.Types.ObjectId, ref: 'User' },
                rol: { type: String, enum: ['editor', 'revisor', 'observador'], default: 'observador' },
                joined_at: { type: Date, default: Date.now },
            }],
        default: [],
    }),
    __metadata("design:type", Array)
], Space.prototype, "miembros", void 0);
exports.Space = Space = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Space);
exports.SpaceSchema = mongoose_1.SchemaFactory.createForClass(Space);
//# sourceMappingURL=space.schema.js.map