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
exports.AdicionarItemCarrinhoDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class AdicionarItemCarrinhoDto {
}
exports.AdicionarItemCarrinhoDto = AdicionarItemCarrinhoDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID do produto',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdicionarItemCarrinhoDto.prototype, "produtoId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Quantidade do produto',
        example: 2,
        minimum: 1,
    }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], AdicionarItemCarrinhoDto.prototype, "quantidade", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Observações sobre o item',
        example: 'Sem cebola',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdicionarItemCarrinhoDto.prototype, "observacoes", void 0);
//# sourceMappingURL=adicionar-item-carrinho.dto.js.map