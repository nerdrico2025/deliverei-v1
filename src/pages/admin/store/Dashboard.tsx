import React, { useState } from "react";
import { DashboardShell } from "../../../components/layout/DashboardShell";
import { StoreSidebar } from "../../../components/layout/StoreSidebar";
import { TrendingUp, ShoppingBag, DollarSign, AlertTriangle, ExternalLink, Copy, Eye, X } from "lucide-react";
import { Input } from "../../../components/common/Input";
import { useToast } from "../../../ui/feedback/ToastContext";

const getStoreSlug = () => (localStorage.getItem("deliverei_store_slug") || "minha-marmitaria").trim();
const getStoreUrl = () => `${window.location.origin}/loja/${getStoreSlug()}`;

export default function StoreDashboard() {
  const { push } = useToast();
  const [previewOpen, setPreviewOpen] = useState(false);
  const url = getStoreUrl();

  const copyUrl = async () => {
    await navigator.clipboard.writeText(url);
    push({ message: "Link da vitrine copiado!", tone: "success" });
  };
  const stats = [
    { label: "Vendas (hoje)", value: "R$ 1.245,00", icon: DollarSign, color: "text-[#16A34A]" },
    { label: "Pedidos (em aberto)", value: "12", icon: ShoppingBag, color: "text-[#0EA5E9]" },
    { label: "Ticket médio", value: "R$ 45,30", icon: TrendingUp, color: "text-[#D22630]" },
    { label: "Baixo estoque", value: "3", icon: AlertTriangle, color: "text-[#F59E0B]" },
  ];

  return (
    <DashboardShell sidebar={<StoreSidebar />}>
      <h1 className="mb-4 text-2xl font-semibold text-[#111827]">Dashboard</h1>

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
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <section className="rounded-lg border border-[#E5E7EB] bg-white p-6 shadow-sm">
          <h3 className="mb-3 text-lg font-semibold text-[#1F2937]">Gráfico de vendas</h3>
          <div className="h-48 rounded bg-[#F9FAFB] flex items-center justify-center text-[#4B5563]">
            Gráfico placeholder
          </div>
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

        <section className="rounded-lg border border-[#E5E7EB] bg-white p-6 shadow-sm">
          <h3 className="mb-3 text-lg font-semibold text-[#1F2937]">Pedidos recentes</h3>
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
