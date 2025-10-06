import React from "react";
import { ShoppingCart } from "lucide-react";

export const StorefrontHeader: React.FC<{
  logoUrl?: string;
  storeName: string;
  onCartClick: () => void;
  cartCount: number;
}> = ({ logoUrl, storeName, onCartClick, cartCount }) => (
  <header className="sticky top-0 z-30 border-b border-[#E5E7EB] bg-white">
    <div className="mx-auto flex max-w-6xl items-center justify-between p-4">
      <div className="flex items-center gap-2">
        {logoUrl ? (
          <img src={logoUrl} className="h-8 w-8 rounded object-cover" alt={storeName} />
        ) : (
          <div className="h-8 w-8 rounded bg-[#D22630]" />
        )}
        <span className="font-bold text-[#D22630]">{storeName}</span>
      </div>
      <button onClick={onCartClick} className="relative" aria-label="Carrinho">
        <ShoppingCart className="text-[#D22630]" size={24} />
        {cartCount > 0 && (
          <span className="absolute -right-2 -top-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#FFC107] px-1 text-xs text-[#1F2937]">
            {cartCount}
          </span>
        )}
      </button>
    </div>
  </header>
);
