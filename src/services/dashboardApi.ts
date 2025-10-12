import apiClient from './apiClient';

export interface DashboardStats {
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
  pedidosPorStatus: Array<{
    status: string;
    quantidade: number;
  }>;
  produtosMaisVendidos: Array<{
    id: string;
    nome: string;
    imagem: string;
    preco: number;
    quantidadeVendida: number;
  }>;
}

export interface SalesDataPoint {
  data: string;
  total: number;
}

export interface PopularProduct {
  id: string;
  nome: string;
  imagem: string | null;
  preco: number;
  categoria: string | null;
  quantidadeVendida: number;
  totalVendido: number;
}

/**
 * Dashboard API service
 * Connects to the backend dashboard endpoints
 */
export const dashboardApi = {
  /**
   * Get dashboard statistics
   * @returns Dashboard statistics including sales, orders, and products
   */
  async getEstatisticas(): Promise<DashboardStats> {
    try {
      const response = await apiClient.get('/dashboard/estatisticas');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard statistics:', error);
      throw error;
    }
  },

  /**
   * Get sales chart data
   * @param periodo - Period to fetch (dia, semana, mes)
   * @returns Array of sales data points
   */
  async getGraficoVendas(periodo: 'dia' | 'semana' | 'mes' = 'dia'): Promise<SalesDataPoint[]> {
    try {
      const response = await apiClient.get('/dashboard/vendas', {
        params: { periodo },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching sales chart data:', error);
      throw error;
    }
  },

  /**
   * Get popular products
   * @param limit - Number of products to fetch
   * @returns Array of popular products
   */
  async getProdutosPopulares(limit: number = 10): Promise<PopularProduct[]> {
    try {
      const response = await apiClient.get('/dashboard/produtos-populares', {
        params: { limit: limit.toString() },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching popular products:', error);
      throw error;
    }
  },

  /**
   * Get sales chart data with custom date range
   * @param startDate - Start date
   * @param endDate - End date
   * @returns Array of sales data points
   */
  async getGraficoVendasCustom(startDate: Date, endDate: Date): Promise<SalesDataPoint[]> {
    try {
      const response = await apiClient.get('/dashboard/vendas', {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching custom sales chart data:', error);
      throw error;
    }
  },
};
