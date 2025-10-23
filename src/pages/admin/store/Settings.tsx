import React, { useState, useEffect } from "react";
import { DashboardShell } from "../../../components/layout/DashboardShell";
import { StoreSidebar } from "../../../components/layout/StoreSidebar";
import { Button } from "../../../components/common/Button";
import { Input } from "../../../components/common/Input";
import { Copy, ExternalLink } from "lucide-react";
import { useToast } from "../../../ui/feedback/ToastContext";
import { domainApi } from "../../../services/backendApi";

type Tab = "loja" | "pagamentos" | "integracoes" | "vitrine" | "marketing" | "promocoes";

type MarketingSettings = {
  enableLowStock: boolean;
  lowStockThreshold: number;
  lowStockMessage: string;
};

 export default function StoreSettings() {
   const [tab, setTab] = useState<Tab>("loja");
   const { push } = useToast();
   const [slug, setSlug] = useState("");
  const [marketing, setMarketing] = useState<MarketingSettings>({
    enableLowStock: true,
    lowStockThreshold: 5,
    lowStockMessage: "Últimas unidades!",
  });
  const [customDomain, setCustomDomain] = useState("");
  const [domainAvailable, setDomainAvailable] = useState<boolean | null>(null);
  const [domainError, setDomainError] = useState<string | null>(null);
  const [loadingDomain, setLoadingDomain] = useState(false);
  const [redirectEnabled, setRedirectEnabled] = useState(false);
  const [dnsLoading, setDnsLoading] = useState(false);
  const [dnsResult, setDnsResult] = useState<{ ok: boolean; records: { A: string[]; CNAME: string[] } } | null>(null);
 
   useEffect(() => {
     const saved = localStorage.getItem("deliverei_store_slug");
     if (saved) setSlug(saved);
     else setSlug("minha-marmitaria");
   }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("deliverei_marketing_settings");
      if (raw) {
        setMarketing((prev) => ({ ...prev, ...JSON.parse(raw) }));
      }
    } catch {}
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const info = await domainApi.getCurrent();
        if (info?.customDomain) {
          setCustomDomain(info.customDomain);
          setDomainAvailable(true);
        }
        if (info?.redirectEnabled !== undefined) {
          setRedirectEnabled(!!info.redirectEnabled);
        }
      } catch {
        // Backend pode não estar disponível; seguir silenciosamente
      }
    })();
  }, []);
 
  const sanitizeDomain = (input: string) => String(input || "").trim().toLowerCase();
  const isValidDomain = (domain: string) => /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/.test(domain);

   const storeUrl = `${window.location.origin}/loja/${slug || "minha-marmitaria"}`;
 
   const saveStoreData = async () => {
     localStorage.setItem("deliverei_store_slug", slug || "minha-marmitaria");

     // Salvar domínio personalizado se preenchido
     const domain = sanitizeDomain(customDomain);
     if (domain) {
       if (!isValidDomain(domain)) {
           push({ message: "Domínio inválido. Ex.: loja.exemplo.com", tone: "error" });
           return;
         }
         try {
           const res = await domainApi.save(domain, redirectEnabled);
           setCustomDomain(res.customDomain);
           push({ message: "Domínio personalizado salvo!", tone: "success" });
         } catch (err: any) {
           const msg = err?.response?.data?.message || "Erro ao salvar domínio personalizado";
           push({ message: msg, tone: "error" });
           return;
         }
       }

     push({ message: "Configurações da loja salvas!", tone: "success" });
   };

  const saveMarketing = () => {
    localStorage.setItem("deliverei_marketing_settings", JSON.stringify(marketing));
    push({ message: "Configurações de marketing salvas!", tone: "success" });
  };
 
   const copyUrl = async () => {
     await navigator.clipboard.writeText(storeUrl);
     push({ message: "URL copiada!", tone: "success" });
   };

  const checkDomainAvailability = async (value: string) => {
    const domain = sanitizeDomain(value);
    setDomainError(null);
    setDomainAvailable(null);
    if (!domain) return;
    if (!isValidDomain(domain)) {
      setDomainError("Formato de domínio inválido. Ex.: loja.exemplo.com");
      setDomainAvailable(false);
      return;
    }
    try {
      setLoadingDomain(true);
      const { available } = await domainApi.checkAvailability(domain);
      setDomainAvailable(available);
      if (!available) setDomainError("Domínio já está em uso por outra loja");
    } catch {
      setDomainError("Não foi possível verificar disponibilidade agora");
    } finally {
      setLoadingDomain(false);
    }
  };

  const checkDNS = async () => {
    const domain = sanitizeDomain(customDomain);
    if (!domain || !isValidDomain(domain)) {
      setDomainError("Formato de domínio inválido. Ex.: loja.exemplo.com");
      setDomainAvailable(false);
      return;
    }
    try {
      setDnsLoading(true);
      const res = await domainApi.dnsStatus(domain);
      setDnsResult(res);
      if (res.ok) {
        push({ message: "DNS do domínio está resolvendo", tone: "success" });
      } else {
        push({ message: "DNS pendente: configure registro A ou CNAME", tone: "warning" });
      }
    } catch {
      push({ message: "Falha ao verificar DNS agora", tone: "error" });
    } finally {
      setDnsLoading(false);
    }
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
          { k: "marketing", l: "Marketing" },
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

               <div className="md:col-span-2">
                 <label className="mb-1 block text-sm text-[#4B5563]">Domínio Personalizado</label>
                 <Input
                   placeholder="loja.seudominio.com"
                   value={customDomain}
                   onChange={(e) => {
                     setCustomDomain(e.target.value);
                     setDomainError(null);
                     setDomainAvailable(null);
                   }}
                   onBlur={(e) => checkDomainAvailability(e.target.value)}
                 />
                 <div className="mt-1 flex items-center gap-2">
                   {loadingDomain && (
                     <span className="text-xs text-[#6B7280]">Verificando disponibilidade...</span>
                   )}
                   {!loadingDomain && domainAvailable === true && (
                     <span className="text-xs text-green-600">Disponível</span>
                   )}
                   {!loadingDomain && domainAvailable === false && (
                     <span className="text-xs text-red-600">Indisponível</span>
                   )}
                   <Button variant="outline" size="sm" onClick={checkDNS} loading={dnsLoading} className="ml-2">Verificar DNS</Button>
                 </div>
                 <p className="mt-1 text-xs text-[#6B7280]">
                   Opcional. Configure um domínio próprio (via DNS) para acessar sua vitrine por uma URL personalizada. Ex.: loja.seudominio.com
                 </p>
                 {domainError && (
                   <p className="mt-1 text-xs text-red-600">{domainError}</p>
                 )}
                 <div className="mt-3 flex items-center gap-2">
                   <input
                     id="redirect-enabled"
                     type="checkbox"
                     checked={redirectEnabled}
                     onChange={(e) => setRedirectEnabled(e.target.checked)}
                     className="h-4 w-4 rounded border-[#E5E7EB] text-[#D22630] focus:ring-2 focus:ring-[#D22630]/20"
                   />
                   <label htmlFor="redirect-enabled" className="text-sm text-[#4B5563]">Redirecionar automaticamente clientes para o domínio personalizado</label>
                 </div>
                 {dnsResult && (
                   <div className={`mt-2 text-xs ${dnsResult.ok ? 'text-green-700' : 'text-yellow-700'}`}>
                     {dnsResult.ok ? 'DNS OK' : 'DNS pendente'}
                     {dnsResult.records && (
                       <div className="mt-1 text-[#4B5563]">
                         {dnsResult.records.A?.length ? `A: ${dnsResult.records.A.join(', ')}` : ''}
                         {dnsResult.records.CNAME?.length ? `  CNAME: ${dnsResult.records.CNAME.join(', ')}` : ''}
                       </div>
                     )}
                   </div>
                 )}

                 {/* Instruções de DNS para domínio personalizado */}
                 <div className="mt-4 rounded-md border border-[#E5E7EB] bg-[#F9FAFB] p-4" role="note" aria-label="Instruções de DNS">
                   <h3 className="text-sm font-semibold text-[#1F2937]">Como configurar o DNS do seu domínio</h3>
                   <ul className="mt-2 list-disc pl-5 text-sm text-[#4B5563]">
                     <li>Defina um registro <strong>CNAME</strong> apontando para o <span className="font-medium">domínio principal da loja</span>.</li>
                     <li>Ou um registro <strong>A</strong> apontando para o <span className="font-medium">endereço IP do servidor</span>.</li>
                     <li>Verifique qual tipo é mais adequado à sua infraestrutura: <strong>CNAME</strong> para domínios gerenciados e <strong>A</strong> para IPs estáticos.</li>
                   </ul>
                   <div className="mt-3 grid gap-3 md:grid-cols-2">
                     <div className="rounded border border-[#E5E7EB] bg-white p-3">
                       <p className="text-xs font-medium text-[#1F2937]">Exemplo CNAME</p>
                       <div className="mt-2 text-xs text-[#4B5563]">
                         <div><span className="font-medium">Host</span>: loja.seudominio.com</div>
                         <div><span className="font-medium">Tipo</span>: CNAME</div>
                         <div><span className="font-medium">Valor</span>: {window.location.host}</div>
                       </div>
                     </div>
                     <div className="rounded border border-[#E5E7EB] bg-white p-3">
                       <p className="text-xs font-medium text-[#1F2937]">Exemplo A</p>
                       <div className="mt-2 text-xs text-[#4B5563]">
                         <div><span className="font-medium">Host</span>: loja.seudominio.com</div>
                         <div><span className="font-medium">Tipo</span>: A</div>
                         <div><span className="font-medium">Valor</span>: 203.0.113.42</div>
                       </div>
                     </div>
                   </div>
                   <p className="mt-3 text-xs text-[#6B7280]">
                     Após configurar, a propagação DNS pode levar <span className="font-medium">24–48 horas</span>. Use “Verificar DNS” acima para acompanhar.
                   </p>
                   <a
                     href="https://docs.deliverei.app/dns-configuracao"
                     target="_blank"
                     rel="noreferrer"
                     className="mt-2 inline-flex items-center gap-1 text-xs text-[#D22630] hover:text-[#B31E27]"
                     title="Ver documentação de suporte"
                   >
                     <ExternalLink size={14} />
                     <span>Ver documentação de suporte</span>
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

      {tab === "marketing" && (
        <section className="rounded-md border border-[#E5E7EB] bg-white p-4 space-y-4">
          <h2 className="text-lg font-semibold text-[#1F2937]">Marketing</h2>
          <div>
            <h3 className="mb-2 text-sm font-medium text-[#1F2937]">Alertas de escassez</h3>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={marketing.enableLowStock}
                onChange={(e) => setMarketing((m) => ({ ...m, enableLowStock: e.target.checked }))}
              />
              Habilitar alerta de baixa de estoque
            </label>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm text-[#4B5563]">Quantidade limite</label>
                <Input
                  type="number"
                  min={1}
                  value={marketing.lowStockThreshold}
                  onChange={(e) =>
                    setMarketing((m) => ({ ...m, lowStockThreshold: Math.max(1, Number(e.target.value || 1)) }))
                  }
                  disabled={!marketing.enableLowStock}
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm text-[#4B5563]">Mensagem</label>
                <Input
                  value={marketing.lowStockMessage}
                  onChange={(e) => setMarketing((m) => ({ ...m, lowStockMessage: e.target.value }))}
                  placeholder="Últimas unidades!"
                  disabled={!marketing.enableLowStock}
                />
              </div>
            </div>
            <p className="mt-2 text-xs text-[#6B7280]">Dica: mensagens curtas e claras convertem melhor. Ex.: “Restam poucas unidades!”.</p>
            <div className="mt-3">
              <Button onClick={saveMarketing}>Salvar</Button>
            </div>
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
