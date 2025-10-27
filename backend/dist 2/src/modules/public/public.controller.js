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
exports.PublicController = void 0;
const common_1 = require("@nestjs/common");
const public_service_1 = require("./public.service");
const public_decorator_1 = require("../../decorators/public.decorator");
let PublicController = class PublicController {
    constructor(publicService) {
        this.publicService = publicService;
    }
    async getLojaInfo(slug) {
        return this.publicService.getLojaBySlug(slug);
    }
    async getProdutos(slug, page, limit, categoria, search) {
        return this.publicService.getProdutosByLoja(slug, page, limit, categoria, search);
    }
    async getProdutoById(slug, id) {
        return this.publicService.getProdutoById(slug, id);
    }
    async getCategorias(slug) {
        return this.publicService.getCategorias(slug);
    }
};
exports.PublicController = PublicController;
__decorate([
    (0, common_1.Get)(':slug/info'),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PublicController.prototype, "getLojaInfo", null);
__decorate([
    (0, common_1.Get)(':slug/produtos'),
    __param(0, (0, common_1.Param)('slug')),
    __param(1, (0, common_1.Query)('page', new common_1.DefaultValuePipe(1), common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(20), common_1.ParseIntPipe)),
    __param(3, (0, common_1.Query)('categoria')),
    __param(4, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number, String, String]),
    __metadata("design:returntype", Promise)
], PublicController.prototype, "getProdutos", null);
__decorate([
    (0, common_1.Get)(':slug/produtos/:id'),
    __param(0, (0, common_1.Param)('slug')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PublicController.prototype, "getProdutoById", null);
__decorate([
    (0, common_1.Get)(':slug/categorias'),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PublicController.prototype, "getCategorias", null);
exports.PublicController = PublicController = __decorate([
    (0, common_1.Controller)('public'),
    (0, public_decorator_1.Public)(),
    __metadata("design:paramtypes", [public_service_1.PublicService])
], PublicController);
//# sourceMappingURL=public.controller.js.map