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
   * @param startDate - Optional start date for filtering
   * @param endDate - Optional end date for filtering
   * @returns Dashboard statistics including sales, orders, and products
   */
  async getEstatisticas(startDate?: Date, endDate?: Date): Promise<DashboardStats> {
    try {
      const params: Record<string, string> = {};
      if (startDate) params.startDate = startDate.toISOString();
      if (endDate) params.endDate = endDate.toISOString();
      
      const response = await apiClient.get('/dashboard/estatisticas', { params });
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
   * @param startDate - Optional start date for filtering
   * @param endDate - Optional end date for filtering
   * @returns Array of popular products
   */
  async getProdutosPopulares(limit: number = 10, startDate?: Date, endDate?: Date): Promise<PopularProduct[]> {
    try {
      const params: Record<string, string> = { limit: limit.toString() };
      if (startDate) params.startDate = startDate.toISOString();
      if (endDate) params.endDate = endDate.toISOString();
      
      const response = await apiClient.get('/dashboard/produtos-populares', { params });
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
