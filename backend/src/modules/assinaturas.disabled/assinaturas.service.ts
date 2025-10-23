
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { StripeService } from './stripe.service';
import { CreateAssinaturaDto } from './dto/create-assinatura.dto';

export const PLANOS = {
  BASICO: {
    nome: 'Básico',
    valor: 49.9,
    pedidosMes: 100,
    produtos: 50,
    descricao: 'Ideal para pequenos negócios',
  },
  PROFISSIONAL: {
    nome: 'Profissional',
    valor: 99.9,
    pedidosMes: 500,
    produtos: 200,
    descricao: 'Para negócios em crescimento',
  },
  ENTERPRISE: {
    nome: 'Enterprise',
    valor: 199.9,
    pedidosMes: -1, // Ilimitado
    produtos: -1, // Ilimitado
    descricao: 'Solução completa sem limites',
  },
};

@Injectable()
export class AssinaturasService {
  constructor(
    private prisma: PrismaService,
    private stripeService: StripeService,
  ) {}

  async listarPlanos() {
    return Object.entries(PLANOS).map(([key, value]) => ({
      id: key,
      ...value,
    }));
  }

  async criarCheckout(dto: CreateAssinaturaDto, empresaId: string) {
    const empresa = await this.prisma.empresa.findUnique({
      where: { id: empresaId },
    });

    if (!empresa) {
      throw new NotFoundException('Empresa não encontrada');
    }

    // Verificar se já tem assinatura ativa
    const assinaturaExistente = await this.prisma.assinatura.findUnique({
      where: { empresaId },
    });

    if (assinaturaExistente && assinaturaExistente.status === 'ATIVA') {
      throw new BadRequestException('Empresa já possui assinatura ativa');
    }

    const plano = PLANOS[dto.plano];
    if (!plano) {
      throw new BadRequestException('Plano inválido');
    }

    // Criar checkout session no Stripe
    const session = await this.stripeService.criarCheckoutSession({
      empresaId,
      plano: dto.plano,
      valor: plano.valor,
      email: dto.email,
    });

    return {
      sessionId: session.id,
      url: session.url,
    };
  }

  async buscarAssinaturaPorEmpresa(empresaId: string) {
    const assinatura = await this.prisma.assinatura.findUnique({
      where: { empresaId },
      include: {
        empresa: {
          select: {
            id: true,
            nome: true,
            slug: true,
          },
        },
      },
    });

    if (!assinatura) {
      return null;
    }

    const planoInfo = PLANOS[assinatura.plano];

    return {
      ...assinatura,
      planoInfo,
    };
  }

  async cancelarAssinatura(empresaId: string) {
    const assinatura = await this.prisma.assinatura.findUnique({
      where: { empresaId },
    });

    if (!assinatura) {
      throw new NotFoundException('Assinatura não encontrada');
    }

    if (assinatura.status !== 'ATIVA') {
      throw new BadRequestException('Assinatura não está ativa');
    }

    // Cancelar no Stripe
    if (assinatura.stripeSubscriptionId) {
      await this.stripeService.cancelarAssinatura(
        assinatura.stripeSubscriptionId,
      );
    }

    // Atualizar no banco
    return this.prisma.assinatura.update({
      where: { empresaId },
      data: {
        status: 'CANCELADA',
        dataFim: new Date(),
      },
    });
  }

  async reativarAssinatura(empresaId: string) {
    const assinatura = await this.prisma.assinatura.findUnique({
      where: { empresaId },
    });

    if (!assinatura) {
      throw new NotFoundException('Assinatura não encontrada');
    }

    if (assinatura.status === 'ATIVA') {
      throw new BadRequestException('Assinatura já está ativa');
    }

    // Reativar no Stripe (criar nova subscription)
    const plano = PLANOS[assinatura.plano];
    const subscription = await this.stripeService.criarAssinatura({
      customerId: assinatura.stripeCustomerId,
      plano: assinatura.plano,
      valor: plano.valor,
    });

    // Atualizar no banco
    return this.prisma.assinatura.update({
      where: { empresaId },
      data: {
        status: 'ATIVA',
        stripeSubscriptionId: subscription.id,
        dataFim: null,
        proximaCobranca: new Date((subscription as any).current_period_end * 1000),
      },
    });
  }

  async buscarHistoricoPagamentos(empresaId: string) {
    return this.prisma.pagamento.findMany({
      where: {
        empresaId,
        tipo: 'ASSINATURA',
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Método chamado pelo webhook do Stripe
  async processarEventoStripe(evento: any) {
    switch (evento.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await this.atualizarAssinatura(evento.data.object);
        break;
      case 'customer.subscription.deleted':
        await this.cancelarAssinaturaPorStripeId(evento.data.object.id);
        break;
      case 'invoice.payment_succeeded':
        await this.registrarPagamento(evento.data.object);
        break;
      case 'invoice.payment_failed':
        await this.registrarFalhaPagamento(evento.data.object);
        break;
    }
  }

  private async atualizarAssinatura(subscription: any) {
    const assinatura = await this.prisma.assinatura.findFirst({
      where: { stripeSubscriptionId: subscription.id },
    });

    if (assinatura) {
      await this.prisma.assinatura.update({
        where: { id: assinatura.id },
        data: {
          status: subscription.status === 'active' ? 'ATIVA' : 'SUSPENSA',
          proximaCobranca: new Date((subscription as any).current_period_end * 1000),
        },
      });
    }
  }

  private async cancelarAssinaturaPorStripeId(subscriptionId: string) {
    const assinatura = await this.prisma.assinatura.findFirst({
      where: { stripeSubscriptionId: subscriptionId },
    });

    if (assinatura) {
      await this.prisma.assinatura.update({
        where: { id: assinatura.id },
        data: {
          status: 'CANCELADA',
          dataFim: new Date(),
        },
      });
    }
  }

  private async registrarPagamento(invoice: any) {
    const assinatura = await this.prisma.assinatura.findFirst({
      where: { stripeSubscriptionId: invoice.subscription },
    });

    if (assinatura) {
      await this.prisma.pagamento.create({
        data: {
          empresaId: assinatura.empresaId,
          assinaturaId: assinatura.id,
          tipo: 'ASSINATURA',
          metodo: 'CARTAO',
          status: 'APROVADO',
          valor: invoice.amount_paid / 100,
          dataPagamento: new Date(invoice.status_transitions.paid_at * 1000),
        },
      });
    }
  }

  private async registrarFalhaPagamento(invoice: any) {
    const assinatura = await this.prisma.assinatura.findFirst({
      where: { stripeSubscriptionId: invoice.subscription },
    });

    if (assinatura) {
      // Usar transação para garantir consistência
      await this.prisma.$transaction(async (tx) => {
        await tx.pagamento.create({
          data: {
            empresaId: assinatura.empresaId,
            assinaturaId: assinatura.id,
            tipo: 'ASSINATURA',
            metodo: 'CARTAO',
            status: 'RECUSADO',
            valor: invoice.amount_due / 100,
          },
        });

        // Suspender assinatura
        await tx.assinatura.update({
          where: { id: assinatura.id },
          data: { status: 'SUSPENSA' },
        });
      });
    }
  }
}
