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
exports.PublicService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
let PublicService = class PublicService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getLojaBySlug(slug) {
        const empresa = await this.prisma.empresa.findUnique({
            where: { slug },
        });
        if (!empresa) {
            throw new common_1.NotFoundException('Loja não encontrada');
        }
        if (!empresa.ativo) {
            throw new common_1.NotFoundException('Loja inativa');
        }
        return {
            id: empresa.id,
            nome: empresa.nome,
            slug: empresa.slug,
            subdominio: empresa.subdominio,
        };
    }
    async getProdutosByLoja(slug, page = 1, limit = 20, categoria, search) {
        const empresa = await this.getLojaBySlug(slug);
        const skip = (page - 1) * limit;
        const where = {
            empresaId: empresa.id,
            ativo: true,
        };
        if (categoria) {
            where.categoria = categoria;
        }
        if (search) {
            where.OR = [
                { nome: { contains: search, mode: 'insensitive' } },
                { descricao: { contains: search, mode: 'insensitive' } },
            ];
        }
        const [produtos, total] = await Promise.all([
            this.prisma.produto.findMany({
                where,
                skip,
                take: limit,
                orderBy: { nome: 'asc' },
            }),
            this.prisma.produto.count({ where }),
        ]);
        return {
            data: produtos,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async getProdutoById(slug, produtoId) {
        const empresa = await this.getLojaBySlug(slug);
        const produto = await this.prisma.produto.findFirst({
            where: {
                id: produtoId,
                empresaId: empresa.id,
                ativo: true,
            },
        });
        if (!produto) {
            throw new common_1.NotFoundException('Produto não encontrado');
        }
        return produto;
    }
    async getCategorias(slug) {
        const empresa = await this.getLojaBySlug(slug);
        const categorias = await this.prisma.produto.findMany({
            where: {
                empresaId: empresa.id,
                ativo: true,
                categoria: { not: null },
            },
            select: {
                categoria: true,
            },
            distinct: ['categoria'],
        });
        return categorias
            .filter((c) => c.categoria)
            .map((c) => c.categoria);
    }
};
exports.PublicService = PublicService;
exports.PublicService = PublicService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PublicService);
//# sourceMappingURL=public.service.js.map