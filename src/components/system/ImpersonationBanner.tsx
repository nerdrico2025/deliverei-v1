import React from "react";
import { useAuth } from "../../auth/AuthContext";
import { AlertCircle } from "lucide-react";

export function ImpersonationBanner() {
  const { user, stopImpersonation, isImpersonating } = useAuth();

  if (!isImpersonating || !user) return null;

  return (
    <div className="sticky top-0 z-50 w-full bg-[#FFC107] border-b border-[#E0A806] text-[#1F2937]">
      <div className="mx-auto max-w-7xl flex items-center justify-between px-4 py-2 text-sm">
        <div className="flex items-center gap-2">
          <AlertCircle size={16} />
          <span>
            <strong>Modo Impersonação:</strong> Você está visualizando como{" "}
            <strong>{user.name}</strong> (ID: {user.empresaId})
          </span>
        </div>
        <button
          onClick={stopImpersonation}
          className="rounded bg-[#1F2937] px-3 py-1 text-white hover:bg-[#374151] transition"
        >
          Voltar ao SuperAdmin
        </button>
      </div>
    </div>
  );
}
