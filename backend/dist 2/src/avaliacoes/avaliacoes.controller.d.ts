import { AvaliacoesService } from './avaliacoes.service';
import { CreateAvaliacaoDto } from './dto/create-avaliacao.dto';
export declare class AvaliacoesController {
    private readonly avaliacoesService;
    constructor(avaliacoesService: AvaliacoesService);
    create(createAvaliacaoDto: CreateAvaliacaoDto, req: any): Promise<{
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
    findByProduto(produtoId: string, req: any): Promise<{
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
    findByUsuario(req: any): Promise<({
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
    remove(id: string, req: any): Promise<{
        id: string;
        nota: number;
        comentario: string | null;
        produtoId: string;
        usuarioId: string;
        pedidoId: string | null;
        createdAt: Date;
    }>;
}
