import React, { useState, useEffect } from "react";
import { DashboardShell } from "../../../components/layout/DashboardShell";
import { StoreSidebar } from "../../../components/layout/StoreSidebar";
import { Button } from "../../../components/common/Button";
import { Input } from "../../../components/common/Input";
import { Copy, ExternalLink, Loader2, CheckCircle, AlertCircle, Info } from "lucide-react";
import { useToast } from "../../../ui/feedback/ToastContext";
import { domainApi, storefrontApi, themeApi, pagamentosApi } from "../../../services/backendApi";
import { useAuth } from "../../../auth/AuthContext";
import { resolveTenantSlug, buildStoreUrl } from "../../../services/api.utils";
import { useLocation } from "react-router-dom";
import {
  StorefrontThemeSettings,
  getThemeSettings,
  saveThemeSettings,
  isColorValid,
  normalizeColor,
  isImageTypeAllowed,
  readImageFile,
  preloadImage,
  getSlugForSettings,
} from "../../../utils/themeSettings";

type Tab = "loja" | "pagamentos" | "integracoes" | "vitrine" | "marketing" | "promocoes";

type MarketingSettings = {
  enableLowStock: boolean;
  lowStockThreshold: number;
  lowStockMessage: string;
};

 export default function StoreSettings() {
  const location = useLocation();
  const initialTab = new URLSearchParams(location.search).get("tab") as Tab || "loja";
  const [tab, setTab] = useState<Tab>(initialTab);
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

  // Personalização Visual - estado
  const [themePrimary, setThemePrimary] = useState<string>("#D22630");
  const [themeSecondary, setThemeSecondary] = useState<string>("#FFC107");
  const [themeAccent, setThemeAccent] = useState<string>("");
  const [bgImage, setBgImage] = useState<string | undefined>(undefined);
  const [bgReady, setBgReady] = useState<boolean>(false);
  const [bgUploading, setBgUploading] = useState<boolean>(false);
  const [bgError, setBgError] = useState<string | null>(null);
  const [primaryError, setPrimaryError] = useState<string | null>(null);
  const [secondaryError, setSecondaryError] = useState<string | null>(null);
  const [accentError, setAccentError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved_server' | 'saved_local' | 'error'>('idle');
  const [saveMessage, setSaveMessage] = useState<string>('');
 
   useEffect(() => {
     const saved = localStorage.getItem("deliverei_tenant_slug") ||
     localStorage.getItem("deliverei_store_slug") ||
     resolveTenantSlug() ||
     user?.empresaId ||
     "";
     if (saved) setSlug(saved);
     else setSlug("minha-marmitaria");
  }, []);

  // Carregar configurações de tema da vitrine (local primeiro, depois backend)
  useEffect(() => {
    const s = (slug || getSlugForSettings() || "minha-loja").trim();
    const local = getThemeSettings(s);
    if (local) {
      setThemePrimary(local.primaryColor || "#D22630");
      setThemeSecondary(local.secondaryColor || "#FFC107");
      setThemeAccent(local.accentColor || "");
      setBgImage(local.backgroundImage);
      setBgReady(false);
      if (local.backgroundImage) {
        preloadImage(local.backgroundImage)
          .then(() => setBgReady(true))
          .catch(() => setBgReady(false));
      }
    } else {
      setBgReady(false);
    }
    (async () => {
      try {
        const res = await themeApi.get();
        const settings = res?.settings || null;
        if (settings) {
          setThemePrimary(settings.primaryColor || "#D22630");
          setThemeSecondary(settings.secondaryColor || "#FFC107");
          setThemeAccent(settings.accentColor || "");
          setBgImage(settings.backgroundImage);
          setBgReady(false);
          if (settings?.backgroundImage) {
            preloadImage(settings.backgroundImage)
              .then(() => setBgReady(true))
              .catch(() => setBgReady(false));
          }
        }
      } catch (err) {
        console.warn("Falha ao carregar tema do backend:", err);
      }
    })();
  }, [slug]);

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

  const getEffectiveSlug = () => (slug || getSlugForSettings() || "minha-loja").trim();

  const saveTheme = async (next?: Partial<StorefrontThemeSettings>) => {
    const s = getEffectiveSlug();
    const payload: StorefrontThemeSettings = {
      primaryColor: normalizeColor(themePrimary),
      secondaryColor: normalizeColor(themeSecondary),
      accentColor: themeAccent ? normalizeColor(themeAccent) : undefined,
      backgroundImage: bgImage,
      updatedAt: Date.now(),
      ...(next || {}),
    };
    // Validação obrigatória de cores principais/segundárias
    const pOk = isColorValid(payload.primaryColor);
    const sOk = isColorValid(payload.secondaryColor);
    setPrimaryError(pOk ? null : "Informe uma cor HEX ou RGB válida");
    setSecondaryError(sOk ? null : "Informe uma cor HEX ou RGB válida");
    // Accent é opcional
    if (payload.accentColor) {
      setAccentError(isColorValid(payload.accentColor) ? null : "Informe uma cor válida ou deixe em branco");
    } else {
      setAccentError(null);
    }
    if (!pOk || !sOk) return; // não salvar se inválido
    setSaveStatus('saving');
    setSaveMessage('Salvando alterações...');
    try {
      // Persistir no backend
      const res = await themeApi.update(payload);
      if (res?.sucesso) {
        // Atualizar localStorage e broadcast com resposta autoritativa
        saveThemeSettings(s, res.settings);
        setSaveStatus('saved_server');
        setSaveMessage('Alterações salvas no servidor');
        setTimeout(() => {
          setSaveStatus('idle');
          setSaveMessage('');
        }, 1800);
      } else {
        throw new Error(res?.mensagem || "Falha ao salvar tema");
      }
    } catch (err: any) {
      console.error("Erro ao salvar tema:", err);
      // Ainda assim atualizar local para feedback imediato
      saveThemeSettings(s, payload);
      setSaveStatus('saved_local');
      setSaveMessage('Alterações salvas localmente (servidor indisponível)');
      setTimeout(() => {
        setSaveStatus('idle');
        setSaveMessage('');
      }, 2000);
      push({ message: "Não foi possível persistir no servidor agora. Suas alterações aparecerão localmente.", tone: "warning" });
    }
  };

  const onColorChange = async (which: "primary" | "secondary" | "accent", value: string) => {
    const v = normalizeColor(value);
    if (which === "primary") {
      setThemePrimary(v);
      setPrimaryError(isColorValid(v) ? null : "Informe uma cor HEX ou RGB válida");
    } else if (which === "secondary") {
      setThemeSecondary(v);
      setSecondaryError(isColorValid(v) ? null : "Informe uma cor HEX ou RGB válida");
    } else {
      setThemeAccent(v);
      if (v) setAccentError(isColorValid(v) ? null : "Informe uma cor válida ou deixe em branco");
      else setAccentError(null);
    }
    // Auto-save (com validação)
    await saveTheme();
  };

  const onFileSelected: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    try {
      setBgError(null);
      const file = e.target.files?.[0];
      if (!file) return;
      if (file.size > 5 * 1024 * 1024) {
        setBgError("Arquivo excede 5MB");
        push({ message: "Arquivo excede 5MB", tone: "warning" });
        return;
      }
      if (!isImageTypeAllowed(file)) {
        setBgError("Formato não suportado. Use JPG, PNG ou SVG");
        push({ message: "Formato não suportado. Use JPG, PNG ou SVG", tone: "warning" });
        return;
      }
      setBgUploading(true);
      const dataUrl = await readImageFile(file);
      await preloadImage(dataUrl).then(() => setBgReady(true)).catch(() => setBgReady(false));
      setBgImage(dataUrl);
      await saveTheme({ backgroundImage: dataUrl });
      push({ message: "Imagem aplicada com sucesso!", tone: "success" });
    } catch {
      setBgError("Falha ao carregar imagem");
      push({ message: "Falha ao carregar imagem", tone: "warning" });
    } finally {
      setBgUploading(false);
      // limpar input para permitir re-seleção do mesmo arquivo
      try { e.target.value = ""; } catch {}
    }
  };

  const clearBackground = async () => {
    setBgImage(undefined);
    setBgReady(false);
    await saveTheme({ backgroundImage: undefined });
    push({ message: "Imagem removida", tone: "success" });
  };

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

      {tab === "pagamentos" && (
        <section className="rounded-lg border border-[#E5E7EB] bg-white p-6 shadow-sm space-y-6">
          <div>
            <h2 className="mb-2 text-lg font-semibold text-[#1F2937]">Gateway de Pagamento Asaas</h2>
            <p className="mb-4 text-sm text-[#6B7280]">
              Conecte sua empresa ao Asaas para receber via PIX, boleto e cartão. Consulte a documentação em{" "}
              <a href="https://docs.asaas.com/docs/visao-geral" target="_blank" rel="noreferrer" className="text-[#D22630] underline">
                docs.asaas.com
              </a>.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm text-[#4B5563]">API Key do Asaas</label>
                <Input
                  placeholder="Insira sua API Key (sandbox/produção)"
                  value={localStorage.getItem('deliverei_asaas_token') || ''}
                  onChange={(e) => {
                    try { localStorage.setItem('deliverei_asaas_token', e.target.value.trim()); } catch {}
                  }}
                />
                <p className="mt-1 text-xs text-[#6B7280]">A chave não é enviada ao servidor até você testar a conexão.</p>
              </div>
              <div className="flex items-end gap-2">
                <Button
                  onClick={async () => {
                    const token = localStorage.getItem('deliverei_asaas_token') || '';
                    if (!token) {
                      push({ message: 'Informe a API Key do Asaas.', tone: 'warning' });
                      return;
                    }
                    try {
                      const res = await pagamentosApi.testarAsaas(token);
                      if (res?.ok) {
                        push({ message: 'Conexão com Asaas válida!', tone: 'success' });
                      } else {
                        push({ message: 'Falha ao validar a conexão.', tone: 'warning' });
                      }
                    } catch (err: any) {
                      const msg = err?.response?.data?.message || 'Não foi possível validar a conexão';
                      push({ message: msg, tone: 'warning' });
                    }
                  }}
                >
                  Testar Conexão
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    const token = localStorage.getItem('deliverei_asaas_token') || '';
                    if (!token) {
                      push({ message: 'Informe a API Key antes de salvar.', tone: 'warning' });
                      return;
                    }
                    push({ message: 'API Key armazenada com segurança localmente.', tone: 'success' });
                  }}
                >
                  Salvar
                </Button>
              </div>
            </div>
            <div className="mt-3 text-xs text-[#6B7280]">
              Ambiente atual: Sandbox. Para produção, atualize a base no backend quando necessário.
            </div>
          </div>
        </section>
      )}

      {tab === "vitrine" && (
        <section className="rounded-lg border border-[#E5E7EB] bg-white p-6 shadow-sm space-y-6">
          {/* Bloco de Personalização Visual */}
          <div>
            <h2 className="mb-2 text-lg font-semibold text-[#1F2937]">Personalização Visual da Vitrine</h2>
            <p className="mb-4 text-sm text-[#6B7280]">Ajuste imagem de fundo e cores. Alterações são salvas automaticamente e refletidas em tempo real na vitrine.</p>
            <div className="grid gap-6 md:grid-cols-2">
              {/* Upload de imagem */}
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <label className="block text-sm font-medium text-[#4B5563]">Imagem de fundo</label>
                  <span title="Formatos: JPG, PNG, SVG. Tamanho máximo 5MB." className="text-[#6B7280]"><Info size={14} /></span>
                </div>
                <div className="rounded border border-[#E5E7EB] bg-white p-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/svg+xml"
                      onChange={onFileSelected}
                      title="Selecione uma imagem JPG, PNG ou SVG (até 5MB)"
                    />
                    {bgImage && (
                      <button
                        type="button"
                        onClick={clearBackground}
                        className="rounded border border-[#E5E7EB] px-3 py-2 text-sm hover:bg-[#F9FAFB]"
                        title="Remover imagem de fundo"
                      >Remover</button>
                    )}
                  </div>
                  {bgUploading && (
                    <div className="mt-3 inline-flex items-center gap-2 text-sm text-[#1F2937]">
                      <Loader2 className="h-4 w-4 animate-spin text-[#D22630]" /> Carregando imagem...
                    </div>
                  )}
                  {bgError && (
                    <p className="mt-2 text-sm text-red-600 inline-flex items-center gap-1"><AlertCircle className="h-4 w-4" /> {bgError}</p>
                  )}
                  <p className="mt-2 text-xs text-[#6B7280]">Formatos suportados: JPG, PNG e SVG. Tamanho máximo: 5MB.</p>
                </div>
              </div>

              {/* Pré-visualização */}
              <div>
                <label className="mb-2 block text-sm font-medium text-[#4B5563]">Pré-visualização</label>
                <div className="relative h-44 overflow-hidden rounded border border-[#E5E7EB]">
                  <div
                    className="absolute inset-0"
                    style={
                      bgImage && bgReady
                        ? { backgroundImage: `url(${bgImage})`, backgroundSize: "cover", backgroundPosition: "center" }
                        : { backgroundImage: `linear-gradient(135deg, ${themePrimary} 0%, ${themeSecondary} 100%)` }
                    }
                  />
                  {/* Barra superior (primária) */}
                  <div className="absolute left-2 right-2 top-2 h-6 rounded" style={{ backgroundColor: themePrimary, opacity: 0.9 }} />
                  {/* Controles de vitrine (secundária e destaque) */}
                  <div className="absolute bottom-2 left-2 right-2 flex gap-2">
                    <button className="rounded px-3 py-2 text-[#1F2937] shadow" style={{ backgroundColor: themeSecondary }}>Exemplo de botão</button>
                    <span className="rounded px-2 py-1 text-xs" style={{ backgroundColor: themeAccent || "#E5E7EB", color: "#1F2937" }}>Destaque</span>
                  </div>
                  {/* Upload overlay */}
                  {bgUploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/70">
                      <Loader2 className="h-5 w-5 animate-spin text-[#D22630]" />
                      <span className="ml-2 text-sm text-[#1F2937]">Processando...</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Seletor de cores */}
            <div className="mt-6 grid gap-6 md:grid-cols-3">
              {/* Cor principal */}
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <label className="block text-sm font-medium text-[#4B5563]">Cor principal</label>
                  <span title="Aplicada em cabeçalhos, botões ativos e elementos principais" className="text-[#6B7280]"><Info size={14} /></span>
                </div>
                <div className="flex items-center gap-3">
                  <input type="color" value={/^#/.test(themePrimary) ? themePrimary : "#D22630"} onChange={(e) => onColorChange("primary", e.target.value)} />
                  <Input
                    placeholder="#D22630 ou rgb(210,38,48)"
                    value={themePrimary}
                    onChange={(e) => onColorChange("primary", e.target.value)}
                  />
                </div>
                {primaryError && <p className="mt-1 text-xs text-red-600 inline-flex items-center gap-1"><AlertCircle className="h-4 w-4" /> {primaryError}</p>}
              </div>

              {/* Cor secundária */}
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <label className="block text-sm font-medium text-[#4B5563]">Cor secundária</label>
                  <span title="Aplicada em botões, elementos de suporte e destaques secundários" className="text-[#6B7280]"><Info size={14} /></span>
                </div>
                <div className="flex items-center gap-3">
                  <input type="color" value={/^#/.test(themeSecondary) ? themeSecondary : "#FFC107"} onChange={(e) => onColorChange("secondary", e.target.value)} />
                  <Input
                    placeholder="#FFC107 ou rgb(255,193,7)"
                    value={themeSecondary}
                    onChange={(e) => onColorChange("secondary", e.target.value)}
                  />
                </div>
                {secondaryError && <p className="mt-1 text-xs text-red-600 inline-flex items-center gap-1"><AlertCircle className="h-4 w-4" /> {secondaryError}</p>}
              </div>

              {/* Cor de destaque (opcional) */}
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <label className="block text-sm font-medium text-[#4B5563]">Cor de destaque (opcional)</label>
                  <span title="Aplicada em etiquetas e pílulas de destaque quando definido" className="text-[#6B7280]"><Info size={14} /></span>
                </div>
                <div className="flex items-center gap-3">
                  <input type="color" value={/^#/.test(themeAccent) ? themeAccent : "#E5E7EB"} onChange={(e) => onColorChange("accent", e.target.value)} />
                  <Input
                    placeholder="Ex: #22C55E ou rgb(34,197,94)"
                    value={themeAccent}
                    onChange={(e) => onColorChange("accent", e.target.value)}
                  />
                </div>
                {accentError && <p className="mt-1 text-xs text-red-600 inline-flex items-center gap-1"><AlertCircle className="h-4 w-4" /> {accentError}</p>}
              </div>
            </div>

            {/* Indicadores de salvamento automático */}
            {saveStatus !== 'idle' && (
              <div className="mt-3 inline-flex items-center gap-2 text-sm">
                {saveStatus === 'saving' && (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-[#D22630]" />
                    <span className="text-[#1F2937]">{saveMessage || 'Salvando alterações...'}</span>
                  </>
                )}
                {saveStatus === 'saved_server' && (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-green-600">{saveMessage || 'Alterações salvas no servidor'}</span>
                  </>
                )}
                {saveStatus === 'saved_local' && (
                  <>
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    <span className="text-amber-600">{saveMessage || 'Alterações salvas localmente (servidor indisponível)'}</span>
                  </>
                )}
                {saveStatus === 'error' && (
                  <>
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <span className="text-red-600">Falha ao salvar alterações</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Bloco existente: Domínio personalizado */}
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
