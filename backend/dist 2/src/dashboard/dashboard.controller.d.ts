import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getEstatisticas(req: any): Promise<{
        pedidos: {
            hoje: number;
            semana: number;
            mes: number;
        };
        vendas: {
            hoje: number;
            semana: number;
            mes: number;
        };
        ticketMedio: number;
        pedidosPorStatus: {
            status: string;
            quantidade: number;
        }[];
        produtosMaisVendidos: {
            quantidadeVendida: number;
            id: string;
            nome: string;
            preco: number;
            imagem: string;
        }[];
    }>;
    getGraficoVendas(req: any, periodo?: 'dia' | 'semana' | 'mes', startDate?: string, endDate?: string): Promise<{
        data: string;
        total: number;
    }[]>;
    getProdutosPopulares(req: any, limit?: string): Promise<{
        quantidadeVendida: number;
        totalVendido: number;
        id: string;
        nome: string;
        preco: number;
        imagem: string;
        categoria: string;
    }[]>;
}
