import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Star, CreditCard, User, ShoppingBag, Clock, CheckCircle } from 'lucide-react';
import { pedidosApi, Pedido } from '../../services/backendApi';
import { Loading } from '../../components/common/Loading';
import { getStatusColor, STATUS_LABELS } from '../../utils/statusColors';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPedidos: 0,
    pedidosPendentes: 0,
    pedidosEntregues: 0,
    valorTotal: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const pedidosData = await pedidosApi.meusPedidos();
        setPedidos(pedidosData.slice(0, 5)); // Últimos 5 pedidos

        // Calcular estatísticas
        const totalPedidos = pedidosData.length;
        const pedidosPendentes = pedidosData.filter(p => p.status === 'PENDENTE').length;
        const pedidosEntregues = pedidosData.filter(p => p.status === 'ENTREGUE').length;
        const valorTotal = pedidosData.reduce((sum, p) => sum + p.total, 0);

        setStats({
          totalPedidos,
          pedidosPendentes,
          pedidosEntregues,
          valorTotal,
        });
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const quickActions = [
    {
      title: 'Meus Pedidos',
      description: 'Visualize todos os seus pedidos',
      icon: Package,
      path: '/meus-pedidos',
      color: 'bg-blue-500',
    },
    {
      title: 'Minhas Avaliações',
      description: 'Veja suas avaliações de produtos',
      icon: Star,
      path: '/minhas-avaliacoes',
      color: 'bg-yellow-500',
    },
    {
      title: 'Histórico de Pagamentos',
      description: 'Consulte seus pagamentos',
      icon: CreditCard,
      path: '/pagamentos',
      color: 'bg-green-500',
    },
    {
      title: 'Fazer Pedido',
      description: 'Explore produtos e faça um novo pedido',
      icon: ShoppingBag,
      path: '/storefront',
      color: 'bg-purple-500',
    },
  ];

  const statCards = [
    {
      title: 'Total de Pedidos',
      value: stats.totalPedidos,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Pedidos Pendentes',
      value: stats.pedidosPendentes,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      title: 'Pedidos Entregues',
      value: stats.pedidosEntregues,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Valor Total Gasto',
      value: `R$ ${stats.valorTotal.toFixed(2)}`,
      icon: CreditCard,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Bem-vindo de volta! Aqui está um resumo da sua conta.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Ações Rápidas</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => navigate(action.path)}
                    className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-md transition-all text-left"
                  >
                    <div className="flex items-center mb-2">
                      <div className={`p-2 rounded-lg ${action.color} text-white`}>
                        <action.icon className="w-5 h-5" />
                      </div>
                      <h3 className="ml-3 font-medium text-gray-900">{action.title}</h3>
                    </div>
                    <p className="text-sm text-gray-500">{action.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Pedidos Recentes</h2>
              <button
                onClick={() => navigate('/meus-pedidos')}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Ver todos
              </button>
            </div>
            <div className="p-6">
              {pedidos.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">Você ainda não fez nenhum pedido</p>
                  <button
                    onClick={() => navigate('/storefront')}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Fazer primeiro pedido
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {pedidos.map(pedido => {
                    const statusColor = getStatusColor(pedido.status);
                    return (
                      <div key={pedido.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium text-gray-900">
                            Pedido #{pedido.numero}
                          </h3>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColor.bg} ${statusColor.text}`}>
                            {STATUS_LABELS[pedido.status]}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>
                            {format(new Date(pedido.criadoEm), "dd/MM/yyyy", { locale: ptBR })}
                          </span>
                          <span className="font-medium text-gray-900">
                            R$ {pedido.total.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;