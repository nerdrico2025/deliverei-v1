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
exports.CarrinhoService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
let CarrinhoService = class CarrinhoService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async obterCarrinho(usuarioId, empresaId) {
        let carrinho = await this.prisma.carrinho.findFirst({
            where: {
                usuarioId,
                empresaId,
            },
            include: {
                itens: {
                    include: {
                        produto: true,
                    },
                },
            },
        });
        if (!carrinho) {
            carrinho = await this.prisma.carrinho.create({
                data: {
                    usuarioId,
                    empresaId,
                },
                include: {
                    itens: {
                        include: {
                            produto: true,
                        },
                    },
                },
            });
        }
        const subtotal = carrinho.itens.reduce((acc, item) => {
            return acc + Number(item.precoUnitario) * item.quantidade;
        }, 0);
        return {
            ...carrinho,
            subtotal,
            totalItens: carrinho.itens.reduce((acc, item) => acc + item.quantidade, 0),
        };
    }
    async adicionarItem(usuarioId, empresaId, dto) {
        const produto = await this.prisma.produto.findFirst({
            where: {
                id: dto.produtoId,
                empresaId,
                ativo: true,
            },
        });
        if (!produto) {
            throw new common_1.NotFoundException('Produto não encontrado ou inativo');
        }
        if (produto.estoque < dto.quantidade) {
            throw new common_1.BadRequestException('Estoque insuficiente');
        }
        let carrinho = await this.prisma.carrinho.findFirst({
            where: {
                usuarioId,
                empresaId,
            },
        });
        if (!carrinho) {
            carrinho = await this.prisma.carrinho.create({
                data: {
                    usuarioId,
                    empresaId,
                },
            });
        }
        const itemExistente = await this.prisma.itemCarrinho.findFirst({
            where: {
                carrinhoId: carrinho.id,
                produtoId: dto.produtoId,
            },
        });
        if (itemExistente) {
            const novaQuantidade = itemExistente.quantidade + dto.quantidade;
            if (produto.estoque < novaQuantidade) {
                throw new common_1.BadRequestException('Estoque insuficiente');
            }
            return this.prisma.itemCarrinho.update({
                where: { id: itemExistente.id },
                data: {
                    quantidade: novaQuantidade,
                },
                include: {
                    produto: true,
                },
            });
        }
        return this.prisma.itemCarrinho.create({
            data: {
                carrinhoId: carrinho.id,
                produtoId: dto.produtoId,
                quantidade: dto.quantidade,
                precoUnitario: produto.preco,
            },
            include: {
                produto: true,
            },
        });
    }
    async atualizarItem(usuarioId, empresaId, itemId, dto) {
        const item = await this.prisma.itemCarrinho.findFirst({
            where: {
                id: itemId,
                carrinho: {
                    usuarioId,
                    empresaId,
                },
            },
            include: {
                produto: true,
            },
        });
        if (!item) {
            throw new common_1.NotFoundException('Item não encontrado no carrinho');
        }
        if (dto.quantidade && dto.quantidade !== item.quantidade) {
            if (item.produto.estoque < dto.quantidade) {
                throw new common_1.BadRequestException('Estoque insuficiente');
            }
        }
        return this.prisma.itemCarrinho.update({
            where: { id: itemId },
            data: {
                quantidade: dto.quantidade,
            },
            include: {
                produto: true,
            },
        });
    }
    async removerItem(usuarioId, empresaId, itemId) {
        const item = await this.prisma.itemCarrinho.findFirst({
            where: {
                id: itemId,
                carrinho: {
                    usuarioId,
                    empresaId,
                },
            },
        });
        if (!item) {
            throw new common_1.NotFoundException('Item não encontrado no carrinho');
        }
        await this.prisma.itemCarrinho.delete({
            where: { id: itemId },
        });
        return { message: 'Item removido com sucesso' };
    }
    async limparCarrinho(usuarioId, empresaId) {
        const carrinho = await this.prisma.carrinho.findFirst({
            where: {
                usuarioId,
                empresaId,
            },
        });
        if (!carrinho) {
            throw new common_1.NotFoundException('Carrinho não encontrado');
        }
        await this.prisma.itemCarrinho.deleteMany({
            where: {
                carrinhoId: carrinho.id,
            },
        });
        return { message: 'Carrinho limpo com sucesso' };
    }
    async checkout(usuarioId, empresaId, dto) {
        const carrinho = await this.prisma.carrinho.findFirst({
            where: {
                usuarioId,
                empresaId,
            },
            include: {
                itens: {
                    include: {
                        produto: true,
                    },
                },
            },
        });
        if (!carrinho || carrinho.itens.length === 0) {
            throw new common_1.BadRequestException('Carrinho vazio');
        }
        for (const item of carrinho.itens) {
            if (item.produto.estoque < item.quantidade) {
                throw new common_1.BadRequestException(`Estoque insuficiente para o produto: ${item.produto.nome}`);
            }
        }
        const subtotal = carrinho.itens.reduce((acc, item) => {
            return acc + Number(item.precoUnitario) * item.quantidade;
        }, 0);
        const desconto = 0;
        const total = subtotal - desconto;
        const numeroPedido = `PED-${Date.now()}`;
        const pedido = await this.prisma.$transaction(async (tx) => {
            const novoPedido = await tx.pedido.create({
                data: {
                    numero: numeroPedido,
                    subtotal: subtotal,
                    desconto: desconto,
                    total: total,
                    clienteId: usuarioId,
                    empresaId,
                    enderecoEntrega: dto.enderecoEntrega,
                    formaPagamento: dto.formaPagamento,
                    cupomDesconto: dto.cupomDesconto,
                    observacoes: dto.observacoes,
                },
            });
            for (const item of carrinho.itens) {
                await tx.itemPedido.create({
                    data: {
                        pedidoId: novoPedido.id,
                        produtoId: item.produtoId,
                        quantidade: item.quantidade,
                        precoUnitario: item.precoUnitario,
                        subtotal: Number(item.precoUnitario) * item.quantidade,
                    },
                });
            }
            await Promise.all(carrinho.itens.map((item) => tx.produto.update({
                where: { id: item.produtoId },
                data: {
                    estoque: {
                        decrement: item.quantidade,
                    },
                },
            })));
            await tx.itemCarrinho.deleteMany({
                where: {
                    carrinhoId: carrinho.id,
                },
            });
            return novoPedido;
        });
        return this.prisma.pedido.findUnique({
            where: { id: pedido.id },
            include: {
                itens: {
                    include: {
                        produto: true,
                    },
                },
            },
        });
    }
    async obterRecomendacoes(usuarioId, empresaId) {
        const carrinho = await this.prisma.carrinho.findFirst({
            where: {
                usuarioId,
                empresaId,
            },
            include: {
                itens: {
                    include: {
                        produto: true,
                    },
                },
            },
        });
        if (!carrinho || carrinho.itens.length === 0) {
            return this.prisma.produto.findMany({
                where: {
                    empresaId,
                    ativo: true,
                },
                orderBy: {
                    createdAt: 'desc',
                },
                take: 5,
            });
        }
        const categorias = carrinho.itens
            .map((item) => item.produto.categoria)
            .filter((cat) => cat !== null);
        const produtosNoCarrinho = carrinho.itens.map((item) => item.produtoId);
        const recomendacoes = await this.prisma.produto.findMany({
            where: {
                empresaId,
                ativo: true,
                id: {
                    notIn: produtosNoCarrinho,
                },
                ...(categorias.length > 0 && {
                    categoria: {
                        in: categorias,
                    },
                }),
            },
            orderBy: [
                { preco: 'desc' },
                { createdAt: 'desc' },
            ],
            take: 5,
        });
        return recomendacoes;
    }
};
exports.CarrinhoService = CarrinhoService;
exports.CarrinhoService = CarrinhoService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CarrinhoService);
//# sourceMappingURL=carrinho.service.js.map