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
exports.PedidosController = exports.TipoUsuario = void 0;
const common_1 = require("@nestjs/common");
const pedidos_service_1 = require("./pedidos.service");
const update_status_pedido_dto_1 = require("./dto/update-status-pedido.dto");
const filtrar_pedidos_dto_1 = require("./dto/filtrar-pedidos.dto");
const jwt_auth_guard_1 = require("../guards/jwt-auth.guard");
const roles_guard_1 = require("../guards/roles.guard");
const roles_decorator_1 = require("../decorators/roles.decorator");
exports.TipoUsuario = {
    CLIENTE: 'CLIENTE',
    ADMIN_EMPRESA: 'ADMIN_EMPRESA',
    SUPER_ADMIN: 'SUPER_ADMIN'
};
let PedidosController = class PedidosController {
    constructor(pedidosService) {
        this.pedidosService = pedidosService;
    }
    findAll(filtros, req) {
        return this.pedidosService.findAll(filtros, req.user.empresaId);
    }
    findMeusPedidos(req, page = '1', limit = '10') {
        return this.pedidosService.findMeusPedidos(req.user.sub, req.user.empresaId, parseInt(page, 10), parseInt(limit, 10));
    }
    findOne(id, req) {
        const isAdmin = [exports.TipoUsuario.SUPER_ADMIN, exports.TipoUsuario.ADMIN_EMPRESA].includes(req.user.role);
        return this.pedidosService.findOne(id, req.user.empresaId, isAdmin ? undefined : req.user.sub);
    }
    updateStatus(id, updateStatusDto, req) {
        return this.pedidosService.updateStatus(id, updateStatusDto, req.user.empresaId);
    }
    cancel(id, req) {
        const isAdmin = [exports.TipoUsuario.SUPER_ADMIN, exports.TipoUsuario.ADMIN_EMPRESA].includes(req.user.role);
        return this.pedidosService.cancel(id, req.user.empresaId, req.user.sub, isAdmin);
    }
};
exports.PedidosController = PedidosController;
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(exports.TipoUsuario.SUPER_ADMIN, exports.TipoUsuario.ADMIN_EMPRESA),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [filtrar_pedidos_dto_1.FiltrarPedidosDto, Object]),
    __metadata("design:returntype", void 0)
], PedidosController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('meus'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], PedidosController.prototype, "findMeusPedidos", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PedidosController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(exports.TipoUsuario.SUPER_ADMIN, exports.TipoUsuario.ADMIN_EMPRESA),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_status_pedido_dto_1.UpdateStatusPedidoDto, Object]),
    __metadata("design:returntype", void 0)
], PedidosController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PedidosController.prototype, "cancel", null);
exports.PedidosController = PedidosController = __decorate([
    (0, common_1.Controller)('pedidos'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [pedidos_service_1.PedidosService])
], PedidosController);
//# sourceMappingURL=pedidos.controller.js.map