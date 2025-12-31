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
exports.CuponsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const utils_1 = require("../utils");
let CuponsService = class CuponsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createCupomDto, empresaId) {
        const cupomExistente = await this.prisma.cupom.findFirst({
            where: {
                codigo: createCupomDto.codigo,
                empresaId
            },
        });
        if (cupomExistente) {
            throw new common_1.BadRequestException('Código de cupom já existe');
        }
        return this.prisma.cupom.create({
            data: {
                codigo: createCupomDto.codigo,
                descricao: createCupomDto.descricao,
                tipo: createCupomDto.tipo,
                valor: createCupomDto.valor,
                valorMinimo: createCupomDto.valorMinimo,
                dataInicio: new Date(createCupomDto.dataInicio),
                dataFim: new Date(createCupomDto.dataFim),
                ativo: createCupomDto.ativo ?? true,
                usoMaximo: createCupomDto.usoMaximo,
                empresaId,
            },
        });
    }
    async findAll(empresaId) {
        return this.prisma.cupom.findMany({
            where: { empresaId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id, empresaId) {
        const cupom = await this.prisma.cupom.findFirst({
            where: { id, empresaId },
        });
        (0, utils_1.validateEntityExists)(cupom, 'Cupom');
        return cupom;
    }
    async update(id, updateCupomDto, empresaId) {
        await this.findOne(id, empresaId);
        return this.prisma.cupom.update({
            where: { id },
            data: updateCupomDto,
        });
    }
    async remove(id, empresaId) {
        await this.findOne(id, empresaId);
        return this.prisma.cupom.delete({
            where: { id },
        });
    }
    async validar(validarCupomDto, empresaId) {
        const cupom = await this.prisma.cupom.findFirst({
            where: {
                codigo: validarCupomDto.codigo,
                empresaId,
                ativo: true,
            },
        });
        (0, utils_1.validateEntityExists)(cupom, 'Cupom (não encontrado ou inativo)');
        const agora = new Date();
        if (agora < cupom.dataInicio || agora > cupom.dataFim) {
            throw new common_1.BadRequestException('Cupom fora do período de validade');
        }
        if (cupom.usoMaximo && cupom.usoAtual >= cupom.usoMaximo) {
            throw new common_1.BadRequestException('Cupom atingiu o limite de uso');
        }
        if (cupom.valorMinimo && validarCupomDto.valorCompra < Number(cupom.valorMinimo)) {
            throw new common_1.BadRequestException(`Valor mínimo de compra não atingido. Mínimo: R$ ${cupom.valorMinimo}`);
        }
        let desconto = 0;
        if (cupom.tipo === 'PERCENTUAL') {
            desconto = (validarCupomDto.valorCompra * Number(cupom.valor)) / 100;
        }
        else {
            desconto = Number(cupom.valor);
        }
        return {
            cupom,
            desconto,
            valorFinal: validarCupomDto.valorCompra - desconto,
        };
    }
    async incrementarUso(codigo, empresaId) {
        const cupom = await this.prisma.cupom.findFirst({
            where: { codigo, empresaId },
        });
        if (!cupom) {
            throw new common_1.BadRequestException('Cupom não encontrado');
        }
        return this.prisma.cupom.update({
            where: { id: cupom.id },
            data: {
                usoAtual: {
                    increment: 1,
                },
            },
        });
    }
};
exports.CuponsService = CuponsService;
exports.CuponsService = CuponsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CuponsService);
//# sourceMappingURL=cupons.service.js.map