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
exports.CreateProdutoDto = void 0;
const class_validator_1 = require("class-validator");
class CreateProdutoDto {
}
exports.CreateProdutoDto = CreateProdutoDto;
__decorate([
    (0, class_validator_1.IsString)({ message: 'Nome deve ser uma string' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Nome é obrigatório' }),
    __metadata("design:type", String)
], CreateProdutoDto.prototype, "nome", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Descrição deve ser uma string' }),
    __metadata("design:type", String)
], CreateProdutoDto.prototype, "descricao", void 0);
__decorate([
    (0, class_validator_1.IsNumber)({}, { message: 'Preço deve ser um número' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Preço é obrigatório' }),
    (0, class_validator_1.Min)(0, { message: 'Preço não pode ser negativo' }),
    __metadata("design:type", Number)
], CreateProdutoDto.prototype, "preco", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Imagem deve ser uma string (URL)' }),
    __metadata("design:type", String)
], CreateProdutoDto.prototype, "imagem", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ message: 'Ativo deve ser um booleano' }),
    __metadata("design:type", Boolean)
], CreateProdutoDto.prototype, "ativo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)({ message: 'Estoque deve ser um número inteiro' }),
    (0, class_validator_1.Min)(0, { message: 'Estoque não pode ser negativo' }),
    __metadata("design:type", Number)
], CreateProdutoDto.prototype, "estoque", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Categoria deve ser uma string' }),
    __metadata("design:type", String)
], CreateProdutoDto.prototype, "categoria", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ message: 'promo_tag deve ser um booleano' }),
    __metadata("design:type", Boolean)
], CreateProdutoDto.prototype, "promo_tag", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ message: 'bestseller_tag deve ser um booleano' }),
    __metadata("design:type", Boolean)
], CreateProdutoDto.prototype, "bestseller_tag", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ message: 'new_tag deve ser um booleano' }),
    __metadata("design:type", Boolean)
], CreateProdutoDto.prototype, "new_tag", void 0);
//# sourceMappingURL=create-produto.dto.js.map