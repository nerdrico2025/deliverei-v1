import React from "react";
import { LayoutDashboard, Package, ShoppingBag, Users, Settings } from "lucide-react";

export const StoreSidebar: React.FC<{ currentPath?: string }> = ({ currentPath }) => {
  const links = [
    { href: "/admin/store", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/admin/store/products", icon: Package, label: "Produtos" },
    { href: "/admin/store/orders", icon: ShoppingBag, label: "Pedidos" },
    { href: "/admin/store/clients", icon: Users, label: "Clientes" },
    { href: "/admin/store/settings", icon: Settings, label: "Configurações" },
  ];

  return (
    <nav className="p-4">
      <div className="mb-6 flex items-center gap-2 px-3">
        <div className="h-8 w-8 rounded bg-[#D22630]" />
        <span className="font-bold text-[#D22630]">DELIVEREI</span>
      </div>
      {links.map((link) => {
        const Icon = link.icon;
        const active = currentPath === link.href;
        return (
          <a
            key={link.href}
            href={link.href}
            className={`mb-2 flex items-center gap-3 rounded px-3 py-2 transition ${
              active
                ? "bg-[#D22630]/10 text-[#D22630]"
                : "text-[#4B5563] hover:bg-[#D22630]/5"
            }`}
          >
            <Icon size={20} />
            <span>{link.label}</span>
          </a>
        );
      })}
    </nav>
  );
};
