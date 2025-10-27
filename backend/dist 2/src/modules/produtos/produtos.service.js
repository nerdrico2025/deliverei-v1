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
var ProdutosService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProdutosService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const utils_1 = require("../../utils");
let ProdutosService = ProdutosService_1 = class ProdutosService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(ProdutosService_1.name);
        this.useMockData = process.env.USE_MOCK_PRODUTOS === 'true';
        this.mockProdutos = [
            {
                id: 'mock-1',
                nome: 'Pizza Margherita',
                descricao: 'Pizza tradicional com molho de tomate, mussarela e manjericão',
                preco: 35.90,
                imagem: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400',
                ativo: true,
                estoque: 50,
                categoria: 'Pizza',
                promo_tag: false,
                bestseller_tag: false,
                new_tag: false,
                empresaId: 'mock-empresa',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
            {
                id: 'mock-2',
                nome: 'Hamburger Artesanal',
                descricao: 'Hambúrguer 200g, queijo, alface, tomate e molho especial',
                preco: 28.50,
                imagem: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
                ativo: true,
                estoque: 30,
                categoria: 'Lanches',
                promo_tag: false,
                bestseller_tag: false,
                new_tag: false,
                empresaId: 'mock-empresa',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
            {
                id: 'mock-3',
                nome: 'Refrigerante Lata',
                descricao: 'Coca-Cola, Guaraná ou Fanta 350ml',
                preco: 5.00,
                imagem: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400',
                ativo: true,
                estoque: 100,
                categoria: 'Bebidas',
                promo_tag: false,
                bestseller_tag: false,
                new_tag: false,
                empresaId: 'mock-empresa',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
            {
                id: 'mock-4',
                nome: 'Sushi Combinado',
                descricao: '20 peças variadas de sushi e sashimi',
                preco: 65.00,
                imagem: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400',
                ativo: true,
                estoque: 15,
                categoria: 'Japonês',
                promo_tag: false,
                bestseller_tag: false,
                new_tag: false,
                empresaId: 'mock-empresa',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
            {
                id: 'mock-5',
                nome: 'Açaí Bowl',
                descricao: 'Açaí 500ml com granola, banana e mel',
                preco: 22.00,
                imagem: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400',
                ativo: true,
                estoque: 25,
                categoria: 'Sobremesas',
                promo_tag: false,
                bestseller_tag: false,
                new_tag: false,
                empresaId: 'mock-empresa',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
        ];
        if (this.useMockData) {
            this.logger.warn('⚠️  Usando dados MOCK para produtos (USE_MOCK_PRODUTOS=true)');
        }
    }
    async create(createProdutoDto, empresaId) {
        if (this.useMockData) {
            const newProduto = {
                id: `mock-${Date.now()}`,
                nome: createProdutoDto.nome,
                descricao: createProdutoDto.descricao || '',
                preco: createProdutoDto.preco,
                imagem: createProdutoDto.imagem || '',
                ativo: createProdutoDto.ativo ?? true,
                estoque: createProdutoDto.estoque ?? 0,
                categoria: createProdutoDto.categoria || '',
                promo_tag: createProdutoDto.promo_tag ?? false,
                bestseller_tag: createProdutoDto.bestseller_tag ?? false,
                new_tag: createProdutoDto.new_tag ?? false,
                empresaId,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            this.mockProdutos.push(newProduto);
            return newProduto;
        }
        return this.prisma.produto.create({
            data: {
                ...createProdutoDto,
                empresaId,
            },
        });
    }
    async findAll(empresaId, page = 1, limit = 20, categoria, search, ativo) {
        if (this.useMockData) {
            let filtered = this.mockProdutos.map(p => ({ ...p, empresaId }));
            if (categoria) {
                filtered = filtered.filter(p => p.categoria === categoria);
            }
            if (search) {
                const searchLower = search.toLowerCase();
                filtered = filtered.filter(p => p.nome.toLowerCase().includes(searchLower) ||
                    p.descricao?.toLowerCase().includes(searchLower));
            }
            if (ativo !== undefined) {
                filtered = filtered.filter(p => p.ativo === ativo);
            }
            const total = filtered.length;
            const skip = (page - 1) * limit;
            const produtos = filtered.slice(skip, skip + limit);
            return (0, utils_1.paginatedResponse)(produtos, (0, utils_1.calculatePagination)(total, page, limit));
        }
        const skip = (page - 1) * limit;
        const where = {
            empresaId,
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
        if (ativo !== undefined) {
            where.ativo = ativo;
        }
        const [produtos, total] = await Promise.all([
            this.prisma.produto.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.produto.count({ where }),
        ]);
        return (0, utils_1.paginatedResponse)(produtos, (0, utils_1.calculatePagination)(total, page, limit));
    }
    async findOne(id, empresaId) {
        if (this.useMockData) {
            const produto = this.mockProdutos.find(p => p.id === id);
            if (!produto) {
                throw new common_1.NotFoundException('Produto não encontrado');
            }
            return { ...produto, empresaId };
        }
        const produto = await this.prisma.produto.findFirst({
            where: {
                id,
                empresaId,
            },
        });
        if (!produto) {
            throw new common_1.NotFoundException('Produto não encontrado');
        }
        return produto;
    }
    async update(id, updateProdutoDto, empresaId) {
        if (this.useMockData) {
            const index = this.mockProdutos.findIndex(p => p.id === id);
            if (index === -1) {
                throw new common_1.NotFoundException('Produto não encontrado');
            }
            this.mockProdutos[index] = {
                ...this.mockProdutos[index],
                ...updateProdutoDto,
                empresaId,
                updatedAt: new Date().toISOString(),
            };
            return this.mockProdutos[index];
        }
        await this.findOne(id, empresaId);
        return this.prisma.produto.update({
            where: { id },
            data: updateProdutoDto,
        });
    }
    async remove(id, empresaId) {
        if (this.useMockData) {
            const index = this.mockProdutos.findIndex(p => p.id === id);
            if (index === -1) {
                throw new common_1.NotFoundException('Produto não encontrado');
            }
            this.mockProdutos[index] = {
                ...this.mockProdutos[index],
                ativo: false,
                empresaId,
                updatedAt: new Date().toISOString(),
            };
            return this.mockProdutos[index];
        }
        await this.findOne(id, empresaId);
        return this.prisma.produto.update({
            where: { id },
            data: { ativo: false },
        });
    }
    async hardRemove(id, empresaId) {
        if (this.useMockData) {
            const index = this.mockProdutos.findIndex(p => p.id === id);
            if (index === -1) {
                throw new common_1.NotFoundException('Produto não encontrado');
            }
            this.mockProdutos.splice(index, 1);
            return { success: true };
        }
        await this.findOne(id, empresaId);
        return this.prisma.produto.delete({
            where: { id },
        });
    }
};
exports.ProdutosService = ProdutosService;
exports.ProdutosService = ProdutosService = ProdutosService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProdutosService);
//# sourceMappingURL=produtos.service.js.map