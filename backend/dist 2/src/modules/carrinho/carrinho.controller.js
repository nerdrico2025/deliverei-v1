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
exports.CarrinhoController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const carrinho_service_1 = require("./carrinho.service");
const jwt_auth_guard_1 = require("../../guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../decorators/current-user.decorator");
const current_empresa_decorator_1 = require("../../decorators/current-empresa.decorator");
const dto_1 = require("./dto");
let CarrinhoController = class CarrinhoController {
    constructor(carrinhoService) {
        this.carrinhoService = carrinhoService;
    }
    async obterCarrinho(usuarioId, empresaId) {
        return this.carrinhoService.obterCarrinho(usuarioId, empresaId);
    }
    async adicionarItem(usuarioId, empresaId, dto) {
        return this.carrinhoService.adicionarItem(usuarioId, empresaId, dto);
    }
    async atualizarItem(usuarioId, empresaId, itemId, dto) {
        return this.carrinhoService.atualizarItem(usuarioId, empresaId, itemId, dto);
    }
    async removerItem(usuarioId, empresaId, itemId) {
        return this.carrinhoService.removerItem(usuarioId, empresaId, itemId);
    }
    async limparCarrinho(usuarioId, empresaId) {
        return this.carrinhoService.limparCarrinho(usuarioId, empresaId);
    }
    async checkout(usuarioId, empresaId, dto) {
        return this.carrinhoService.checkout(usuarioId, empresaId, dto);
    }
    async obterRecomendacoes(usuarioId, empresaId) {
        return this.carrinhoService.obterRecomendacoes(usuarioId, empresaId);
    }
};
exports.CarrinhoController = CarrinhoController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Obter carrinho atual do usuário' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, current_empresa_decorator_1.CurrentEmpresa)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CarrinhoController.prototype, "obterCarrinho", null);
__decorate([
    (0, common_1.Post)('itens'),
    (0, swagger_1.ApiOperation)({ summary: 'Adicionar item ao carrinho' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, current_empresa_decorator_1.CurrentEmpresa)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, dto_1.AdicionarItemCarrinhoDto]),
    __metadata("design:returntype", Promise)
], CarrinhoController.prototype, "adicionarItem", null);
__decorate([
    (0, common_1.Patch)('itens/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Atualizar item do carrinho' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, current_empresa_decorator_1.CurrentEmpresa)()),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, dto_1.AtualizarItemCarrinhoDto]),
    __metadata("design:returntype", Promise)
], CarrinhoController.prototype, "atualizarItem", null);
__decorate([
    (0, common_1.Delete)('itens/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Remover item do carrinho' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, current_empresa_decorator_1.CurrentEmpresa)()),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], CarrinhoController.prototype, "removerItem", null);
__decorate([
    (0, common_1.Delete)(),
    (0, swagger_1.ApiOperation)({ summary: 'Limpar carrinho' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, current_empresa_decorator_1.CurrentEmpresa)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CarrinhoController.prototype, "limparCarrinho", null);
__decorate([
    (0, common_1.Post)('checkout'),
    (0, swagger_1.ApiOperation)({ summary: 'Finalizar pedido (checkout)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, current_empresa_decorator_1.CurrentEmpresa)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, dto_1.CheckoutDto]),
    __metadata("design:returntype", Promise)
], CarrinhoController.prototype, "checkout", null);
__decorate([
    (0, common_1.Get)('recomendacoes'),
    (0, swagger_1.ApiOperation)({ summary: 'Obter produtos recomendados' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, current_empresa_decorator_1.CurrentEmpresa)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CarrinhoController.prototype, "obterRecomendacoes", null);
exports.CarrinhoController = CarrinhoController = __decorate([
    (0, swagger_1.ApiTags)('Carrinho'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('carrinho'),
    __metadata("design:paramtypes", [carrinho_service_1.CarrinhoService])
], CarrinhoController);
//# sourceMappingURL=carrinho.controller.js.map