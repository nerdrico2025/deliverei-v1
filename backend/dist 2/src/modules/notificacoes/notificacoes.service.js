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
var NotificacoesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificacoesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
let NotificacoesService = NotificacoesService_1 = class NotificacoesService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(NotificacoesService_1.name);
    }
    async enviarNotificacaoPedido(pedidoId, tipo, mensagem) {
        try {
            this.logger.log(`Notificação enviada para pedido ${pedidoId}: ${mensagem}`);
            return { success: true, message: 'Notificação enviada com sucesso' };
        }
        catch (error) {
            this.logger.error(`Erro ao enviar notificação: ${error.message}`);
            throw error;
        }
    }
    async criarNotificacao(usuarioId, titulo, mensagem, tipo = 'SISTEMA', empresaId) {
        try {
            const notificacao = await this.prisma.notificacao.create({
                data: {
                    titulo,
                    mensagem,
                    tipo,
                    usuario: {
                        connect: { id: usuarioId }
                    },
                    lida: false,
                },
            });
            return notificacao;
        }
        catch (error) {
            this.logger.error(`Erro ao criar notificação: ${error.message}`);
            throw error;
        }
    }
    async findAll(usuarioId, page, limit, tipo, lida) {
        try {
            const where = {
                usuarioId,
            };
            if (tipo) {
                where.tipo = tipo;
            }
            if (lida !== undefined) {
                where.lida = lida;
            }
            const skip = page && limit ? (page - 1) * limit : undefined;
            const take = limit;
            return await this.prisma.notificacao.findMany({
                where,
                orderBy: {
                    createdAt: 'desc',
                },
                skip,
                take,
            });
        }
        catch (error) {
            this.logger.error(`Erro ao buscar notificações: ${error.message}`);
            throw error;
        }
    }
    async findOne(id, usuarioId) {
        try {
            return await this.prisma.notificacao.findFirst({
                where: {
                    id,
                    usuarioId,
                },
            });
        }
        catch (error) {
            this.logger.error(`Erro ao buscar notificação: ${error.message}`);
            throw error;
        }
    }
    async marcarComoLida(id, usuarioId) {
        try {
            return await this.prisma.notificacao.update({
                where: {
                    id,
                },
                data: {
                    lida: true,
                },
            });
        }
        catch (error) {
            this.logger.error(`Erro ao marcar notificação como lida: ${error.message}`);
            throw error;
        }
    }
    async marcarTodasComoLidas(usuarioId) {
        try {
            return await this.prisma.notificacao.updateMany({
                where: {
                    usuarioId,
                    lida: false,
                },
                data: {
                    lida: true,
                },
            });
        }
        catch (error) {
            this.logger.error(`Erro ao marcar todas as notificações como lidas: ${error.message}`);
            throw error;
        }
    }
    async remove(id, usuarioId) {
        try {
            return await this.prisma.notificacao.delete({
                where: {
                    id,
                },
            });
        }
        catch (error) {
            this.logger.error(`Erro ao remover notificação: ${error.message}`);
            throw error;
        }
    }
    async create(createNotificacaoDto) {
        try {
            return await this.prisma.notificacao.create({
                data: {
                    titulo: createNotificacaoDto.titulo,
                    mensagem: createNotificacaoDto.mensagem,
                    tipo: createNotificacaoDto.tipo || 'SISTEMA',
                    usuario: {
                        connect: { id: createNotificacaoDto.usuarioId }
                    },
                    lida: false,
                },
            });
        }
        catch (error) {
            this.logger.error(`Erro ao criar notificação: ${error.message}`);
            throw error;
        }
    }
    async countNaoLidas(usuarioId) {
        try {
            return await this.prisma.notificacao.count({
                where: {
                    usuarioId,
                    lida: false,
                },
            });
        }
        catch (error) {
            this.logger.error(`Erro ao contar notificações não lidas: ${error.message}`);
            throw error;
        }
    }
    async update(id, updateNotificacaoDto, usuarioId) {
        try {
            return await this.prisma.notificacao.update({
                where: {
                    id,
                    usuarioId,
                },
                data: updateNotificacaoDto,
            });
        }
        catch (error) {
            this.logger.error(`Erro ao atualizar notificação: ${error.message}`);
            throw error;
        }
    }
};
exports.NotificacoesService = NotificacoesService;
exports.NotificacoesService = NotificacoesService = NotificacoesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NotificacoesService);
//# sourceMappingURL=notificacoes.service.js.map