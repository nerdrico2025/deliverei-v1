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
exports.WebhooksService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const pagamentos_service_1 = require("../pagamentos/pagamentos.service");
let WebhooksService = class WebhooksService {
    constructor(prisma, pagamentosService) {
        this.prisma = prisma;
        this.pagamentosService = pagamentosService;
    }
    async processarWebhookStripe(payload, signature) {
        throw new common_1.BadRequestException('Webhook Stripe temporariamente desabilitado');
    }
    async processarWebhookAsaas(body, token) {
        const webhookToken = process.env.ASAAS_WEBHOOK_TOKEN;
        if (webhookToken && token !== webhookToken) {
            throw new common_1.BadRequestException('Token do webhook inválido');
        }
        const log = await this.prisma.webhookLog.create({
            data: {
                origem: 'ASAAS',
                evento: body.event,
                payload: body,
                processado: false,
            },
        });
        try {
            await this.pagamentosService.processarEventoAsaas(body);
            await this.prisma.webhookLog.update({
                where: { id: log.id },
                data: { processado: true },
            });
            return { received: true };
        }
        catch (error) {
            await this.prisma.webhookLog.update({
                where: { id: log.id },
                data: { erro: error.message },
            });
            throw error;
        }
    }
    async listarLogs(origem, processado) {
        const where = {};
        if (origem) {
            where.origem = origem;
        }
        if (processado !== undefined) {
            where.processado = processado;
        }
        return this.prisma.webhookLog.findMany({
            where,
            orderBy: {
                createdAt: 'desc',
            },
            take: 100,
        });
    }
};
exports.WebhooksService = WebhooksService;
exports.WebhooksService = WebhooksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        pagamentos_service_1.PagamentosService])
], WebhooksService);
//# sourceMappingURL=webhooks.service.js.map