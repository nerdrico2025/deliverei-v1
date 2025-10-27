import { RawBodyRequest } from '@nestjs/common';
import { Request } from 'express';
import { WebhooksService } from './webhooks.service';
export declare class WebhooksController {
    private readonly webhooksService;
    constructor(webhooksService: WebhooksService);
    handleStripeWebhook(signature: string, req: RawBodyRequest<Request>): Promise<void>;
    handleAsaasWebhook(token: string, body: any): Promise<{
        received: boolean;
    }>;
    listarLogs(origem?: string, processado?: string): Promise<{
        id: string;
        origem: string;
        evento: string;
        payload: string;
        processado: boolean;
        erro: string | null;
        createdAt: Date;
    }[]>;
}
