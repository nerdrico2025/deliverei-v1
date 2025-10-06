import React from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, Package, ShoppingBag, Users, Settings } from "lucide-react";

export const StoreSidebar: React.FC = () => {
  const links = [
    { to: "/admin/store", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/admin/store/products", icon: Package, label: "Produtos" },
    { to: "/admin/store/orders", icon: ShoppingBag, label: "Pedidos" },
    { to: "/admin/store/clients", icon: Users, label: "Clientes" },
    { to: "/admin/store/settings", icon: Settings, label: "Configurações" },
  ];

  return (
    <nav className="p-4">
      <div className="mb-6 flex items-center gap-2 px-3">
        <div className="h-8 w-8 rounded bg-[#D22630]" />
        <span className="font-bold text-[#D22630]">DELIVEREI</span>
      </div>
      {links.map((link) => {
        const Icon = link.icon;
        return (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `mb-2 flex items-center gap-3 rounded px-3 py-2 transition ${
                isActive
                  ? "bg-[#D22630]/10 text-[#D22630]"
                  : "text-[#4B5563] hover:bg-[#D22630]/5"
              }`
            }
          >
            <Icon size={20} />
            <span>{link.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};
