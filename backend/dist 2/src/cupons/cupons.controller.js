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
exports.CuponsController = void 0;
const common_1 = require("@nestjs/common");
const cupons_service_1 = require("./cupons.service");
const create_cupom_dto_1 = require("./dto/create-cupom.dto");
const update_cupom_dto_1 = require("./dto/update-cupom.dto");
const validar_cupom_dto_1 = require("./dto/validar-cupom.dto");
const jwt_auth_guard_1 = require("../guards/jwt-auth.guard");
const roles_guard_1 = require("../guards/roles.guard");
const roles_decorator_1 = require("../decorators/roles.decorator");
const TipoUsuario = {
    CLIENTE: 'CLIENTE',
    ADMIN_EMPRESA: 'ADMIN_EMPRESA',
    SUPER_ADMIN: 'SUPER_ADMIN'
};
let CuponsController = class CuponsController {
    constructor(cuponsService) {
        this.cuponsService = cuponsService;
    }
    create(createCupomDto, req) {
        return this.cuponsService.create(createCupomDto, req.user.empresaId);
    }
    findAll(req) {
        return this.cuponsService.findAll(req.user.empresaId);
    }
    findOne(id, req) {
        return this.cuponsService.findOne(id, req.user.empresaId);
    }
    update(id, updateCupomDto, req) {
        return this.cuponsService.update(id, updateCupomDto, req.user.empresaId);
    }
    remove(id, req) {
        return this.cuponsService.remove(id, req.user.empresaId);
    }
    validar(validarCupomDto, req) {
        return this.cuponsService.validar(validarCupomDto, req.user.empresaId);
    }
};
exports.CuponsController = CuponsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(TipoUsuario.SUPER_ADMIN, TipoUsuario.ADMIN_EMPRESA),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_cupom_dto_1.CreateCupomDto, Object]),
    __metadata("design:returntype", void 0)
], CuponsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(TipoUsuario.SUPER_ADMIN, TipoUsuario.ADMIN_EMPRESA),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CuponsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(TipoUsuario.SUPER_ADMIN, TipoUsuario.ADMIN_EMPRESA),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CuponsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(TipoUsuario.SUPER_ADMIN, TipoUsuario.ADMIN_EMPRESA),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_cupom_dto_1.UpdateCupomDto, Object]),
    __metadata("design:returntype", void 0)
], CuponsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(TipoUsuario.SUPER_ADMIN, TipoUsuario.ADMIN_EMPRESA),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CuponsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)('validar'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [validar_cupom_dto_1.ValidarCupomDto, Object]),
    __metadata("design:returntype", void 0)
], CuponsController.prototype, "validar", null);
exports.CuponsController = CuponsController = __decorate([
    (0, common_1.Controller)('cupons'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [cupons_service_1.CuponsService])
], CuponsController);
//# sourceMappingURL=cupons.controller.js.map