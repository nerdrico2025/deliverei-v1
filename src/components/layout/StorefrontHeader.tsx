import React, { useState, useRef, useEffect } from "react";
import { ShoppingCart, User, LogOut, Package, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useClientAuth } from "../../contexts/ClientAuthContext";

export const StorefrontHeader: React.FC<{
  logoUrl?: string;
  storeName: string;
  storeSlug?: string;
  onCartClick: () => void;
  cartCount: number;
}> = ({ logoUrl, storeName, storeSlug, onCartClick, cartCount }) => {
  const navigate = useNavigate();
  const { isAuthenticated, cliente, logout } = useClientAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  const handleLogin = () => {
    navigate(`/loja/${storeSlug}/login`);
  };

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
  };

  const handleMyOrders = () => {
    navigate("/meus-pedidos");
    setMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 border-b border-[#E5E7EB] bg-white shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between p-4">
        {/* Logo and Store Name */}
        <div className="flex items-center gap-2">
          {logoUrl ? (
            <img src={logoUrl} className="h-8 w-8 rounded object-cover" alt={storeName} />
          ) : (
            <div className="h-8 w-8 rounded bg-[#D22630]" />
          )}
          <span className="font-bold text-[#D22630]">{storeName}</span>
        </div>

        {/* Right side: User menu + Cart */}
        <div className="flex items-center gap-3">
          {/* User Menu */}
          {isAuthenticated && cliente ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-[#1F2937] hover:bg-[#F3F4F6] transition-colors"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#D22630] text-white">
                  {cliente.nome.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline">{cliente.nome.split(" ")[0]}</span>
                <ChevronDown size={16} className={`transition-transform ${menuOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Dropdown Menu */}
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-md border border-[#E5E7EB] bg-white shadow-lg">
                  <div className="border-b border-[#E5E7EB] px-4 py-3">
                    <p className="text-sm font-medium text-[#1F2937]">{cliente.nome}</p>
                    <p className="text-xs text-[#6B7280]">{cliente.email}</p>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={handleMyOrders}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[#1F2937] hover:bg-[#F3F4F6] transition-colors"
                    >
                      <Package size={16} />
                      <span>Meus Pedidos</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[#D22630] hover:bg-[#F3F4F6] transition-colors"
                    >
                      <LogOut size={16} />
                      <span>Sair</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={handleLogin}
              className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-[#D22630] hover:bg-[#D22630]/5 border border-[#D22630] transition-colors"
            >
              <User size={18} />
              <span>Entrar</span>
            </button>
          )}

          {/* Cart Button */}
          <button onClick={onCartClick} className="relative" aria-label="Carrinho">
            <ShoppingCart className="text-[#D22630]" size={24} />
            {cartCount > 0 && (
              <span className="absolute -right-2 -top-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#FFC107] px-1 text-xs text-[#1F2937] font-medium">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
