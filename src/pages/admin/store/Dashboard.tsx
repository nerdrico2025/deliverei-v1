import React, { useState, useEffect, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { DashboardShell } from "../../../components/layout/DashboardShell";
import { StoreSidebar } from "../../../components/layout/StoreSidebar";
import { TrendingUp, ShoppingBag, DollarSign, AlertTriangle, ExternalLink, Copy, Eye, X } from "lucide-react";
import { Input } from "../../../components/common/Input";
import { Loading } from "../../../components/common/Loading";
import { useToast } from "../../../ui/feedback/ToastContext";
import { useAuth } from "../../../auth/AuthContext";
import DateRangeFilter, { DateRange, calculateDateRange } from "../../../components/dashboard/DateRangeFilter";
import SalesChart from "../../../components/dashboard/SalesChart";
import { dashboardApi, SalesDataPoint } from "../../../services/dashboardApi";
import { formatCurrency } from "../../../utils/formatters";
import { resolveTenantSlug } from "../../../services/api.utils";
import { pedidosApi } from "../../../services/backendApi";
import { getProducts } from "../../../services/productsApi";

const getStoreSlug = () => {
  try {
    const fromStorage = localStorage.getItem("deliverei_tenant_slug") || localStorage.getItem("deliverei_store_slug");
    return (fromStorage || resolveTenantSlug() || "minha-loja").trim();
  } catch {
    return "minha-loja";
  }
};

const getPublicOrigin = () => {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const isLocal = /localhost|127\.|0\.0\.0\.0/.test(origin);
  const envDomain = (import.meta as any)?.env?.VITE_PUBLIC_APP_DOMAIN || "https://deliverei.com.br";
  return isLocal ? envDomain : origin;
};

const getStoreUrl = (slug: string) => `${getPublicOrigin()}/loja/${slug}`;

// Tipos de dados reais
type RecentOrder = {
  id: string;
  cliente: string;
  total: number;
  status: string;
  criadoEm: string;
};

export default function StoreDashboard() {
  const { user } = useAuth();
  const { push } = useToast();
  const [previewOpen, setPreviewOpen] = useState(false);
  const slug = user?.empresaId || getStoreSlug();
  const url = getStoreUrl(slug);

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(url);
      push({ message: "Link copiado!", tone: "success" });
    } catch {
      push({ message: "Falha ao copiar link", tone: "error" });
    }
  };
  
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
  const [dashboardStats, setDashboardStats] = useState<any | null>(null);
  const [lowStockCount, setLowStockCount] = useState<number>(0);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);

  // Fetch dashboard analytics and chart data
  useEffect(() => {
    const fetchAllData = async () => {
      setStatsLoading(true);
      setSalesLoading(true);
      setOrdersLoading(true);
      setSalesError(null);

      const withRetry = async <T,>(f: () => Promise<T>): Promise<T> => {
        try {
          return await f();
        } catch (e) {
          await new Promise((r) => setTimeout(r, 600));
          return await f();
        }
      };

      try {
        const data = await withRetry(() => dashboardApi.getGraficoVendasCustom(
          dateRange.startDate,
          dateRange.endDate
        ));
        setSalesData(data);
      } catch (error) {
        console.error('Error fetching sales data:', error);
        setSalesError('Erro ao carregar dados de vendas');
        setSalesData([]);
      } finally {
        setSalesLoading(false);
      }

      try {
        const stats = await withRetry(() => dashboardApi.getEstatisticas(dateRange.startDate, dateRange.endDate));
        setDashboardStats(stats);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        setDashboardStats(null);
      } finally {
        setStatsLoading(false);
      }

      try {
        const prods = await withRetry(() => getProducts({ limit: 100 }));
        const low = (prods?.data || []).filter((p) => Number(p.estoque ?? 0) <= 3).length;
        setLowStockCount(low);
      } catch (error) {
        setLowStockCount(0);
      }

      try {
        // Recent orders (limit and then filter by date range)
        const res = await pedidosApi.listar({ page: 1, limit: 10 });
        const raw: any[] = Array.isArray(res?.pedidos) ? res.pedidos : [];
        const filtered = raw.filter((p) => {
          const d = new Date(p.criadoEm);
          return d >= dateRange.startDate && d <= dateRange.endDate;
        });
        const recent = filtered
          .sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime())
          .slice(0, 3)
          .map((p) => ({
            id: p.id,
            cliente: p.cliente?.nome || '',
            total: Number(p.total ?? 0),
            status: String(p.status || '').toLowerCase().replace(/_/g, ' '),
            criadoEm: new Date(p.criadoEm).toLocaleString('pt-BR'),
          }));
        setRecentOrders(recent);
      } catch (error) {
        setRecentOrders([]);
      } finally {
        setOrdersLoading(false);
      }
    };
    
    fetchAllData();
  }, [dateRange]);

  // Compute metrics
  const totalSales = useMemo(() => salesData.reduce((sum, d) => sum + (Number(d.total) || 0), 0), [salesData]);
  const openOrdersCount = useMemo(() => {
    const list = Array.isArray(dashboardStats?.pedidosPorStatus) ? dashboardStats.pedidosPorStatus : [];
    const openStatuses = new Set(["PENDENTE", "CONFIRMADO", "EM_PREPARO", "SAIU_ENTREGA"]);
    return list.filter((s: any) => openStatuses.has(String(s.status))).reduce((acc: number, s: any) => acc + Number(s.quantidade || 0), 0);
  }, [dashboardStats]);
  const avgTicket = useMemo(() => Number(dashboardStats?.ticketMedio ?? 0), [dashboardStats]);

  const stats = [
    { label: "Vendas (período)", value: formatCurrency(totalSales), icon: DollarSign, color: "text-[#16A34A]" },
    { label: "Pedidos (em aberto)", value: String(openOrdersCount), icon: ShoppingBag, color: "text-[#0EA5E9]" },
    { label: "Ticket médio", value: formatCurrency(avgTicket), icon: TrendingUp, color: "text-[#D22630]" },
    { label: "Baixo estoque", value: String(lowStockCount), icon: AlertTriangle, color: "text-[#F59E0B]" },
  ];

  // Fallback legível para nome da loja a partir do slug
  const humanizeSlug = (s: string) => String(s || "")
  .split("-")
  .filter(Boolean)
  .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
  .join(" ");

  const storeNameLocal = localStorage.getItem("deliverei_company_name");
  const storeName = storeNameLocal || humanizeSlug(slug) || "Loja";

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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="rounded-lg border border-[#E5E7EB] bg-white p-4">
            <div className="flex items-center gap-3">
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
              <div>
                <div className="text-sm text-[#6B7280]">{stat.label}</div>
                <div className="text-xl font-semibold text-[#111827]">{stat.value}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Sales Chart */}
      <div className="mt-6 rounded-lg border border-[#E5E7EB] bg-white">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] p-4">
          <h2 className="text-lg font-semibold text-[#111827]">Vendas no período</h2>
          {salesLoading && <Loading message="Carregando gráfico..." />}
        </div>
        <div className="p-4">
          {salesError ? (
            <div className="text-sm text-[#DC2626]">{salesError}</div>
          ) : (
            <SalesChart data={salesData} />
          )}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="mt-6 rounded-lg border border-[#E5E7EB] bg-white">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] p-4">
          <h2 className="text-lg font-semibold text-[#111827]">Pedidos recentes</h2>
          {ordersLoading && <Loading message="Carregando pedidos..." />}
        </div>
        <div className="p-4">
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between rounded-md border border-[#E5E7EB] p-3">
                <div>
                  <div className="font-medium text-[#111827]">#{order.id} - {order.cliente}</div>
                  <div className="text-sm text-[#6B7280]">{order.criadoEm}</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-[#6B7280] capitalize">{order.status}</div>
                  <div className="text-sm font-semibold text-[#111827]">{formatCurrency(order.total)}</div>
                </div>
              </div>
            ))}
            {recentOrders.length === 0 && (
              <div className="text-sm text-[#6B7280]">Nenhum pedido no período selecionado.</div>
            )}
          </div>
        </div>
      </div>

      {/* Storefront preview CTA */}
      <div className="mt-6 rounded-lg border border-[#E5E7EB] bg-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold text-[#111827]">Vitrine da loja</div>
            <div className="text-sm text-[#6B7280]">Abra a vitrine para ver seus produtos como os clientes veem.</div>
          </div>
          <div className="flex gap-2">
            <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-md border border-[#E5E7EB] px-3 py-2 text-sm text-[#111827] hover:bg-[#F9FAFB]">
              <ExternalLink className="h-4 w-4" /> Abrir vitrine
            </a>
            <button onClick={copyUrl} className="inline-flex items-center gap-2 rounded-md border border-[#E5E7EB] px-3 py-2 text-sm text-[#111827] hover:bg-[#F9FAFB]">
              <Copy className="h-4 w-4" /> Copiar link
            </button>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
