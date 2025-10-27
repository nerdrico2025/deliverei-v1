import { PrismaService } from '../../database/prisma.service';
export declare class NotificacoesService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    enviarNotificacaoPedido(pedidoId: string, tipo: string, mensagem: string): Promise<{
        success: boolean;
        message: string;
    }>;
    criarNotificacao(usuarioId: string, titulo: string, mensagem: string, tipo?: string, empresaId?: string): Promise<{
        id: string;
        titulo: string;
        mensagem: string;
        tipo: string;
        lida: boolean;
        usuarioId: string;
        pedidoId: string | null;
        createdAt: Date;
    }>;
    findAll(usuarioId: string, page?: number, limit?: number, tipo?: string, lida?: boolean): Promise<{
        id: string;
        titulo: string;
        mensagem: string;
        tipo: string;
        lida: boolean;
        usuarioId: string;
        pedidoId: string | null;
        createdAt: Date;
    }[]>;
    findOne(id: string, usuarioId: string): Promise<{
        id: string;
        titulo: string;
        mensagem: string;
        tipo: string;
        lida: boolean;
        usuarioId: string;
        pedidoId: string | null;
        createdAt: Date;
    }>;
    marcarComoLida(id: string, usuarioId: string): Promise<{
        id: string;
        titulo: string;
        mensagem: string;
        tipo: string;
        lida: boolean;
        usuarioId: string;
        pedidoId: string | null;
        createdAt: Date;
    }>;
    marcarTodasComoLidas(usuarioId: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
    remove(id: string, usuarioId: string): Promise<{
        id: string;
        titulo: string;
        mensagem: string;
        tipo: string;
        lida: boolean;
        usuarioId: string;
        pedidoId: string | null;
        createdAt: Date;
    }>;
    create(createNotificacaoDto: any): Promise<{
        id: string;
        titulo: string;
        mensagem: string;
        tipo: string;
        lida: boolean;
        usuarioId: string;
        pedidoId: string | null;
        createdAt: Date;
    }>;
    countNaoLidas(usuarioId: string): Promise<number>;
    update(id: string, updateNotificacaoDto: any, usuarioId: string): Promise<{
        id: string;
        titulo: string;
        mensagem: string;
        tipo: string;
        lida: boolean;
        usuarioId: string;
        pedidoId: string | null;
        createdAt: Date;
    }>;
}
