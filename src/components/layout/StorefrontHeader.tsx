import React, { useState, useRef, useEffect } from 'react';
import { ShoppingCart, Search, Menu, ChevronDown, Package, LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface StorefrontHeaderProps {
  cartItemsCount?: number;
  onCartClick?: () => void;
  onSearchClick?: () => void;
  onMenuClick?: () => void;
  storeName?: string;
  logoUrl?: string;
  isAuthenticated?: boolean;
  cliente?: {
    nome: string;
    email: string;
  };
  storeSlug?: string;
}

export const StorefrontHeader = ({
  cartItemsCount = 0,
  onCartClick,
  onSearchClick,
  onMenuClick,
  storeName = "Deliverei",
  logoUrl,
  isAuthenticated = false,
  cliente,
  storeSlug = "loja"
}: StorefrontHeaderProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogin = () => {
    navigate(`/loja/${storeSlug}/login`, { state: { from: `/loja/${storeSlug}` } });
  };

  const handleLogout = () => {
    console.log('Logout');
    setMenuOpen(false);
  };

  const handleMyOrders = () => {
    console.log('Navigate to /meus-pedidos');
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

        {/* Search Bar - Desktop */}
        <div className="hidden md:flex flex-1 max-w-lg mx-8">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Buscar produtos..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onClick={onSearchClick}
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        {/* Right side: User menu + Cart */}
        <div className="flex items-center gap-3">
          {/* Search Button - Mobile */}
          <button
            onClick={onSearchClick}
            className="p-2 text-gray-600 hover:text-gray-900 transition-colors md:hidden"
          >
            <Search className="h-6 w-6" />
          </button>

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
            {cartItemsCount > 0 && (
              <span className="absolute -right-2 -top-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#FFC107] px-1 text-xs text-[#1F2937] font-medium">
                {cartItemsCount}
              </span>
            )}
          </button>

          {/* Menu Button - Mobile */}
          <button
            onClick={onMenuClick}
            className="p-2 text-gray-600 hover:text-gray-900 transition-colors md:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>
    </header>
  );
};