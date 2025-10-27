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
var PedidosService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PedidosService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
let PedidosService = PedidosService_1 = class PedidosService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(PedidosService_1.name);
    }
    async findAll(filtros, empresaId) {
        this.logger.log('Buscando pedidos com filtros:', filtros);
        const pedidos = await this.prisma.pedido.findMany({
            include: {
                cliente: {
                    select: {
                        id: true,
                        nome: true,
                        email: true,
                    },
                },
                itens: {
                    include: {
                        produto: {
                            select: {
                                id: true,
                                nome: true,
                                imagem: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        return {
            data: pedidos,
            pagination: {
                currentPage: 1,
                totalPages: 1,
                totalItems: pedidos.length,
                itemsPerPage: pedidos.length,
                hasNextPage: false,
                hasPreviousPage: false,
            },
        };
    }
    async findMeusPedidos(userId, empresaId, page = 1, limit = 10) {
        this.logger.log(`Buscando pedidos do usuário ${userId}`);
        const skip = (page - 1) * limit;
        const [pedidos, total] = await Promise.all([
            this.prisma.pedido.findMany({
                where: {
                    clienteId: userId,
                },
                include: {
                    itens: {
                        include: {
                            produto: {
                                select: {
                                    id: true,
                                    nome: true,
                                    preco: true,
                                    imagem: true,
                                },
                            },
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
                skip,
                take: limit,
            }),
            this.prisma.pedido.count({
                where: {
                    clienteId: userId,
                },
            }),
        ]);
        const totalPages = Math.ceil(total / limit);
        return {
            data: pedidos,
            pagination: {
                currentPage: page,
                totalPages,
                totalItems: total,
                itemsPerPage: limit,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1,
            },
        };
    }
    async findOne(id, empresaId, userId) {
        this.logger.log(`Buscando pedido com ID: ${id}`);
        const pedido = await this.prisma.pedido.findUnique({
            where: { id },
            include: {
                cliente: {
                    select: {
                        id: true,
                        nome: true,
                        email: true,
                    },
                },
                itens: {
                    include: {
                        produto: {
                            select: {
                                id: true,
                                nome: true,
                                preco: true,
                                imagem: true,
                            },
                        },
                    },
                },
            },
        });
        if (!pedido) {
            throw new common_1.NotFoundException(`Pedido com ID ${id} não encontrado`);
        }
        return pedido;
    }
    async updateStatus(id, updateStatusDto, empresaId) {
        this.logger.log(`Atualizando status do pedido ${id} para: ${updateStatusDto.status}`);
        const pedido = await this.findOne(id);
        const pedidoAtualizado = await this.prisma.pedido.update({
            where: { id },
            data: {
                status: updateStatusDto.status,
                observacoes: updateStatusDto.observacoes,
                updatedAt: new Date(),
            },
            include: {
                cliente: {
                    select: {
                        id: true,
                        nome: true,
                        email: true,
                    },
                },
                itens: {
                    include: {
                        produto: {
                            select: {
                                id: true,
                                nome: true,
                                imagem: true,
                            },
                        },
                    },
                },
            },
        });
        this.logger.log(`Status do pedido ${id} atualizado com sucesso`);
        return pedidoAtualizado;
    }
    async cancel(id, empresaId, userId, isAdmin) {
        this.logger.log(`Cancelando pedido ${id}`);
        const pedido = await this.findOne(id, empresaId, isAdmin ? undefined : userId);
        if (pedido.status === 'CANCELADO') {
            throw new Error('Pedido já está cancelado');
        }
        if (pedido.status === 'ENTREGUE') {
            throw new Error('Não é possível cancelar um pedido já entregue');
        }
        const pedidoCancelado = await this.prisma.pedido.update({
            where: { id },
            data: {
                status: 'CANCELADO',
                observacoes: 'Pedido cancelado',
                updatedAt: new Date(),
            },
            include: {
                cliente: {
                    select: {
                        id: true,
                        nome: true,
                        email: true,
                    },
                },
                itens: {
                    include: {
                        produto: {
                            select: {
                                id: true,
                                nome: true,
                                imagem: true,
                            },
                        },
                    },
                },
            },
        });
        this.logger.log(`Pedido ${id} cancelado com sucesso`);
        return pedidoCancelado;
    }
};
exports.PedidosService = PedidosService;
exports.PedidosService = PedidosService = PedidosService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PedidosService);
//# sourceMappingURL=pedidos.service.js.map