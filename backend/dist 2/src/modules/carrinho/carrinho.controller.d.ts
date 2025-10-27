import { CarrinhoService } from './carrinho.service';
import { AdicionarItemCarrinhoDto, AtualizarItemCarrinhoDto, CheckoutDto } from './dto';
export declare class CarrinhoController {
    private readonly carrinhoService;
    constructor(carrinhoService: CarrinhoService);
    obterCarrinho(usuarioId: string, empresaId: string): Promise<{
        subtotal: number;
        totalItens: number;
        itens: ({
            produto: {
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
            };
        } & {
            id: string;
            carrinhoId: string;
            produtoId: string;
            quantidade: number;
            precoUnitario: number;
            createdAt: Date;
        })[];
        id: string;
        usuarioId: string;
        empresaId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    adicionarItem(usuarioId: string, empresaId: string, dto: AdicionarItemCarrinhoDto): Promise<{
        produto: {
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
        };
    } & {
        id: string;
        carrinhoId: string;
        produtoId: string;
        quantidade: number;
        precoUnitario: number;
        createdAt: Date;
    }>;
    atualizarItem(usuarioId: string, empresaId: string, itemId: string, dto: AtualizarItemCarrinhoDto): Promise<{
        produto: {
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
        };
    } & {
        id: string;
        carrinhoId: string;
        produtoId: string;
        quantidade: number;
        precoUnitario: number;
        createdAt: Date;
    }>;
    removerItem(usuarioId: string, empresaId: string, itemId: string): Promise<{
        message: string;
    }>;
    limparCarrinho(usuarioId: string, empresaId: string): Promise<{
        message: string;
    }>;
    checkout(usuarioId: string, empresaId: string, dto: CheckoutDto): Promise<{
        itens: ({
            produto: {
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
            };
        } & {
            id: string;
            pedidoId: string;
            produtoId: string;
            quantidade: number;
            precoUnitario: number;
            subtotal: number;
        })[];
    } & {
        id: string;
        numero: string;
        status: string;
        subtotal: number;
        desconto: number;
        total: number;
        frete: number;
        clienteId: string;
        empresaId: string;
        enderecoEntrega: string | null;
        formaPagamento: string | null;
        cupomDesconto: string | null;
        observacoes: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    obterRecomendacoes(usuarioId: string, empresaId: string): Promise<{
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
    }[]>;
}
