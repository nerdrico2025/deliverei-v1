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
exports.ProdutosController = void 0;
const common_1 = require("@nestjs/common");
const produtos_service_1 = require("./produtos.service");
const dto_1 = require("./dto");
const jwt_auth_guard_1 = require("../../guards/jwt-auth.guard");
const roles_guard_1 = require("../../guards/roles.guard");
const roles_decorator_1 = require("../../decorators/roles.decorator");
const current_user_decorator_1 = require("../../decorators/current-user.decorator");
const TipoUsuario = {
    CLIENTE: 'CLIENTE',
    ADMIN_EMPRESA: 'ADMIN_EMPRESA',
    SUPER_ADMIN: 'SUPER_ADMIN'
};
let ProdutosController = class ProdutosController {
    constructor(produtosService) {
        this.produtosService = produtosService;
    }
    create(createProdutoDto, empresaId) {
        return this.produtosService.create(createProdutoDto, empresaId);
    }
    findAll(empresaId, page, limit, categoria, search, ativo) {
        return this.produtosService.findAll(empresaId, page, limit, categoria, search, ativo);
    }
    findOne(id, empresaId) {
        return this.produtosService.findOne(id, empresaId);
    }
    update(id, updateProdutoDto, empresaId) {
        return this.produtosService.update(id, updateProdutoDto, empresaId);
    }
    remove(id, empresaId) {
        return this.produtosService.remove(id, empresaId);
    }
    hardRemove(id, empresaId) {
        return this.produtosService.hardRemove(id, empresaId);
    }
};
exports.ProdutosController = ProdutosController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(TipoUsuario.ADMIN_EMPRESA, TipoUsuario.SUPER_ADMIN),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('empresaId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateProdutoDto, String]),
    __metadata("design:returntype", void 0)
], ProdutosController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(TipoUsuario.ADMIN_EMPRESA, TipoUsuario.SUPER_ADMIN),
    __param(0, (0, current_user_decorator_1.CurrentUser)('empresaId')),
    __param(1, (0, common_1.Query)('page', new common_1.DefaultValuePipe(1), common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(20), common_1.ParseIntPipe)),
    __param(3, (0, common_1.Query)('categoria')),
    __param(4, (0, common_1.Query)('search')),
    __param(5, (0, common_1.Query)('ativo', new common_1.DefaultValuePipe(undefined))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number, String, String, Boolean]),
    __metadata("design:returntype", void 0)
], ProdutosController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(TipoUsuario.ADMIN_EMPRESA, TipoUsuario.SUPER_ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('empresaId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ProdutosController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(TipoUsuario.ADMIN_EMPRESA, TipoUsuario.SUPER_ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('empresaId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateProdutoDto, String]),
    __metadata("design:returntype", void 0)
], ProdutosController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(TipoUsuario.ADMIN_EMPRESA, TipoUsuario.SUPER_ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('empresaId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ProdutosController.prototype, "remove", null);
__decorate([
    (0, common_1.Delete)(':id/hard'),
    (0, roles_decorator_1.Roles)(TipoUsuario.SUPER_ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('empresaId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ProdutosController.prototype, "hardRemove", null);
exports.ProdutosController = ProdutosController = __decorate([
    (0, common_1.Controller)('produtos'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [produtos_service_1.ProdutosService])
], ProdutosController);
//# sourceMappingURL=produtos.controller.js.map