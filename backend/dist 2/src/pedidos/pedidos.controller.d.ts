import { PedidosService } from './pedidos.service';
import { UpdateStatusPedidoDto } from './dto/update-status-pedido.dto';
import { FiltrarPedidosDto } from './dto/filtrar-pedidos.dto';
export declare const TipoUsuario: {
    readonly CLIENTE: "CLIENTE";
    readonly ADMIN_EMPRESA: "ADMIN_EMPRESA";
    readonly SUPER_ADMIN: "SUPER_ADMIN";
};
export declare class PedidosController {
    private readonly pedidosService;
    constructor(pedidosService: PedidosService);
    findAll(filtros: FiltrarPedidosDto, req: any): Promise<{
        data: ({
            cliente: {
                id: string;
                nome: string;
                email: string;
            };
            itens: ({
                produto: {
                    id: string;
                    nome: string;
                    imagem: string;
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
        })[];
        pagination: {
            currentPage: number;
            totalPages: number;
            totalItems: number;
            itemsPerPage: number;
            hasNextPage: boolean;
            hasPreviousPage: boolean;
        };
    }>;
    findMeusPedidos(req: any, page?: string, limit?: string): Promise<{
        data: ({
            itens: ({
                produto: {
                    id: string;
                    nome: string;
                    preco: number;
                    imagem: string;
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
        })[];
        pagination: {
            currentPage: number;
            totalPages: number;
            totalItems: number;
            itemsPerPage: number;
            hasNextPage: boolean;
            hasPreviousPage: boolean;
        };
    }>;
    findOne(id: string, req: any): Promise<{
        cliente: {
            id: string;
            nome: string;
            email: string;
        };
        itens: ({
            produto: {
                id: string;
                nome: string;
                preco: number;
                imagem: string;
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
    updateStatus(id: string, updateStatusDto: UpdateStatusPedidoDto, req: any): Promise<{
        cliente: {
            id: string;
            nome: string;
            email: string;
        };
        itens: ({
            produto: {
                id: string;
                nome: string;
                imagem: string;
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
    cancel(id: string, req: any): Promise<{
        cliente: {
            id: string;
            nome: string;
            email: string;
        };
        itens: ({
            produto: {
                id: string;
                nome: string;
                imagem: string;
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
}
