
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
// import { AssinaturasService } from '../assinaturas/assinaturas.service';
import { PagamentosService } from '../pagamentos/pagamentos.service';
// import { StripeService } from '../assinaturas/stripe.service';

@Injectable()
export class WebhooksService {
  constructor(
    private prisma: PrismaService,
    // private assinaturasService: AssinaturasService,
    private pagamentosService: PagamentosService,
    // private stripeService: StripeService,
  ) {}

  async processarWebhookStripe(payload: string, signature: string) {
    // Temporariamente desabilitado - módulo de assinaturas não implementado
    throw new BadRequestException('Webhook Stripe temporariamente desabilitado');
    
    /*
    let evento;

    try {
      // Verificar assinatura do webhook
      evento = await this.stripeService.verificarWebhook(payload, signature);
    } catch (error) {
      throw new BadRequestException('Assinatura do webhook inválida');
    }

    // Salvar log
    const log = await this.prisma.webhookLog.create({
      data: {
        origem: 'STRIPE',
        evento: evento.type,
        payload: evento,
        processado: false,
      },
    });

    try {
      // Processar evento
      await this.assinaturasService.processarEventoStripe(evento);

      // Marcar como processado
      await this.prisma.webhookLog.update({
        where: { id: log.id },
        data: { processado: true },
      });

      return { received: true };
    } catch (error) {
      // Salvar erro
      await this.prisma.webhookLog.update({
        where: { id: log.id },
        data: { erro: error.message },
      });

      throw error;
    }
    */
  }

  async processarWebhookAsaas(body: any, token: string) {
    // Verificar token
    const webhookToken = process.env.ASAAS_WEBHOOK_TOKEN;
    if (webhookToken && token !== webhookToken) {
      throw new BadRequestException('Token do webhook inválido');
    }

    // Salvar log
    const log = await this.prisma.webhookLog.create({
      data: {
        origem: 'ASAAS',
        evento: body.event,
        payload: body,
        processado: false,
      },
    });

    try {
      // Processar evento
      await this.pagamentosService.processarEventoAsaas(body);

      // Marcar como processado
      await this.prisma.webhookLog.update({
        where: { id: log.id },
        data: { processado: true },
      });

      return { received: true };
    } catch (error) {
      // Salvar erro
      await this.prisma.webhookLog.update({
        where: { id: log.id },
        data: { erro: error.message },
      });

      throw error;
    }
  }

  async listarLogs(origem?: string, processado?: boolean) {
    const where: any = {};

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
}
