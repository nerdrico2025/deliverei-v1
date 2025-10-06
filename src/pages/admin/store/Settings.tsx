import React, { useState, useEffect } from "react";
import { DashboardShell } from "../../../components/layout/DashboardShell";
import { StoreSidebar } from "../../../components/layout/StoreSidebar";
import { Button } from "../../../components/common/Button";
import { Input } from "../../../components/common/Input";
import { Copy, ExternalLink } from "lucide-react";
import { useToast } from "../../../ui/feedback/ToastContext";

type Tab = "loja" | "pagamentos" | "integracoes" | "vitrine" | "promocoes";

export default function StoreSettings() {
  const [tab, setTab] = useState<Tab>("loja");
  const { push } = useToast();
  const [slug, setSlug] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("deliverei_store_slug");
    if (saved) setSlug(saved);
    else setSlug("minha-marmitaria");
  }, []);

  const storeUrl = `${window.location.origin}/loja/${slug || "minha-marmitaria"}`;

  const saveStoreData = () => {
    localStorage.setItem("deliverei_store_slug", slug || "minha-marmitaria");
    push({ message: "Configurações da loja salvas!", tone: "success" });
  };

  const copyUrl = async () => {
    await navigator.clipboard.writeText(storeUrl);
    push({ message: "URL copiada!", tone: "success" });
  };

  return (
    <DashboardShell sidebar={<StoreSidebar />}>
      <h1 className="mb-4 text-xl font-semibold text-[#1F2937]">Configurações</h1>
      <div className="mb-4 flex flex-wrap gap-2">
        {[
          { k: "loja", l: "Loja" },
          { k: "pagamentos", l: "Pagamentos" },
          { k: "integracoes", l: "Integrações" },
          { k: "vitrine", l: "Vitrine" },
          { k: "promocoes", l: "Promoções" },
        ].map((t) => (
          <button
            key={t.k}
            onClick={() => setTab(t.k as Tab)}
            className={`rounded px-3 py-2 text-sm ${
              tab === t.k
                ? "bg-[#D22630] text-white"
                : "bg-white border border-[#E5E7EB] text-[#1F2937] hover:bg-[#F9FAFB]"
            }`}
          >
            {t.l}
          </button>
        ))}
      </div>

      {tab === "loja" && (
        <section className="rounded-lg border border-[#E5E7EB] bg-white p-6 shadow-sm space-y-6">
          <div>
            <h2 className="mb-4 text-lg font-semibold text-[#1F2937]">Dados da loja</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm text-[#4B5563]">Nome da loja</label>
                <Input placeholder="Ex: Marmitaria do João" />
              </div>
              <div>
                <label className="mb-1 block text-sm text-[#4B5563]">WhatsApp de contato</label>
                <Input placeholder="(11) 99999-9999" />
              </div>
              <div>
                <label className="mb-1 block text-sm text-[#4B5563]">Taxa de entrega padrão</label>
                <Input placeholder="10.00" type="number" step="0.01" />
              </div>
            </div>
          </div>

          <div className="border-t border-[#E5E7EB] pt-6">
            <h2 className="mb-4 text-lg font-semibold text-[#1F2937]">URL da Vitrine</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm text-[#4B5563]">Slug da vitrine</label>
                <Input
                  placeholder="sua-loja"
                  value={slug}
                  onChange={(e) =>
                    setSlug(e.target.value.replace(/\s+/g, "-").toLowerCase())
                  }
                />
                <p className="mt-1 text-xs text-[#6B7280]">
                  Use letras minúsculas, números e hífens. Ex: minha-marmitaria
                </p>
              </div>
              <div>
                <label className="mb-1 block text-sm text-[#4B5563]">URL pública</label>
                <div className="flex items-center gap-2">
                  <Input value={storeUrl} readOnly className="flex-1" />
                  <button
                    type="button"
                    onClick={copyUrl}
                    className="flex items-center gap-1 rounded border border-[#E5E7EB] px-3 py-2 text-sm hover:bg-[#F9FAFB] transition"
                    title="Copiar"
                  >
                    <Copy size={16} />
                  </button>
                  <a
                    href={storeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 rounded bg-[#D22630] px-3 py-2 text-sm text-white hover:bg-[#B31E27] transition"
                    title="Abrir"
                  >
                    <ExternalLink size={16} />
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={saveStoreData}>Salvar Configurações</Button>
          </div>
        </section>
      )}

      {tab === "pagamentos" && (
        <section className="rounded-md border border-[#E5E7EB] bg-white p-4">
          <h2 className="mb-3 text-lg font-semibold text-[#1F2937]">Asaas</h2>
          <div className="grid gap-3 md:grid-cols-2">
            <Input placeholder="API Key" type="password" />
            <Input
              placeholder="Webhook URL"
              value={`${window.location.origin}/webhooks/asaas`}
              readOnly
            />
          </div>
          <div className="mt-4 flex gap-2">
            <Button>Salvar</Button>
            <Button variant="secondary">Testar conexão</Button>
          </div>
        </section>
      )}

      {tab === "integracoes" && (
        <section className="rounded-md border border-[#E5E7EB] bg-white p-4">
          <h2 className="mb-3 text-lg font-semibold text-[#1F2937]">WhatsApp / N8N</h2>
          <div className="grid gap-3 md:grid-cols-2">
            <Input placeholder="N8N Webhook URL" />
            <Input placeholder="Webhook de status de pedido" />
          </div>
          <p className="mt-2 text-sm text-[#4B5563]">
            Defina os webhooks para disparos automáticos de mensagens.
          </p>
          <div className="mt-4">
            <Button>Salvar</Button>
          </div>
        </section>
      )}

      {tab === "vitrine" && (
        <section className="rounded-md border border-[#E5E7EB] bg-white p-4">
          <h2 className="mb-3 text-lg font-semibold text-[#1F2937]">Branding</h2>
          <div className="grid gap-3 md:grid-cols-2">
            <Input placeholder="Logo URL" />
            <Input placeholder="Banner/Capa URL" />
            <Input placeholder="Cor primária (hex)" defaultValue="#D22630" />
            <Input placeholder="Cor secundária (hex)" defaultValue="#FFC107" />
          </div>
          <div className="mt-4">
            <Button>Salvar</Button>
          </div>
        </section>
      )}

      {tab === "promocoes" && (
        <section className="space-y-4">
          <div className="rounded-md border border-[#E5E7EB] bg-white p-4">
            <h2 className="mb-3 text-lg font-semibold text-[#1F2937]">Cupons</h2>
            <div className="grid gap-3 md:grid-cols-3">
              <Input placeholder="Código" />
              <select className="h-10 rounded-md border border-[#E5E7EB] px-3 focus:border-[#D22630] focus:ring-2 focus:ring-[#D22630]/20 outline-none">
                <option>Percentual</option>
                <option>Valor</option>
                <option>Frete grátis</option>
              </select>
              <Input placeholder="Valor" type="number" step="0.01" />
            </div>
            <div className="mt-3">
              <Button>Criar Cupom</Button>
            </div>
          </div>

          <div className="rounded-md border border-[#E5E7EB] bg-white p-4">
            <h2 className="mb-3 text-lg font-semibold text-[#1F2937]">Cashback</h2>
            <div className="grid gap-3 md:grid-cols-3">
              <Input placeholder="% de cashback" type="number" step="0.01" />
              <Input placeholder="Validade (dias)" type="number" />
              <select className="h-10 rounded-md border border-[#E5E7EB] px-3 focus:border-[#D22630] focus:ring-2 focus:ring-[#D22630]/20 outline-none">
                <option>Ativo</option>
                <option>Inativo</option>
              </select>
            </div>
            <div className="mt-3">
              <Button>Salvar regras</Button>
            </div>
          </div>
        </section>
      )}
    </DashboardShell>
  );
}
