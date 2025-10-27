
import React, { useMemo, useState, useEffect } from "react";
import { DashboardShell } from "../../../components/layout/DashboardShell";
import { StoreSidebar } from "../../../components/layout/StoreSidebar";
import { Button } from "../../../components/common/Button";
import { X } from "lucide-react";
import { useAuth } from "../../../auth/AuthContext";
import { formatCurrency } from "../../../utils/formatters";
import { backendApi, pedidosApi } from "../../../services/backendApi";

type OrderItem = {
  productId: string;
  nome: string;
  qtd: number;
  preco: number;
};

type Order = {
  id: string;
  cliente: string;
  total: number;
  pagamento: string;
  status: "recebido" | "aprovado" | "em_preparo" | "saiu_entrega" | "entregue" | "cancelado";
  criadoEm: string;
  itens: OrderItem[];
};

const statusOptions: Order["status"][] = [
  "recebido",
  "aprovado",
  "em_preparo",
  "saiu_entrega",
  "entregue",
  "cancelado",
];

// Mapear status backend -> UI
const backendToUiStatus = (s: string): Order["status"] => {
  const map: Record<string, Order["status"]> = {
    PENDENTE: "recebido",
    CONFIRMADO: "aprovado",
    EM_PREPARO: "em_preparo",
    SAIU_ENTREGA: "saiu_entrega",
    ENTREGUE: "entregue",
    CANCELADO: "cancelado",
  };
  return map[s] || "recebido";
};

// Mapear status UI -> backend
const uiToBackendStatus = (s: Order["status"]): string => {
  const map: Record<Order["status"], string> = {
    recebido: "PENDENTE",
    aprovado: "CONFIRMADO",
    em_preparo: "EM_PREPARO",
    saiu_entrega: "SAIU_ENTREGA",
    entregue: "ENTREGUE",
    cancelado: "CANCELADO",
  };
  return map[s];
};

export default function OrdersPage() {
  const { user } = useAuth();
  const [filterStatus, setFilterStatus] = useState<"" | Order["status"]>("");
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [drawer, setDrawer] = useState<{ open: boolean; order?: Order }>({ open: false });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params: any = {};
        if (filterStatus) params.status = uiToBackendStatus(filterStatus);
        const res = await pedidosApi.listar(params);
        const orders: Order[] = (res?.pedidos || []).map((p: any) => ({
          id: p.id,
          cliente: p.cliente?.nome || "",
          total: Number(p.total ?? 0),
          pagamento: (p.formaPagamento || "").toLowerCase(),
          status: backendToUiStatus(p.status),
          criadoEm: new Date(p.criadoEm).toLocaleString("pt-BR"),
          itens: Array.isArray(p.itens)
            ? p.itens.map((it: any) => ({
                productId: it.produtoId,
                nome: it.produto?.nome || "",
                qtd: Number(it.quantidade ?? 0),
                preco: Number(it.precoUnitario ?? 0),
              }))
            : [],
        }));
        setAllOrders(orders);
      } catch (err) {
        setAllOrders([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [filterStatus]);

  const filtered = useMemo(
    () => (filterStatus ? allOrders.filter((o) => o.status === filterStatus) : allOrders),
    [allOrders, filterStatus]
  );

  const openDetails = (o: Order) => setDrawer({ open: true, order: o });
  const closeDetails = () => setDrawer({ open: false });

  const advanceStatus = async (o: Order) => {
    const idx = statusOptions.indexOf(o.status);
    if (idx < 0 || idx >= statusOptions.length - 1) return;
    const next = statusOptions[idx + 1];
    try {
      await pedidosApi.atualizarStatus(o.id, uiToBackendStatus(next));
      setAllOrders((curr) => curr.map((x) => (x.id === o.id ? { ...x, status: next } : x)));
    } catch (err) {
      // silently fail for now; future: show toast
    }
  };

  return (
    <DashboardShell sidebar={<StoreSidebar />}>
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h1 className="text-xl font-semibold text-[#1F2937]">Pedidos</h1>
        <div className="flex gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="h-10 rounded-md border border-[#E5E7EB] px-3 focus:border-[#D22630] focus:ring-2 focus:ring-[#D22630]/20 outline-none"
          >
            <option value="">Todos os status</option>
            {statusOptions.map((s) => (
              <option key={s} value={s}>
                {s.replace("_", " ")}
              </option>
            ))}
          </select>
          <Button variant="secondary">Exportar CSV</Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-md border border-[#E5E7EB] bg-white">
        <table className="w-full min-w-[800px]">
          <thead className="bg-[#F9FAFB]">
            <tr>
              <th className="p-3 text-left text-sm text-[#4B5563]">Pedido</th>
              <th className="p-3 text-left text-sm text-[#4B5563]">Cliente</th>
              <th className="p-3 text-left text-sm text-[#4B5563]">Pagamento</th>
              <th className="p-3 text-left text-sm text-[#4B5563]">Status</th>
              <th className="p-3 text-left text-sm text-[#4B5563]">Criado em</th>
              <th className="p-3 text-right text-sm text-[#4B5563]">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <tr key={o.id} className="border-t">
                <td className="p-3 font-medium text-[#1F2937]">#{o.id}</td>
                <td className="p-3">{o.cliente}</td>
                <td className="p-3 capitalize">{o.pagamento || '-'}</td>
                <td className="p-3 capitalize">{o.status.replace("_", " ")}</td>
                <td className="p-3">{o.criadoEm}</td>
                <td className="p-3 text-right">
                  <button className="text-[#D22630] hover:underline mr-3" onClick={() => openDetails(o)}>
                    Ver
                  </button>
                  <button className="text-[#16A34A] hover:underline" onClick={() => advanceStatus(o)}>
                    Avançar
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td className="p-6 text-center text-[#4B5563]" colSpan={6}>
                  Nenhum pedido encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {drawer.open && drawer.order && (
        <>
          <div className="fixed inset-0 z-40 bg-black/30" onClick={closeDetails} />
          <aside className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] p-4">
              <h3 className="text-lg font-semibold text-[#1F2937]">Pedido #{drawer.order.id}</h3>
              <button onClick={closeDetails} aria-label="Fechar">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 space-y-4 text-sm text-[#4B5563]">
              <div>
                <span className="font-medium text-[#1F2937]">Cliente:</span> {drawer.order.cliente}
              </div>
              <div>
                <span className="font-medium text-[#1F2937]">Status:</span>{" "}
                <span className="capitalize">{drawer.order.status}</span>
              </div>
              <div>
                <span className="font-medium text-[#1F2937]">Pagamento:</span>{" "}
                <span className="capitalize">{drawer.order.pagamento || '-'}</span>
              </div>

              <div className="mt-4">
                <div className="mb-2 font-medium text-[#1F2937]">Itens do pedido</div>
                <div className="rounded border border-[#E5E7EB] overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-[#F9FAFB]">
                      <tr>
                        <th className="p-2 text-left text-xs">Produto</th>
                        <th className="p-2 text-center text-xs">Qtd</th>
                        <th className="p-2 text-right text-xs">Preço</th>
                        <th className="p-2 text-right text-xs">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {drawer.order.itens.map((it) => (
                        <tr key={it.productId} className="border-t">
                          <td className="p-2">{it.nome}</td>
                          <td className="p-2 text-center">{it.qtd}</td>
                          <td className="p-2 text-right">{formatCurrency(it.preco)}</td>
                          <td className="p-2 text-right">{formatCurrency(it.preco * it.qtd)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t bg-[#F9FAFB]">
                        <td className="p-2 font-medium" colSpan={3}>
                          Total
                        </td>
                        <td className="p-2 text-right font-semibold">
                          {formatCurrency(drawer.order.total)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              <div>
                <span className="font-medium text-[#1F2937]">Criado em:</span> {drawer.order.criadoEm}
              </div>

              <Button variant="secondary" className="w-full">
                Reenviar confirmação
              </Button>
            </div>
          </aside>
        </>
      )}
    </DashboardShell>
  );
}
