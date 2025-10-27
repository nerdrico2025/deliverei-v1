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
exports.FiltrarPedidosDto = exports.StatusPedido = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
exports.StatusPedido = {
    PENDENTE: 'PENDENTE',
    CONFIRMADO: 'CONFIRMADO',
    EM_PREPARO: 'EM_PREPARO',
    SAIU_ENTREGA: 'SAIU_ENTREGA',
    ENTREGUE: 'ENTREGUE',
    CANCELADO: 'CANCELADO'
};
class FiltrarPedidosDto {
    constructor() {
        this.page = 1;
        this.limit = 10;
    }
}
exports.FiltrarPedidosDto = FiltrarPedidosDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(exports.StatusPedido),
    __metadata("design:type", String)
], FiltrarPedidosDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], FiltrarPedidosDto.prototype, "dataInicio", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], FiltrarPedidosDto.prototype, "dataFim", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FiltrarPedidosDto.prototype, "usuarioId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], FiltrarPedidosDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], FiltrarPedidosDto.prototype, "limit", void 0);
//# sourceMappingURL=filtrar-pedidos.dto.js.map