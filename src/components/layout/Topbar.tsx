import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { LogOut } from "lucide-react";

export function Topbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="sticky top-0 z-40 border-b border-[#E5E7EB] bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 py-3">
        <div className="font-semibold text-[#1F2937]">DELIVEREI</div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-[#4B5563]">
            <span className="font-medium text-[#1F2937]">{user?.name}</span>
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
