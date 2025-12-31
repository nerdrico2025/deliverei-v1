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
exports.AvaliacoesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const utils_1 = require("../utils");
let AvaliacoesService = class AvaliacoesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createAvaliacaoDto, usuarioId, empresaId) {
        const produto = await this.prisma.produto.findFirst({
            where: { id: createAvaliacaoDto.produtoId, empresaId },
        });
        (0, utils_1.validateEntityExists)(produto, 'Produto');
        return this.prisma.avaliacao.create({
            data: {
                ...createAvaliacaoDto,
                usuarioId,
            },
            include: {
                usuario: {
                    select: {
                        id: true,
                        nome: true,
                        email: true,
                    },
                },
                produto: {
                    select: {
                        id: true,
                        nome: true,
                    },
                },
            },
        });
    }
    async findByProduto(produtoId, empresaId) {
        const produto = await this.prisma.produto.findFirst({
            where: { id: produtoId, empresaId },
        });
        (0, utils_1.validateEntityExists)(produto, 'Produto');
        const avaliacoes = await this.prisma.avaliacao.findMany({
            where: { produtoId },
            include: {
                usuario: {
                    select: {
                        id: true,
                        nome: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        const total = avaliacoes.length;
        const soma = avaliacoes.reduce((acc, av) => acc + av.nota, 0);
        const media = total > 0 ? soma / total : 0;
        return {
            avaliacoes,
            estatisticas: {
                total,
                media: Number(media.toFixed(1)),
            },
        };
    }
    async findByUsuario(usuarioId, empresaId) {
        return this.prisma.avaliacao.findMany({
            where: {
                usuarioId,
                produto: { empresaId }
            },
            include: {
                produto: {
                    select: {
                        id: true,
                        nome: true,
                        imagem: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async remove(id, usuarioId, empresaId) {
        const avaliacao = await this.prisma.avaliacao.findUnique({
            where: { id },
            include: { produto: true },
        });
        if (!avaliacao) {
            throw new common_1.NotFoundException('Avaliação não encontrada');
        }
        if (avaliacao.usuarioId !== usuarioId) {
            throw new common_1.ForbiddenException('Você não pode deletar esta avaliação');
        }
        if (avaliacao.produto.empresaId !== empresaId) {
            throw new common_1.ForbiddenException('Avaliação não encontrada');
        }
        return this.prisma.avaliacao.delete({
            where: { id },
        });
    }
};
exports.AvaliacoesService = AvaliacoesService;
exports.AvaliacoesService = AvaliacoesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AvaliacoesService);
//# sourceMappingURL=avaliacoes.service.js.map