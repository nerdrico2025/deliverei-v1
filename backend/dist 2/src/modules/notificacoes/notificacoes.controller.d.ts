import { NotificacoesService } from './notificacoes.service';
import { CreateNotificacaoDto, UpdateNotificacaoDto } from './dto';
export declare class NotificacoesController {
    private readonly notificacoesService;
    constructor(notificacoesService: NotificacoesService);
    create(createNotificacaoDto: CreateNotificacaoDto): Promise<{
        id: string;
        titulo: string;
        mensagem: string;
        tipo: string;
        lida: boolean;
        usuarioId: string;
        pedidoId: string | null;
        createdAt: Date;
    }>;
    findAll(req: any, page: number, limit: number, tipo?: string, lida?: boolean): Promise<{
        id: string;
        titulo: string;
        mensagem: string;
        tipo: string;
        lida: boolean;
        usuarioId: string;
        pedidoId: string | null;
        createdAt: Date;
    }[]>;
    countNaoLidas(req: any): Promise<number>;
    findOne(id: string, req: any): Promise<{
        id: string;
        titulo: string;
        mensagem: string;
        tipo: string;
        lida: boolean;
        usuarioId: string;
        pedidoId: string | null;
        createdAt: Date;
    }>;
    update(id: string, updateNotificacaoDto: UpdateNotificacaoDto, req: any): Promise<{
        id: string;
        titulo: string;
        mensagem: string;
        tipo: string;
        lida: boolean;
        usuarioId: string;
        pedidoId: string | null;
        createdAt: Date;
    }>;
    marcarComoLida(id: string, req: any): Promise<{
        id: string;
        titulo: string;
        mensagem: string;
        tipo: string;
        lida: boolean;
        usuarioId: string;
        pedidoId: string | null;
        createdAt: Date;
    }>;
    marcarTodasComoLidas(req: any): Promise<import(".prisma/client").Prisma.BatchPayload>;
    remove(id: string, req: any): Promise<{
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
