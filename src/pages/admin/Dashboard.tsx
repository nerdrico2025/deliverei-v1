
import React, { useEffect, useState } from 'react';
import { dashboardApi, pedidosApi, DashboardEstatisticas, VendasPeriodo, ProdutoPopular, Pedido } from '../../services/backendApi';
import { TrendingUp, ShoppingCart, DollarSign, Package } from 'lucide-react';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const STATUS_COLORS: Record<string, string> = {
  PENDENTE: '#FCD34D',
  CONFIRMADO: '#3B82F6',
  EM_PREPARO: '#F97316',
  SAIU_ENTREGA: '#8B5CF6',
  ENTREGUE: '#10B981',
  CANCELADO: '#EF4444',
};

export const Dashboard: React.FC = () => {
  const [estatisticas, setEstatisticas] = useState<DashboardEstatisticas | null>(null);
  const [vendas, setVendas] = useState<VendasPeriodo[]>([]);
  const [produtosPopulares, setProdutosPopulares] = useState<ProdutoPopular[]>([]);
  const [pedidosRecentes, setPedidosRecentes] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [estatData, vendasData, produtosData, pedidosData] = await Promise.all([
          dashboardApi.estatisticas(),
          dashboardApi.vendas('mes'),
          dashboardApi.produtosPopulares(),
          pedidosApi.listar({ limit: 5 }),
        ]);
        setEstatisticas(estatData);
        setVendas(vendasData);
        setProdutosPopulares(produtosData);
        setPedidosRecentes(pedidosData.pedidos);
      } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!estatisticas) return null;

  const statCards = [
    {
      title: 'Pedidos Hoje',
      value: estatisticas.pedidosHoje,
      icon: ShoppingCart,
      color: 'bg-blue-500',
    },
    {
      title: 'Vendas Hoje',
      value: `R$ ${estatisticas.vendasHoje.toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-green-500',
    },
    {
      title: 'Ticket Médio',
      value: `R$ ${estatisticas.ticketMedio.toFixed(2)}`,
      icon: TrendingUp,
      color: 'bg-purple-500',
    },
    {
      title: 'Pedidos Mês',
      value: estatisticas.pedidosMes,
      icon: Package,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Visão geral do seu negócio</p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                </div>
                <div className={`${card.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Vendas */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Vendas (Últimos 30 dias)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={vendas}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="data"
                tickFormatter={(value) => format(new Date(value), 'dd/MM', { locale: ptBR })}
              />
              <YAxis />
              <Tooltip
                labelFormatter={(value) => format(new Date(value), 'dd/MM/yyyy', { locale: ptBR })}
                formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Total']}
              />
              <Legend />
              <Line type="monotone" dataKey="total" stroke="#3B82F6" strokeWidth={2} name="Vendas" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de Pedidos por Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Pedidos por Status</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={estatisticas.pedidosPorStatus}
                dataKey="quantidade"
                nameKey="status"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {estatisticas.pedidosPorStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status] || '#94A3B8'} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabelas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Produtos Populares */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Produtos Mais Vendidos</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {produtosPopulares.map((produto, index) => (
                <div key={produto.produtoId} className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">
                    {index + 1}
                  </div>
                  {produto.imagemUrl && (
                    <img
                      src={produto.imagemUrl}
                      alt={produto.nome}
                      className="w-12 h-12 object-cover rounded"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{produto.nome}</p>
                    <p className="text-xs text-gray-500">{produto.quantidadeVendida} vendidos</p>
                  </div>
                  <div className="text-sm font-semibold text-gray-900">
                    R$ {produto.totalVendas.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pedidos Recentes */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Pedidos Recentes</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {pedidosRecentes.map(pedido => (
                <div key={pedido.id} className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">#{pedido.numero}</p>
                    <p className="text-xs text-gray-500">{pedido.usuario?.nome}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className="px-2 py-1 text-xs font-medium rounded-full"
                      style={{
                        backgroundColor: `${STATUS_COLORS[pedido.status]}20`,
                        color: STATUS_COLORS[pedido.status],
                      }}
                    >
                      {pedido.status}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      R$ {pedido.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
