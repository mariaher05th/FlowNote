"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpacesModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const spaces_service_1 = require("./spaces.service");
const spaces_controller_1 = require("./spaces.controller");
const space_schema_1 = require("./schemas/space.schema");
let SpacesModule = class SpacesModule {
};
exports.SpacesModule = SpacesModule;
exports.SpacesModule = SpacesModule = __decorate([
    (0, common_1.Module)({
        imports: [mongoose_1.MongooseModule.forFeature([{ name: space_schema_1.Space.name, schema: space_schema_1.SpaceSchema }])],
        providers: [spaces_service_1.SpacesService],
        controllers: [spaces_controller_1.SpacesController],
        exports: [spaces_service_1.SpacesService],
    })
], SpacesModule);
//# sourceMappingURL=spaces.module.js.map