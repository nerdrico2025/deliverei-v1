import { WhatsappService } from './whatsapp.service';
export declare class WhatsappController {
    private readonly whatsappService;
    constructor(whatsappService: WhatsappService);
    enviarMensagem(body: {
        telefone: string;
        mensagem: string;
        pedidoId?: string;
    }, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    listarMensagens(req: any): Promise<({
        pedido: {
            numero: string;
            empresaId: string;
        };
    } & {
        id: string;
        pedidoId: string;
        telefone: string;
        mensagem: string;
        status: string;
        erro: string | null;
        createdAt: Date;
    })[]>;
    listarMensagensPorPedido(pedidoId: string, req: any): Promise<{
        id: string;
        pedidoId: string;
        telefone: string;
        mensagem: string;
        status: string;
        erro: string | null;
        createdAt: Date;
    }[]>;
    configurar(body: {
        whatsappNumero: string;
        whatsappToken: string;
    }, req: any): Promise<{
        success: boolean;
        message: string;
        numero: string;
    }>;
}
