import { PrismaService } from '../../database/prisma.service';
export declare class WhatsappService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    enviarMensagemPedido(pedidoId: string, telefone: string, mensagem: string, empresaId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    enviarNotificacaoStatus(pedidoId: string, novoStatus: string, empresaId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    private gerarMensagemStatus;
    enviarMensagem(empresaId: string, telefone: string, mensagem: string, pedidoId?: string): Promise<{
        success: boolean;
        message: string;
    }>;
    listarMensagens(empresaId: string): Promise<({
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
    listarMensagensPorPedido(pedidoId: string, empresaId: string): Promise<{
        id: string;
        pedidoId: string;
        telefone: string;
        mensagem: string;
        status: string;
        erro: string | null;
        createdAt: Date;
    }[]>;
    configurarWhatsApp(empresaId: string, whatsappNumero: string, whatsappToken: string): Promise<{
        success: boolean;
        message: string;
        numero: string;
    }>;
}
