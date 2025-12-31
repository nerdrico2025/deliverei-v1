import { Test, TestingModule } from '@nestjs/testing';
import { WebhooksController } from '../src/modules/webhooks/webhooks.controller';
import { WebhooksService } from '../src/modules/webhooks/webhooks.service';

describe('WebhooksController', () => {
  let controller: WebhooksController;
  let service: { processarWebhookAsaas: jest.Mock };

  beforeEach(async () => {
    service = { processarWebhookAsaas: jest.fn().mockResolvedValue({ received: true }) } as any;
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WebhooksController],
      providers: [{ provide: WebhooksService, useValue: service }],
    }).compile();

    controller = module.get<WebhooksController>(WebhooksController);
  });

  it('deve processar webhook Asaas', async () => {
    const res = await controller.handleAsaasWebhook('token', { event: 'PAYMENT_RECEIVED' });
    expect(service.processarWebhookAsaas).toHaveBeenCalled();
    expect(res).toEqual({ received: true });
  });
});
