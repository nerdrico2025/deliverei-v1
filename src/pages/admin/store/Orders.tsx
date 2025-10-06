import React, { useMemo, useState } from "react";
import { DashboardShell } from "../../../components/layout/DashboardShell";
import { StoreSidebar } from "../../../components/layout/StoreSidebar";
import { Button } from "../../../components/common/Button";
import { X } from "lucide-react";

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
  pagamento: "pendente" | "aprovado" | "recusado" | "estornado";
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

export default function OrdersPage() {
  const [filterStatus, setFilterStatus] = useState<"" | Order["status"]>("");
  const [orders, setOrders] = useState<Order[]>([
    {
      id: "1001",
      cliente: "Maria Silva",
      total: 72.3,
      pagamento: "aprovado",
      status: "recebido",
      criadoEm: "2025-10-05 12:20",
      itens: [
        { productId: "p1", nome: "Marmita Fit Frango", qtd: 2, preco: 29.9 },
        { productId: "p2", nome: "Suco Detox", qtd: 1, preco: 12.5 },
      ],
    },
    {
      id: "1002",
      cliente: "João Souza",
      total: 45.0,
      pagamento: "pendente",
      status: "em_preparo",
      criadoEm: "2025-10-05 12:30",
      itens: [{ productId: "p3", nome: "Marmita Veggie", qtd: 1, preco: 45.0 }],
    },
    {
      id: "1003",
      cliente: "Ana Costa",
      total: 56.8,
      pagamento: "aprovado",
      status: "saiu_entrega",
      criadoEm: "2025-10-05 11:45",
      itens: [
        { productId: "p4", nome: "Marmita Tradicional", qtd: 2, preco: 22.5 },
        { productId: "p5", nome: "Refrigerante", qtd: 2, preco: 5.9 },
      ],
    },
  ]);
  const [drawer, setDrawer] = useState<{ open: boolean; order?: Order }>({ open: false });

  const filtered = useMemo(
    () => (filterStatus ? orders.filter((o) => o.status === filterStatus) : orders),
    [orders, filterStatus]
  );

  const openDetails = (o: Order) => setDrawer({ open: true, order: o });
  const closeDetails = () => setDrawer({ open: false });

  const advanceStatus = (o: Order) => {
    const idx = statusOptions.indexOf(o.status);
    if (idx < 0 || idx >= statusOptions.length - 1) return;
    const next = statusOptions[idx + 1];
    setOrders((curr) => curr.map((x) => (x.id === o.id ? { ...x, status: next } : x)));
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
                <td className="p-3 capitalize">{o.pagamento}</td>
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
                <span className="capitalize">{drawer.order.pagamento}</span>
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
                          <td className="p-2 text-right">R$ {it.preco.toFixed(2)}</td>
                          <td className="p-2 text-right">R$ {(it.preco * it.qtd).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t bg-[#F9FAFB]">
                        <td className="p-2 font-medium" colSpan={3}>
                          Total
                        </td>
                        <td className="p-2 text-right font-semibold">
                          R$ {drawer.order.total.toFixed(2)}
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
