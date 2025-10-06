import React from "react";
import { DashboardShell } from "../../../components/layout/DashboardShell";
import { StoreSidebar } from "../../../components/layout/StoreSidebar";
import { TrendingUp, ShoppingBag, DollarSign, AlertTriangle } from "lucide-react";

const Topbar = () => (
  <div className="sticky top-0 z-10 border-b border-[#E5E7EB] bg-white p-3">
    <div className="mx-auto flex max-w-7xl items-center justify-between">
      <div className="font-semibold text-[#1F2937]">Minha Loja</div>
      <div className="text-sm text-[#4B5563]">Olá, João</div>
    </div>
  </div>
);

export default function StoreDashboard() {
  const stats = [
    { label: "Vendas (hoje)", value: "R$ 1.245,00", icon: DollarSign, color: "text-[#16A34A]" },
    { label: "Pedidos (em aberto)", value: "12", icon: ShoppingBag, color: "text-[#0EA5E9]" },
    { label: "Ticket médio", value: "R$ 45,30", icon: TrendingUp, color: "text-[#D22630]" },
    { label: "Baixo estoque", value: "3", icon: AlertTriangle, color: "text-[#F59E0B]" },
  ];

  return (
    <DashboardShell sidebar={<StoreSidebar currentPath="/admin/store" />} topbar={<Topbar />}>
      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-md border border-[#E5E7EB] bg-white p-4">
              <div className="mb-2 flex items-center justify-between">
                <div className="text-sm text-[#4B5563]">{stat.label}</div>
                <Icon className={stat.color} size={20} />
              </div>
              <div className="text-2xl font-bold text-[#1F2937]">{stat.value}</div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="rounded-md border border-[#E5E7EB] bg-white p-4">
          <h3 className="mb-3 font-semibold text-[#1F2937]">Gráfico de vendas</h3>
          <div className="h-48 rounded bg-[#F9FAFB] flex items-center justify-center text-[#4B5563]">
            Gráfico placeholder
          </div>
        </div>
        <div className="rounded-md border border-[#E5E7EB] bg-white p-4">
          <h3 className="mb-3 font-semibold text-[#1F2937]">Pedidos recentes</h3>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between border-b border-[#E5E7EB] pb-2">
                <div>
                  <div className="text-sm font-medium text-[#1F2937]">Pedido #{1000 + i}</div>
                  <div className="text-xs text-[#4B5563]">Cliente {i}</div>
                </div>
                <div className="text-sm font-semibold text-[#1F2937]">R$ 45,00</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
