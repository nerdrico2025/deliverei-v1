import { PublicService } from './public.service';
export declare class PublicController {
    private readonly publicService;
    constructor(publicService: PublicService);
    getLojaInfo(slug: string): Promise<{
        id: string;
        nome: string;
        slug: string;
        subdominio: string;
    }>;
    getProdutos(slug: string, page: number, limit: number, categoria?: string, search?: string): Promise<{
        data: {
            id: string;
            nome: string;
            descricao: string | null;
            preco: number;
            imagem: string | null;
            ativo: boolean;
            empresaId: string;
            estoque: number;
            categoria: string | null;
            promo_tag: boolean;
            bestseller_tag: boolean;
            new_tag: boolean;
            createdAt: Date;
            updatedAt: Date;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getProdutoById(slug: string, id: string): Promise<{
        id: string;
        nome: string;
        descricao: string | null;
        preco: number;
        imagem: string | null;
        ativo: boolean;
        empresaId: string;
        estoque: number;
        categoria: string | null;
        promo_tag: boolean;
        bestseller_tag: boolean;
        new_tag: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getCategorias(slug: string): Promise<string[]>;
}
