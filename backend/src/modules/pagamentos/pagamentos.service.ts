
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AsaasService } from './asaas.service';
import { CreatePagamentoDto } from './dto/create-pagamento.dto';

@Injectable()
export class PagamentosService {
  constructor(
    private prisma: PrismaService,
    private asaasService: AsaasService,
  ) {}

  async criarPagamento(dto: CreatePagamentoDto, empresaId: string, asaasToken?: string) {
    const empresa = await this.prisma.empresa.findUnique({
      where: { id: empresaId },
    });

    if (!empresa) {
      throw new NotFoundException('Empresa não encontrada');
    }

    // Criar customer no Asaas se não existir
    let customerId = empresa.asaasCustomerId;
    if (!customerId) {
      const customer = await this.asaasService.criarCliente({
        name: dto.clienteNome,
        email: dto.clienteEmail,
        cpfCnpj: dto.clienteCpfCnpj,
        phone: dto.clienteTelefone,
      }, asaasToken);
      customerId = customer.id;

      await this.prisma.empresa.update({
        where: { id: empresaId },
        data: { asaasCustomerId: customerId },
      });
    }

    // Criar cobrança no Asaas
    const cobranca = await this.asaasService.criarCobranca({
      customer: customerId,
      billingType: dto.metodo,
      value: dto.valor,
      dueDate: dto.dataVencimento,
      description: dto.descricao,
    }, asaasToken);

    // Salvar no banco
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

  async buscarPagamento(id: string, empresaId: string) {
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
      throw new NotFoundException('Pagamento não encontrado');
    }

    return pagamento;
  }

  async buscarPagamentosPorPedido(pedidoId: string, empresaId: string) {
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

  async buscarPagamentosEmpresa(empresaId: string) {
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

  async cancelarPagamento(id: string, empresaId: string) {
    const pagamento = await this.prisma.pagamento.findFirst({
      where: {
        id,
        empresaId,
      },
    });

    if (!pagamento) {
      throw new NotFoundException('Pagamento não encontrado');
    }

    if (pagamento.status !== 'PENDENTE') {
      throw new BadRequestException('Apenas pagamentos pendentes podem ser cancelados');
    }

    // Cancelar no Asaas
    if (pagamento.asaasPaymentId) {
      await this.asaasService.cancelarCobranca(pagamento.asaasPaymentId);
    }

    // Atualizar no banco
    return this.prisma.pagamento.update({
      where: { id },
      data: { status: 'CANCELADO' },
    });
  }

  // Método chamado pelo webhook do Asaas
  async processarEventoAsaas(evento: any) {
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

  async testarConexaoAsaas(asaasToken?: string) {
    return this.asaasService.testarConexao(asaasToken);
  }
}
