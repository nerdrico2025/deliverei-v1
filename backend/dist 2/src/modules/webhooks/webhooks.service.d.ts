import { PrismaService } from '../../database/prisma.service';
import { PagamentosService } from '../pagamentos/pagamentos.service';
export declare class WebhooksService {
    private prisma;
    private pagamentosService;
    constructor(prisma: PrismaService, pagamentosService: PagamentosService);
    processarWebhookStripe(payload: string, signature: string): Promise<void>;
    processarWebhookAsaas(body: any, token: string): Promise<{
        received: boolean;
    }>;
    listarLogs(origem?: string, processado?: boolean): Promise<{
        id: string;
        origem: string;
        evento: string;
        payload: string;
        processado: boolean;
        erro: string | null;
        createdAt: Date;
    }[]>;
}
