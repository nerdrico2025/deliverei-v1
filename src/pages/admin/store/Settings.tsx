import React, { useState, useEffect } from "react";
import { DashboardShell } from "../../../components/layout/DashboardShell";
import { StoreSidebar } from "../../../components/layout/StoreSidebar";
import { Button } from "../../../components/common/Button";
import { Input } from "../../../components/common/Input";
import { Copy, ExternalLink } from "lucide-react";
import { useToast } from "../../../ui/feedback/ToastContext";
import { domainApi, storefrontApi } from "../../../services/backendApi";
import { useAuth } from "../../../auth/AuthContext";
import { resolveTenantSlug, buildStoreUrl } from "../../../services/api.utils";

type Tab = "loja" | "pagamentos" | "integracoes" | "vitrine" | "marketing" | "promocoes";

type MarketingSettings = {
  enableLowStock: boolean;
  lowStockThreshold: number;
  lowStockMessage: string;
};

 export default function StoreSettings() {
   const [tab, setTab] = useState<Tab>("loja");
   const { push } = useToast();
   const { user } = useAuth();
   const [storeName, setStoreName] = useState("");
   const [slug, setSlug] = useState("");
   const [storePhone, setStorePhone] = useState("");
   const [storeResponsibleName, setStoreResponsibleName] = useState("");
   const [storeResponsibleEmail, setStoreResponsibleEmail] = useState("");
   const [storeResponsiblePhone, setStoreResponsiblePhone] = useState("");
   const [addressStreet, setAddressStreet] = useState("");
   const [addressCity, setAddressCity] = useState("");
   const [addressState, setAddressState] = useState("");
   const [addressZip, setAddressZip] = useState("");
   const [slugTouched, setSlugTouched] = useState(false);
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
     const saved = localStorage.getItem("deliverei_tenant_slug") ||
     localStorage.getItem("deliverei_store_slug") ||
     resolveTenantSlug() ||
     user?.empresaId ||
     "";
     if (saved) setSlug(saved);
     else setSlug("minha-marmitaria");
   }, []);

   useEffect(() => {
     // Não inicializar com user.name para evitar confusão com nome da empresa
     const phone = localStorage.getItem("deliverei_company_phone") || "";
     setStorePhone(phone);
     const savedName = localStorage.getItem("deliverei_company_name");
     if (savedName) setStoreName(savedName);
     // Hidratar responsável e endereço
     setStoreResponsibleName(localStorage.getItem("deliverei_responsavel_nome") || "");
     setStoreResponsibleEmail(localStorage.getItem("deliverei_responsavel_email") || "");
     setStoreResponsiblePhone(localStorage.getItem("deliverei_responsavel_telefone") || "");
     setAddressStreet(localStorage.getItem("deliverei_company_address") || "");
     setAddressCity(localStorage.getItem("deliverei_company_city") || "");
     setAddressState(localStorage.getItem("deliverei_company_state") || "");
     setAddressZip(localStorage.getItem("deliverei_company_zip") || "");
   }, []);

   // Auto-gerar slug quando o nome da loja muda, se usuário não alterou manualmente
   useEffect(() => {
     const shouldAuto = !slugTouched || ["default-company", "minha-loja", "minha-marmitaria"].includes((slug || "").trim());
     if (!storeName || !shouldAuto) return;
     const auto = storeName
       .toLowerCase()
       .normalize("NFD")
       .replace(/[\u0300-\u036f]/g, "")
       .replace(/[^a-z0-9\s-]/g, "")
       .replace(/\s+/g, "-")
       .replace(/-+/g, "-")
       .replace(/^-|-$/g, "");
     if (auto) setSlug(auto);
   }, [storeName]);

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
           try { localStorage.setItem('deliverei_custom_domain', info.customDomain); } catch {}
         }
         if (info?.redirectEnabled !== undefined) {
           setRedirectEnabled(!!info.redirectEnabled);
           try { localStorage.setItem('deliverei_redirect_enabled', String(!!info.redirectEnabled)); } catch {}
         }
       } catch {
         // Backend pode não estar disponível; seguir silenciosamente
       }
     })();
   }, []);

   // Carregar informações reais da loja (nome e slug) do backend quando possível
   useEffect(() => {
     const saved = localStorage.getItem("deliverei_store_slug");
     if (!saved) return;
     (async () => {
       try {
         const loja = await storefrontApi.getLojaInfo(saved);
         if (loja?.nome) setStoreName(loja.nome);
         if (loja?.slug) setSlug(loja.slug);
         // Nota: API pública não retorna telefone; mantemos storePhone via localStorage.
       } catch {
         // Ignora se backend estiver indisponível
       }
     })();
   }, []);

   // Tentar obter telefone da empresa via API privada, se disponível
   useEffect(() => {
     const saved = localStorage.getItem("deliverei_store_slug");
     if (!saved) return;
     (async () => {
       try {
         const { companiesApi } = await import("../../../services/backendApi");
         const info = await companiesApi.getBySlug(saved);
         if (info?.telefone) {
           setStorePhone(info.telefone);
           localStorage.setItem("deliverei_company_phone", info.telefone);
         }
         if (info?.nome && !storeName) setStoreName(info.nome);
       } catch {
         // Endpoint pode não existir; seguir silenciosamente
       }
     })();
   }, [storeName]);


  // Garantir nome da loja consistente quando não há nome salvo
  useEffect(() => {
    // Rehidratar quando o usuário/logar muda (ex.: após login)
    try {
      const phone = localStorage.getItem("deliverei_company_phone") || "";
      if (phone && phone !== storePhone) setStorePhone(phone);
      const savedName = localStorage.getItem("deliverei_company_name") || "";
      if (savedName && savedName !== storeName) setStoreName(savedName);
      const addr = localStorage.getItem("deliverei_company_address") || "";
      if (addr && addr !== addressStreet) setAddressStreet(addr);
      const city = localStorage.getItem("deliverei_company_city") || "";
      if (city && city !== addressCity) setAddressCity(city);
      const state = localStorage.getItem("deliverei_company_state") || "";
      if (state && state !== addressState) setAddressState(state);
      const zip = localStorage.getItem("deliverei_company_zip") || "";
      if (zip && zip !== addressZip) setAddressZip(zip);
    } catch {}
  }, [user?.id]);

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

   // Carregar informações reais da loja (nome e slug) do backend quando possível
   useEffect(() => {
     const saved = localStorage.getItem("deliverei_store_slug");
     if (!saved) return;
     (async () => {
       try {
         const loja = await storefrontApi.getLojaInfo(saved);
         if (loja?.nome) setStoreName(loja.nome);
         if (loja?.slug) setSlug(loja.slug);
         // Nota: API pública não retorna telefone; mantemos storePhone via localStorage.
       } catch {
         // Ignora se backend estiver indisponível
       }
     })();
   }, []);

   // Tentar obter telefone da empresa via API privada, se disponível
   useEffect(() => {
     const saved = localStorage.getItem("deliverei_store_slug");
     if (!saved) return;
     (async () => {
       try {
         const { companiesApi } = await import("../../../services/backendApi");
         const info = await companiesApi.getBySlug(saved);
         if (info?.telefone) {
           setStorePhone(info.telefone);
           localStorage.setItem("deliverei_company_phone", info.telefone);
         }
         if (info?.nome && !storeName) setStoreName(info.nome);
       } catch {
         // Endpoint pode não existir; seguir silenciosamente
       }
     })();
   }, [storeName]);
 
  const normalizeDomain = (input: string) => String(input || "").trim().toLowerCase();
  const isDomainValid = (domain: string) => /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/.test(domain);

  // Fallback legível para nome da loja a partir do slug
  const humanizeSlug = (s: string) => String(s || "")
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  // Garantir nome da loja consistente quando não há nome salvo
  useEffect(() => {
    try {
      const savedName = localStorage.getItem("deliverei_company_name");
      if (!savedName && slug && (!storeName || storeName === user?.name)) {
        setStoreName(humanizeSlug(slug));
      }
    } catch {}
  }, [slug, user?.name]);

  // Garantir que a URL pública não exiba localhost em produção
  // (uso centralizado via buildStoreUrl)
  const storeUrl = buildStoreUrl(slug || "minha-marmitaria");

  const saveStoreData = async () => {
    // Validações rápidas antes de salvar
    if (!slug || !slug.trim()) {
      push({ message: "Defina um slug válido antes de salvar.", tone: "warning" });
      return;
    }
    if (addressZip && !/^\d{5}-?\d{3}$/.test(addressZip.trim())) {
      push({ message: "CEP parece inválido. Formato esperado 00000-000.", tone: "warning" });
    }

    // Placeholder: salvar dados localmente por enquanto
    // Futuro: enviar para backend endpoint de atualização de empresa
    localStorage.setItem("deliverei_company_name", storeName || "");
    localStorage.setItem("deliverei_company_phone", (storePhone || "").trim());
    localStorage.setItem("deliverei_responsavel_nome", storeResponsibleName || "");
    localStorage.setItem("deliverei_responsavel_email", storeResponsibleEmail || "");
    localStorage.setItem("deliverei_responsavel_telefone", storeResponsiblePhone || "");
    localStorage.setItem("deliverei_company_address", addressStreet || "");
    localStorage.setItem("deliverei_company_city", addressCity || "");
    localStorage.setItem("deliverei_company_state", addressState || "");
    localStorage.setItem("deliverei_company_zip", addressZip || "");
    if (slug) {
      localStorage.setItem("deliverei_store_slug", slug);
      localStorage.setItem("deliverei_tenant_slug", slug);
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
                 <Input placeholder="Ex: Marmitaria do João" value={storeName} onChange={(e) => setStoreName(e.target.value)} />
               </div>
               <div>
                 <label className="mb-1 block text-sm text-[#4B5563]">WhatsApp de contato</label>
                 <Input placeholder="(11) 99999-9999" value={storePhone} onChange={(e) => setStorePhone(e.target.value)} />
               </div>
               <div>
                 <label className="mb-1 block text-sm text-[#4B5563]">Taxa de entrega padrão</label>
                 <Input placeholder="10,00" type="number" step="0.01" />
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
                   onChange={(e) => {
                     setSlugTouched(true);
                     setSlug(e.target.value.replace(/\s+/g, "-").toLowerCase());
                   }}
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

           <div className="border-t border-[#E5E7EB] pt-6">
             <h2 className="mb-4 text-lg font-semibold text-[#1F2937]">Responsável</h2>
             <div className="grid gap-4 md:grid-cols-3">
               <div>
                 <label className="mb-1 block text-sm text-[#4B5563]">Nome do responsável</label>
                 <Input placeholder="Ex: João da Silva" value={storeResponsibleName} onChange={(e) => setStoreResponsibleName(e.target.value)} />
               </div>
               <div>
                 <label className="mb-1 block text-sm text-[#4B5563]">E-mail do responsável</label>
                 <Input type="email" placeholder="responsavel@exemplo.com" value={storeResponsibleEmail} onChange={(e) => setStoreResponsibleEmail(e.target.value)} />
               </div>
               <div>
                 <label className="mb-1 block text-sm text-[#4B5563]">WhatsApp do responsável</label>
                 <Input placeholder="(11) 99999-9999" value={storeResponsiblePhone} onChange={(e) => setStoreResponsiblePhone(e.target.value)} />
               </div>
             </div>
           </div>

           <div className="border-t border-[#E5E7EB] pt-6">
             <h2 className="mb-4 text-lg font-semibold text-[#1F2937]">Endereço da loja</h2>
             <div className="grid gap-4 md:grid-cols-4">
               <div className="md:col-span-2">
                 <label className="mb-1 block text-sm text-[#4B5563]">Endereço</label>
                 <Input placeholder="Rua Exemplo, 123" value={addressStreet} onChange={(e) => setAddressStreet(e.target.value)} />
               </div>
               <div>
                 <label className="mb-1 block text-sm text-[#4B5563]">Cidade</label>
                 <Input placeholder="São Paulo" value={addressCity} onChange={(e) => setAddressCity(e.target.value)} />
               </div>
               <div>
                 <label className="mb-1 block text-sm text-[#4B5563]">Estado</label>
                 <Input placeholder="SP" value={addressState} onChange={(e) => setAddressState(e.target.value)} />
               </div>
               <div>
                 <label className="mb-1 block text-sm text-[#4B5563]">CEP</label>
                 <Input placeholder="00000-000" value={addressZip} onChange={(e) => setAddressZip(e.target.value)} />
               </div>
             </div>
           </div>

           <div className="flex gap-2">
             <Button onClick={saveStoreData}>Salvar Configurações</Button>
           </div>
         </section>
       )}

      {tab === "vitrine" && (
        <section className="rounded-lg border border-[#E5E7EB] bg-white p-6 shadow-sm space-y-6">
          <div>
            <h2 className="mb-4 text-lg font-semibold text-[#1F2937]">Domínio personalizado</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm text-[#4B5563]">Seu domínio</label>
                <Input placeholder="exemplo.com.br" value={customDomain} onChange={(e) => setCustomDomain(normalizeDomain(e.target.value))} />
                <p className="mt-1 text-xs text-[#6B7280]">Digite um domínio que você possui e aponte DNS conforme instruções.</p>
              </div>
              <div className="flex items-end gap-2">
                <Button
                  onClick={async () => {
                    setLoadingDomain(true);
                    setDomainError(null);
                    try {
                      const res = await domainApi.checkAvailability(customDomain);
                      setDomainAvailable(res.available);
                      if (!res.available) setDomainError("Domínio indisponível");
                      else push({ message: "Domínio disponível!", tone: "success" });
                    } catch {
                      setDomainError("Não foi possível verificar disponibilidade agora.");
                    } finally {
                      setLoadingDomain(false);
                    }
                  }}
                >Verificar disponibilidade</Button>
                <Button
                  variant="secondary"
                  onClick={async () => {
                    if (!customDomain) return;
                    try {
                      const res = await domainApi.save(customDomain, redirectEnabled);
                      setCustomDomain(res.customDomain);
                      if (typeof res.redirectEnabled !== 'undefined') setRedirectEnabled(!!res.redirectEnabled);
                      try {
                        localStorage.setItem('deliverei_custom_domain', res.customDomain);
                        if (typeof res.redirectEnabled !== 'undefined') {
                          localStorage.setItem('deliverei_redirect_enabled', String(!!res.redirectEnabled));
                        }
                      } catch {}
                      push({ message: "Domínio salvo!", tone: "success" });
                    } catch {
                      push({ message: "Falha ao salvar domínio.", tone: "warning" });
                    }
                  }}
                >Salvar domínio</Button>
              </div>
            </div>
            {domainError && <p className="mt-2 text-sm text-red-600">{domainError}</p>}
            {domainAvailable === false && <p className="mt-2 text-sm text-[#6B7280]">Tente outro domínio.</p>}
          </div>

          <div className="border-t border-[#E5E7EB] pt-6">
            <h3 className="mb-2 text-sm font-medium text-[#1F2937]">DNS</h3>
            <div className="flex items-center gap-2">
              <Button
                onClick={async () => {
                  if (!customDomain) return;
                  setDnsLoading(true);
                  try {
                    const res = await domainApi.dnsStatus(customDomain);
                    setDnsResult(res);
                    push({ message: res.ok ? "DNS configurado corretamente" : "DNS ainda não configurado", tone: res.ok ? "success" : "warning" });
                  } catch {
                    push({ message: "Não foi possível checar DNS.", tone: "warning" });
                  } finally {
                    setDnsLoading(false);
                  }
                }}
              >Checar DNS</Button>
              <label className="ml-2 flex items-center gap-2 text-sm">
                <input type="checkbox" checked={redirectEnabled} onChange={(e) => setRedirectEnabled(e.target.checked)} />
                Redirecionar vitrine para o domínio personalizado
              </label>
            </div>
            {dnsLoading && <p className="mt-2 text-sm text-[#6B7280]">Checando DNS...</p>}
            {dnsResult && (
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm text-[#4B5563]">Registros A</label>
                  <Input readOnly value={(dnsResult.records.A || []).join(', ')} />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-[#4B5563]">Registros CNAME</label>
                  <Input readOnly value={(dnsResult.records.CNAME || []).join(', ')} />
                </div>
              </div>
            )}
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
                <label className="mb-1 block text-sm text-[#4B5563]">Estoque mínimo</label>
                <Input
                  type="number"
                  value={marketing.lowStockThreshold}
                  onChange={(e) => setMarketing((m) => ({ ...m, lowStockThreshold: Number(e.target.value) }))}
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm text-[#4B5563]">Mensagem de escassez</label>
                <Input
                  value={marketing.lowStockMessage}
                  onChange={(e) => setMarketing((m) => ({ ...m, lowStockMessage: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={saveMarketing}>Salvar Marketing</Button>
          </div>
        </section>
      )}

      {/* Integrações, Pagamentos, Vitrine, Promoções permanecem iguais */}
    </DashboardShell>
  );
 }
