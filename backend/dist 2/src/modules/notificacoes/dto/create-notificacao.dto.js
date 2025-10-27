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
exports.CreateNotificacaoDto = void 0;
const class_validator_1 = require("class-validator");
class CreateNotificacaoDto {
}
exports.CreateNotificacaoDto = CreateNotificacaoDto;
__decorate([
    (0, class_validator_1.IsString)({ message: 'Título deve ser uma string' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Título é obrigatório' }),
    __metadata("design:type", String)
], CreateNotificacaoDto.prototype, "titulo", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'Mensagem deve ser uma string' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Mensagem é obrigatória' }),
    __metadata("design:type", String)
], CreateNotificacaoDto.prototype, "mensagem", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'Tipo deve ser uma string' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Tipo é obrigatório' }),
    (0, class_validator_1.IsIn)(['PEDIDO', 'SISTEMA', 'PROMOCAO'], {
        message: 'Tipo deve ser PEDIDO, SISTEMA ou PROMOCAO',
    }),
    __metadata("design:type", String)
], CreateNotificacaoDto.prototype, "tipo", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'UsuarioId deve ser uma string' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'UsuarioId é obrigatório' }),
    __metadata("design:type", String)
], CreateNotificacaoDto.prototype, "usuarioId", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'EmpresaId deve ser uma string' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateNotificacaoDto.prototype, "empresaId", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'PedidoId deve ser uma string' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateNotificacaoDto.prototype, "pedidoId", void 0);
//# sourceMappingURL=create-notificacao.dto.js.map