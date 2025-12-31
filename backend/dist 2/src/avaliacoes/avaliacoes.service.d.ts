import { PrismaService } from '../database/prisma.service';
import { CreateAvaliacaoDto } from './dto/create-avaliacao.dto';
export declare class AvaliacoesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createAvaliacaoDto: CreateAvaliacaoDto, usuarioId: string, empresaId: string): Promise<{
        usuario: {
            id: string;
            nome: string;
            email: string;
        };
        produto: {
            id: string;
            nome: string;
        };
    } & {
        id: string;
        nota: number;
        comentario: string | null;
        produtoId: string;
        usuarioId: string;
        pedidoId: string | null;
        createdAt: Date;
    }>;
    findByProduto(produtoId: string, empresaId: string): Promise<{
        avaliacoes: ({
            usuario: {
                id: string;
                nome: string;
            };
        } & {
            id: string;
            nota: number;
            comentario: string | null;
            produtoId: string;
            usuarioId: string;
            pedidoId: string | null;
            createdAt: Date;
        })[];
        estatisticas: {
            total: number;
            media: number;
        };
    }>;
    findByUsuario(usuarioId: string, empresaId: string): Promise<({
        produto: {
            id: string;
            nome: string;
            imagem: string;
        };
    } & {
        id: string;
        nota: number;
        comentario: string | null;
        produtoId: string;
        usuarioId: string;
        pedidoId: string | null;
        createdAt: Date;
    })[]>;
    remove(id: string, usuarioId: string, empresaId: string): Promise<{
        id: string;
        nota: number;
        comentario: string | null;
        produtoId: string;
        usuarioId: string;
        pedidoId: string | null;
        createdAt: Date;
    }>;
}
