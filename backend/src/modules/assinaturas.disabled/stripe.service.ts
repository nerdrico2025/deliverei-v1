
import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy', {
      apiVersion: '2024-10-28' as any,
    });
  }

  async criarCheckoutSession(params: {
    empresaId: string;
    plano: string;
    valor: number;
    email: string;
  }) {
    const priceId = this.getPriceId(params.plano);

    const session = await this.stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer_email: params.email,
      metadata: {
        empresaId: params.empresaId,
        plano: params.plano,
      },
      success_url: `${process.env.FRONTEND_URL}/assinatura/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/assinatura/cancelado`,
    });

    return session;
  }

  async criarAssinatura(params: {
    customerId: string;
    plano: string;
    valor: number;
  }) {
    const priceId = this.getPriceId(params.plano);

    const subscription = await this.stripe.subscriptions.create({
      customer: params.customerId,
      items: [{ price: priceId }],
      metadata: {
        plano: params.plano,
      },
    });

    return subscription;
  }

  async cancelarAssinatura(subscriptionId: string) {
    return this.stripe.subscriptions.cancel(subscriptionId);
  }

  async verificarWebhook(payload: string, signature: string) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      throw new Error('Stripe webhook secret not configured');
    }

    return this.stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret,
    );
  }

  private getPriceId(plano: string): string {
    const priceIds = {
      BASICO: process.env.STRIPE_PRICE_BASICO || 'price_basico',
      PROFISSIONAL: process.env.STRIPE_PRICE_PROFISSIONAL || 'price_profissional',
      ENTERPRISE: process.env.STRIPE_PRICE_ENTERPRISE || 'price_enterprise',
    };

    return priceIds[plano] || priceIds.BASICO;
  }
}
