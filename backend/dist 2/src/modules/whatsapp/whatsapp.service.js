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
var WhatsappService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsappService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
let WhatsappService = WhatsappService_1 = class WhatsappService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(WhatsappService_1.name);
    }
    async enviarMensagemPedido(pedidoId, telefone, mensagem, empresaId) {
        try {
            this.logger.log(`Mensagem WhatsApp enviada para ${telefone} sobre pedido ${pedidoId}`);
            await this.prisma.mensagemWhatsApp.create({
                data: {
                    telefone,
                    mensagem,
                    pedidoId,
                    status: 'ENVIADO',
                },
            });
            return { success: true, message: 'Mensagem enviada com sucesso' };
        }
        catch (error) {
            this.logger.error(`Erro ao enviar mensagem WhatsApp: ${error.message}`);
            throw error;
        }
    }
    async enviarNotificacaoStatus(pedidoId, novoStatus, empresaId) {
        try {
            const pedido = await this.prisma.pedido.findUnique({
                where: { id: pedidoId },
                include: {
                    cliente: true,
                },
            });
            if (!pedido || !pedido.cliente?.telefone) {
                this.logger.warn(`Pedido ${pedidoId} não encontrado ou cliente sem telefone`);
                return { success: false, message: 'Dados insuficientes para envio' };
            }
            const mensagem = this.gerarMensagemStatus(pedido.numero, novoStatus);
            return await this.enviarMensagemPedido(pedidoId, pedido.cliente.telefone, mensagem, empresaId);
        }
        catch (error) {
            this.logger.error(`Erro ao enviar notificação de status: ${error.message}`);
            throw error;
        }
    }
    gerarMensagemStatus(numeroPedido, status) {
        const statusMessages = {
            CONFIRMADO: `✅ Seu pedido #${numeroPedido} foi confirmado!`,
            EM_PREPARO: `👨‍🍳 Seu pedido #${numeroPedido} está sendo preparado!`,
            SAIU_ENTREGA: `🚚 Seu pedido #${numeroPedido} saiu para entrega!`,
            ENTREGUE: `✅ Seu pedido #${numeroPedido} foi entregue!`,
            CANCELADO: `❌ Seu pedido #${numeroPedido} foi cancelado.`,
        };
        return statusMessages[status] || `📋 Status do pedido #${numeroPedido} atualizado para: ${status}`;
    }
    async enviarMensagem(empresaId, telefone, mensagem, pedidoId) {
        try {
            this.logger.log(`Enviando mensagem WhatsApp para ${telefone}`);
            const mensagemData = {
                telefone,
                mensagem,
                status: 'ENVIADO',
            };
            if (pedidoId) {
                mensagemData.pedidoId = pedidoId;
            }
            await this.prisma.mensagemWhatsApp.create({
                data: mensagemData,
            });
            return { success: true, message: 'Mensagem enviada com sucesso' };
        }
        catch (error) {
            this.logger.error(`Erro ao enviar mensagem WhatsApp: ${error.message}`);
            throw error;
        }
    }
    async listarMensagens(empresaId) {
        try {
            const mensagens = await this.prisma.mensagemWhatsApp.findMany({
                include: {
                    pedido: {
                        select: {
                            numero: true,
                            empresaId: true,
                        },
                    },
                },
                where: {
                    pedido: {
                        empresaId,
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });
            return mensagens;
        }
        catch (error) {
            this.logger.error(`Erro ao listar mensagens: ${error.message}`);
            throw error;
        }
    }
    async listarMensagensPorPedido(pedidoId, empresaId) {
        try {
            const mensagens = await this.prisma.mensagemWhatsApp.findMany({
                where: {
                    pedidoId,
                    pedido: {
                        empresaId,
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });
            return mensagens;
        }
        catch (error) {
            this.logger.error(`Erro ao listar mensagens do pedido: ${error.message}`);
            throw error;
        }
    }
    async configurarWhatsApp(empresaId, whatsappNumero, whatsappToken) {
        try {
            await this.prisma.empresa.update({
                where: { id: empresaId },
                data: {},
            });
            this.logger.log(`Configuração WhatsApp atualizada para empresa ${empresaId}`);
            return {
                success: true,
                message: 'Configuração WhatsApp atualizada com sucesso',
                numero: whatsappNumero
            };
        }
        catch (error) {
            this.logger.error(`Erro ao configurar WhatsApp: ${error.message}`);
            throw error;
        }
    }
};
exports.WhatsappService = WhatsappService;
exports.WhatsappService = WhatsappService = WhatsappService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WhatsappService);
//# sourceMappingURL=whatsapp.service.js.map