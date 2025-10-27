import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { LogOut } from "lucide-react";
import { StoreTopbarActions } from "./StoreTopbarActions";

export function Topbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const companyName = typeof window !== "undefined" ? localStorage.getItem("deliverei_company_name") : null;
  const slug = typeof window !== "undefined" ? (localStorage.getItem("deliverei_tenant_slug") || localStorage.getItem("deliverei_store_slug")) : null;
  const humanizeSlug = (s?: string | null) => String(s || "")
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  const emailLocalPart = user?.email ? user.email.split("@")[0] : "";
  const looksLikeCompany = (n?: string | null) => {
    const name = String(n || "").trim();
    if (!name) return false;
    const hs = humanizeSlug(slug);
    return (
      (companyName && name.toLowerCase() === companyName.toLowerCase()) ||
      (slug && name.toLowerCase() === String(slug).toLowerCase()) ||
      (!!hs && name.toLowerCase() === hs.toLowerCase())
    );
  };
  const displayName = !looksLikeCompany(user?.name) && user?.name ? user.name : (emailLocalPart || "Administrador");

  return (
    <div className="sticky top-0 z-40 border-b border-[#E5E7EB] bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded bg-[#D22630]" />
          <span className="font-bold text-[#D22630]">DELIVEREI</span>
        </div>

        {user?.role === "empresa" ? <StoreTopbarActions /> : <div />}

        <div className="flex items-center gap-4">
          <div className="text-sm text-[#4B5563]">
            <span className="font-medium text-[#1F2937]">{displayName}</span>
            <span className="mx-2">•</span>
            <span className="capitalize">{user?.role}</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded bg-[#D22630] px-3 py-1.5 text-sm text-white hover:bg-[#B31E27] transition"
            title="Sair"
          >
            <LogOut size={16} />
            <span>Sair</span>
          </button>
        </div>
      </div>
    </div>
  );
}
