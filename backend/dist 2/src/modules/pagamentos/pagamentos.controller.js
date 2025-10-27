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
exports.PagamentosController = void 0;
const common_1 = require("@nestjs/common");
const pagamentos_service_1 = require("./pagamentos.service");
const create_pagamento_dto_1 = require("./dto/create-pagamento.dto");
const jwt_auth_guard_1 = require("../../guards/jwt-auth.guard");
let PagamentosController = class PagamentosController {
    constructor(pagamentosService) {
        this.pagamentosService = pagamentosService;
    }
    async criarPagamento(dto, req) {
        return this.pagamentosService.criarPagamento(dto, req.user.empresaId);
    }
    async buscarPagamento(id, req) {
        return this.pagamentosService.buscarPagamento(id, req.user.empresaId);
    }
    async buscarPagamentosPorPedido(pedidoId, req) {
        return this.pagamentosService.buscarPagamentosPorPedido(pedidoId, req.user.empresaId);
    }
    async buscarPagamentosEmpresa(req) {
        return this.pagamentosService.buscarPagamentosEmpresa(req.user.empresaId);
    }
    async cancelarPagamento(id, req) {
        return this.pagamentosService.cancelarPagamento(id, req.user.empresaId);
    }
};
exports.PagamentosController = PagamentosController;
__decorate([
    (0, common_1.Post)('criar'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_pagamento_dto_1.CreatePagamentoDto, Object]),
    __metadata("design:returntype", Promise)
], PagamentosController.prototype, "criarPagamento", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PagamentosController.prototype, "buscarPagamento", null);
__decorate([
    (0, common_1.Get)('pedido/:pedidoId'),
    __param(0, (0, common_1.Param)('pedidoId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PagamentosController.prototype, "buscarPagamentosPorPedido", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PagamentosController.prototype, "buscarPagamentosEmpresa", null);
__decorate([
    (0, common_1.Post)(':id/cancelar'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PagamentosController.prototype, "cancelarPagamento", null);
exports.PagamentosController = PagamentosController = __decorate([
    (0, common_1.Controller)('pagamentos'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [pagamentos_service_1.PagamentosService])
], PagamentosController);
//# sourceMappingURL=pagamentos.controller.js.map