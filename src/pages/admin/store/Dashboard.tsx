import React, { useState, useEffect, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { DashboardShell } from "../../../components/layout/DashboardShell";
import { StoreSidebar } from "../../../components/layout/StoreSidebar";
import { TrendingUp, ShoppingBag, DollarSign, AlertTriangle, ExternalLink, Copy, Eye, X } from "lucide-react";
import { Input } from "../../../components/common/Input";
import { useToast } from "../../../ui/feedback/ToastContext";
import { useAuth } from "../../../auth/AuthContext";
import DateRangeFilter, { DateRange, calculateDateRange } from "../../../components/dashboard/DateRangeFilter";
import SalesChart from "../../../components/dashboard/SalesChart";
import { dashboardApi, SalesDataPoint } from "../../../services/dashboardApi";
import { formatCurrency } from "../../../utils/formatters";

const getStoreSlug = () => (localStorage.getItem("deliverei_store_slug") || "minha-loja").trim();
const getStoreUrl = () => `${window.location.origin}/loja/${getStoreSlug()}`;

// Mock data types
type Order = {
  id: string;
  cliente: string;
  total: number;
  pagamento: string;
  status: string;
  criadoEm: string;
  empresaId: string;
};

type Product = {
  id: string;
  title: string;
  price: number;
  stock: number;
  status: string;
  empresaId: string;
};

// Mock data with empresaId for data isolation
const MOCK_ORDERS: Order[] = [
  {
    id: "1001",
    cliente: "Maria Silva",
    total: 72.3,
    pagamento: "aprovado",
    status: "recebido",
    criadoEm: "2025-10-05 12:20",
    empresaId: "pizza-express",
  },
  {
    id: "1002",
    cliente: "João Silva",
    total: 79.8,
    pagamento: "aprovado",
    status: "em_preparo",
    criadoEm: "2025-10-05 13:45",
    empresaId: "pizza-express",
  },
  {
    id: "1003",
    cliente: "Ana Costa",
    total: 45.0,
    pagamento: "aprovado",
    status: "saiu_entrega",
    criadoEm: "2025-10-05 14:10",
    empresaId: "pizza-express",
  },
  {
    id: "2001",
    cliente: "Carlos Mendes",
    total: 89.9,
    pagamento: "aprovado",
    status: "recebido",
    criadoEm: "2025-10-05 12:30",
    empresaId: "burger-king",
  },
  {
    id: "2002",
    cliente: "Fernanda Lima",
    total: 67.5,
    pagamento: "aprovado",
    status: "aprovado",
    criadoEm: "2025-10-05 13:00",
    empresaId: "burger-king",
  },
];

const MOCK_PRODUCTS: Product[] = [
  { id: "p1", title: "Pizza Margherita", price: 35.9, stock: 5, status: "ativo", empresaId: "pizza-express" },
  { id: "p2", title: "Pizza Calabresa", price: 38.9, stock: 2, status: "ativo", empresaId: "pizza-express" },
  { id: "p3", title: "Pizza Portuguesa", price: 42.9, stock: 8, status: "ativo", empresaId: "pizza-express" },
  { id: "p4", title: "Whopper", price: 28.9, stock: 15, status: "ativo", empresaId: "burger-king" },
  { id: "p5", title: "Big King", price: 32.9, stock: 1, status: "ativo", empresaId: "burger-king" },
];

export default function StoreDashboard() {
  const { user } = useAuth();
  const { push } = useToast();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [companyOrders, setCompanyOrders] = useState<Order[]>([]);
  const [companyProducts, setCompanyProducts] = useState<Product[]>([]);
  const url = getStoreUrl();
  
  // Date range filter state (default to last 7 days)
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    return calculateDateRange("ultimos7dias");
  });
  
  // Loading states for all dashboard sections
  const [statsLoading, setStatsLoading] = useState(false);
  const [salesLoading, setSalesLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);
  
  // Data states
  const [salesData, setSalesData] = useState<SalesDataPoint[]>([]);
  const [salesError, setSalesError] = useState<string | null>(null);

  // Filter data by empresaId
  useEffect(() => {
    if (user?.empresaId) {
      const filteredOrders = MOCK_ORDERS.filter(o => o.empresaId === user.empresaId);
      const filteredProducts = MOCK_PRODUCTS.filter(p => p.empresaId === user.empresaId);
      setCompanyOrders(filteredOrders);
      setCompanyProducts(filteredProducts);
    } else {
      setCompanyOrders([]);
      setCompanyProducts([]);
    }
  }, [user?.empresaId]);
  
  // Fetch all dashboard data when date range changes
  useEffect(() => {
    const fetchAllData = async () => {
      // Start loading for all sections
      setStatsLoading(true);
      setSalesLoading(true);
      setOrdersLoading(true);
      setSalesError(null);
      
      try {
        // Fetch sales chart data
        const data = await dashboardApi.getGraficoVendasCustom(
          dateRange.startDate,
          dateRange.endDate
        );
        setSalesData(data);
      } catch (error) {
        console.error('Error fetching sales data:', error);
        setSalesError('Erro ao carregar dados de vendas');
        setSalesData([]);
      } finally {
        setSalesLoading(false);
        setStatsLoading(false);
        setOrdersLoading(false);
      }
    };
    
    fetchAllData();
  }, [dateRange]);

  // Calculate metrics based on filtered data and date range
  const metrics = useMemo(() => {
    // Filter orders within the selected date range
    const filteredOrders = companyOrders.filter(o => {
      const orderDate = new Date(o.criadoEm.replace(' ', 'T'));
      return orderDate >= dateRange.startDate && orderDate <= dateRange.endDate;
    });

    // Calculate total sales in the period
    const totalSales = filteredOrders.reduce((sum, o) => sum + o.total, 0);

    // Count open orders (not delivered or cancelled) in the period
    const openOrders = filteredOrders.filter(o => 
      o.status !== "entregue" && o.status !== "cancelado"
    ).length;

    // Calculate average ticket for the period
    const avgTicket = filteredOrders.length > 0 
      ? totalSales / filteredOrders.length 
      : 0;

    // Count low stock products (always show current state, not date-dependent)
    const lowStock = companyProducts.filter(p => p.stock <= 3).length;

    return {
      totalSales,
      openOrders,
      avgTicket,
      lowStock,
    };
  }, [companyOrders, companyProducts, dateRange]);

  // Get recent orders filtered by date range
  const recentOrders = useMemo(() => {
    const filteredOrders = companyOrders.filter(o => {
      const orderDate = new Date(o.criadoEm.replace(' ', 'T'));
      return orderDate >= dateRange.startDate && orderDate <= dateRange.endDate;
    });
    
    return [...filteredOrders]
      .sort((a, b) => b.criadoEm.localeCompare(a.criadoEm))
      .slice(0, 3);
  }, [companyOrders, dateRange]);

  const copyUrl = async () => {
    await navigator.clipboard.writeText(url);
    push({ message: "Link da vitrine copiado!", tone: "success" });
  };

  const stats = [
    { label: "Vendas (período)", value: formatCurrency(metrics.totalSales), icon: DollarSign, color: "text-[#16A34A]" },
    { label: "Pedidos (em aberto)", value: metrics.openOrders.toString(), icon: ShoppingBag, color: "text-[#0EA5E9]" },
    { label: "Ticket médio", value: formatCurrency(metrics.avgTicket), icon: TrendingUp, color: "text-[#D22630]" },
    { label: "Baixo estoque", value: metrics.lowStock.toString(), icon: AlertTriangle, color: "text-[#F59E0B]" },
  ];

  const storeName = user?.name || "Loja";

  return (
    <DashboardShell sidebar={<StoreSidebar />}>
      <Helmet>
        <title>Deliverei | Dashboard - {storeName}</title>
      </Helmet>
      
      {/* Page Header with Title and Period Filter */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-[#111827]">Dashboard - {storeName}</h1>
        <div className="w-full sm:w-auto sm:min-w-[280px]">
          <DateRangeFilter 
            value={dateRange} 
            onChange={setDateRange}
          />
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="relative rounded-md border border-[#E5E7EB] bg-white p-4">
              {statsLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-md">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#D22630] border-t-transparent"></div>
                </div>
              )}
              <div className="mb-2 flex items-center justify-between">
                <div className="text-sm text-[#4B5563]">{stat.label}</div>
                <Icon className={stat.color} size={20} />
              </div>
              <div className="text-2xl font-bold text-[#1F2937]">{stat.value}</div>
            </div>
          );
        })}
      </div>
      
      {/* Dashboard Sections */}
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {/* Sales Chart Section */}
        <section className="rounded-lg border border-[#E5E7EB] bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-[#1F2937]">Gráfico de vendas</h3>
          <SalesChart 
            data={salesData}
            loading={salesLoading}
            error={salesError}
          />
        </section>

        <section className="rounded-lg border border-[#E5E7EB] bg-white p-6 shadow-sm">
          <h3 className="mb-3 text-lg font-semibold text-[#1F2937]">Vitrine da Loja</h3>
          <p className="mb-3 text-sm text-[#4B5563]">
            Compartilhe o link da sua vitrine com seus clientes ou visualize como ela está
            aparecendo publicamente.
          </p>
          <div className="mb-3 flex items-center gap-2">
            <Input value={url} readOnly className="flex-1 text-sm" />
            <button
              onClick={copyUrl}
              className="flex items-center gap-1 rounded border border-[#E5E7EB] px-3 py-2 text-sm hover:bg-[#F9FAFB] transition"
              title="Copiar link"
            >
              <Copy size={16} />
            </button>
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 rounded bg-[#D22630] px-3 py-2 text-sm text-white hover:bg-[#B31E27] transition"
              title="Abrir vitrine"
            >
              <ExternalLink size={16} />
            </a>
            <button
              onClick={() => setPreviewOpen(true)}
              className="flex items-center gap-1 rounded bg-[#F3F4F6] px-3 py-2 text-sm hover:bg-[#E5E7EB] transition"
              title="Preview"
            >
              <Eye size={16} />
            </button>
          </div>
          <small className="text-[#6B7280]">URL pública da vitrine</small>
        </section>

        {/* Recent Orders Section */}
        <section className="rounded-lg border border-[#E5E7EB] bg-white p-6 shadow-sm relative">
          <h3 className="mb-3 text-lg font-semibold text-[#1F2937]">Pedidos recentes</h3>
          
          {ordersLoading ? (
            <div className="py-8 flex items-center justify-center">
              <div className="flex items-center gap-2 text-[#4B5563]">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#D22630] border-t-transparent"></div>
                <span className="text-sm">Carregando pedidos...</span>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {recentOrders.length === 0 ? (
                <div className="py-8 text-center text-[#4B5563]">
                  <p className="text-sm">Nenhum pedido encontrado</p>
                  <p className="mt-1 text-xs text-[#6B7280]">
                    Tente selecionar outro período
                  </p>
                </div>
              ) : (
                recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between border-b border-[#E5E7EB] pb-2">
                    <div>
                      <div className="text-sm font-medium text-[#1F2937]">Pedido #{order.id}</div>
                      <div className="text-xs text-[#4B5563]">{order.cliente}</div>
                    </div>
                    <div className="text-sm font-semibold text-[#1F2937]">{formatCurrency(order.total)}</div>
                  </div>
                ))
              )}
            </div>
          )}
        </section>
      </div>

      {previewOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 p-6 flex items-center justify-center">
          <div className="mx-auto max-w-5xl w-full rounded-lg bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] p-3 bg-[#F9FAFB]">
              <div className="font-medium text-[#1F2937]">Preview da Vitrine</div>
              <button
                onClick={() => setPreviewOpen(false)}
                className="rounded p-1 hover:bg-[#E5E7EB] transition"
                aria-label="Fechar"
              >
                <X size={20} />
              </button>
            </div>
            <div className="h-[70vh]">
              <iframe title="vitrine-preview" src={url} className="h-full w-full border-0" />
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
