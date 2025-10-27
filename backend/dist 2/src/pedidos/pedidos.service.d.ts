import { PrismaService } from '../database/prisma.service';
import { UpdateStatusPedidoDto } from './dto/update-status-pedido.dto';
import { FiltrarPedidosDto } from './dto/filtrar-pedidos.dto';
export declare class PedidosService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    findAll(filtros: FiltrarPedidosDto, empresaId?: string): Promise<{
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
    findMeusPedidos(userId: string, empresaId: string, page?: number, limit?: number): Promise<{
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
    findOne(id: string, empresaId?: string, userId?: string): Promise<{
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
    updateStatus(id: string, updateStatusDto: UpdateStatusPedidoDto, empresaId?: string): Promise<{
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
    cancel(id: string, empresaId: string, userId: string, isAdmin: boolean): Promise<{
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
