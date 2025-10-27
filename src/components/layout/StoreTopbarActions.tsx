import React from "react";
import { ExternalLink, Copy } from "lucide-react";
import { useToast } from "../../ui/feedback/ToastContext";
import { resolveTenantSlug, buildStoreUrl } from "../../services/api.utils";

function getStoreSlug() {
  const fromStorage = localStorage.getItem("deliverei_store_slug");
  return (fromStorage || resolveTenantSlug() || "minha-marmitaria").trim();
}

function getStoreUrl() {
  return buildStoreUrl(getStoreSlug());
}

export function StoreTopbarActions() {
  const { push } = useToast();
  const storeUrl = getStoreUrl();

  const copy = async () => {
    await navigator.clipboard.writeText(storeUrl);
    push({ message: "Link da vitrine copiado!", tone: "success" });
  };

  const open = () => window.open(storeUrl, "_blank", "noopener,noreferrer");

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={copy}
        className="flex items-center gap-1.5 rounded border border-[#E5E7EB] px-3 py-1.5 text-sm text-[#4B5563] hover:bg-[#F9FAFB] transition"
        title="Copiar link da vitrine"
      >
        <Copy size={14} />
        <span className="hidden sm:inline">Copiar Link</span>
      </button>
      <button
        onClick={open}
        className="flex items-center gap-1.5 rounded bg-[#D22630] px-3 py-1.5 text-sm text-white hover:bg-[#B31E27] transition"
        title="Abrir vitrine em nova aba"
      >
        <ExternalLink size={14} />
        <span>Ver Vitrine</span>
      </button>
    </div>
  );
}
