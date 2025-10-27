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
exports.CadastroEmpresaDto = void 0;
const class_validator_1 = require("class-validator");
class CadastroEmpresaDto {
}
exports.CadastroEmpresaDto = CadastroEmpresaDto;
__decorate([
    (0, class_validator_1.IsString)({ message: 'Nome da empresa deve ser uma string' }),
    __metadata("design:type", String)
], CadastroEmpresaDto.prototype, "nomeEmpresa", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'Slug deve ser uma string' }),
    __metadata("design:type", String)
], CadastroEmpresaDto.prototype, "slug", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Telefone da empresa deve ser uma string' }),
    __metadata("design:type", String)
], CadastroEmpresaDto.prototype, "telefoneEmpresa", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Endereço deve ser uma string' }),
    __metadata("design:type", String)
], CadastroEmpresaDto.prototype, "endereco", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Cidade deve ser uma string' }),
    __metadata("design:type", String)
], CadastroEmpresaDto.prototype, "cidade", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Estado deve ser uma string' }),
    __metadata("design:type", String)
], CadastroEmpresaDto.prototype, "estado", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'CEP deve ser uma string' }),
    __metadata("design:type", String)
], CadastroEmpresaDto.prototype, "cep", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'Nome do admin deve ser uma string' }),
    __metadata("design:type", String)
], CadastroEmpresaDto.prototype, "nomeAdmin", void 0);
__decorate([
    (0, class_validator_1.IsEmail)({}, { message: 'Email do admin deve ter um formato válido' }),
    __metadata("design:type", String)
], CadastroEmpresaDto.prototype, "emailAdmin", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'Senha deve ser uma string' }),
    (0, class_validator_1.MinLength)(6, { message: 'Senha deve ter pelo menos 6 caracteres' }),
    __metadata("design:type", String)
], CadastroEmpresaDto.prototype, "senhaAdmin", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Telefone do admin deve ser uma string' }),
    __metadata("design:type", String)
], CadastroEmpresaDto.prototype, "telefoneAdmin", void 0);
//# sourceMappingURL=cadastro-empresa.dto.js.map