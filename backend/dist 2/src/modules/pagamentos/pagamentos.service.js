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
exports.PagamentosService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const asaas_service_1 = require("./asaas.service");
let PagamentosService = class PagamentosService {
    constructor(prisma, asaasService) {
        this.prisma = prisma;
        this.asaasService = asaasService;
    }
    async criarPagamento(dto, empresaId) {
        const empresa = await this.prisma.empresa.findUnique({
            where: { id: empresaId },
        });
        if (!empresa) {
            throw new common_1.NotFoundException('Empresa não encontrada');
        }
        let customerId = empresa.asaasCustomerId;
        if (!customerId) {
            const customer = await this.asaasService.criarCliente({
                name: dto.clienteNome,
                email: dto.clienteEmail,
                cpfCnpj: dto.clienteCpfCnpj,
                phone: dto.clienteTelefone,
            });
            customerId = customer.id;
            await this.prisma.empresa.update({
                where: { id: empresaId },
                data: { asaasCustomerId: customerId },
            });
        }
        const cobranca = await this.asaasService.criarCobranca({
            customer: customerId,
            billingType: dto.metodo,
            value: dto.valor,
            dueDate: dto.dataVencimento,
            description: dto.descricao,
        });
        const pagamento = await this.prisma.pagamento.create({
            data: {
                empresaId,
                pedidoId: dto.pedidoId,
                metodo: dto.metodo,
                status: 'PENDENTE',
                valor: dto.valor,
                asaasPaymentId: cobranca.id,
                asaasInvoiceUrl: cobranca.invoiceUrl,
                pixQrCode: cobranca.pixQrCode,
                pixCopyPaste: cobranca.pixCopyPaste,
                boletoUrl: cobranca.bankSlipUrl,
                dataVencimento: new Date(dto.dataVencimento),
            },
        });
        return {
            ...pagamento,
            qrCode: cobranca.pixQrCode,
            copyPaste: cobranca.pixCopyPaste,
            boletoUrl: cobranca.bankSlipUrl,
            invoiceUrl: cobranca.invoiceUrl,
        };
    }
    async buscarPagamento(id, empresaId) {
        const pagamento = await this.prisma.pagamento.findFirst({
            where: {
                id,
                empresaId,
            },
            include: {
                pedido: true,
            },
        });
        if (!pagamento) {
            throw new common_1.NotFoundException('Pagamento não encontrado');
        }
        return pagamento;
    }
    async buscarPagamentosPorPedido(pedidoId, empresaId) {
        return this.prisma.pagamento.findMany({
            where: {
                pedidoId,
                empresaId,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async buscarPagamentosEmpresa(empresaId) {
        return this.prisma.pagamento.findMany({
            where: {
                empresaId,
            },
            include: {
                pedido: {
                    select: {
                        numero: true,
                        total: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async cancelarPagamento(id, empresaId) {
        const pagamento = await this.prisma.pagamento.findFirst({
            where: {
                id,
                empresaId,
            },
        });
        if (!pagamento) {
            throw new common_1.NotFoundException('Pagamento não encontrado');
        }
        if (pagamento.status !== 'PENDENTE') {
            throw new common_1.BadRequestException('Apenas pagamentos pendentes podem ser cancelados');
        }
        if (pagamento.asaasPaymentId) {
            await this.asaasService.cancelarCobranca(pagamento.asaasPaymentId);
        }
        return this.prisma.pagamento.update({
            where: { id },
            data: { status: 'CANCELADO' },
        });
    }
    async processarEventoAsaas(evento) {
        const pagamento = await this.prisma.pagamento.findFirst({
            where: { asaasPaymentId: evento.payment.id },
        });
        if (!pagamento) {
            return;
        }
        switch (evento.event) {
            case 'PAYMENT_CONFIRMED':
            case 'PAYMENT_RECEIVED':
                await this.prisma.pagamento.update({
                    where: { id: pagamento.id },
                    data: {
                        status: 'APROVADO',
                        dataPagamento: new Date(evento.payment.paymentDate),
                    },
                });
                break;
            case 'PAYMENT_OVERDUE':
                await this.prisma.pagamento.update({
                    where: { id: pagamento.id },
                    data: { status: 'RECUSADO' },
                });
                break;
        }
    }
};
exports.PagamentosService = PagamentosService;
exports.PagamentosService = PagamentosService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        asaas_service_1.AsaasService])
], PagamentosService);
//# sourceMappingURL=pagamentos.service.js.map