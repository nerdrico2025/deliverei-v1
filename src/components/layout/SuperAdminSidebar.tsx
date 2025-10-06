import React from "react";
import { LayoutDashboard, Building2, CreditCard, Ticket, Settings } from "lucide-react";

export const SuperAdminSidebar: React.FC<{ currentPath?: string }> = ({ currentPath }) => {
  const links = [
    { href: "/admin/super", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/admin/super/companies", icon: Building2, label: "Empresas" },
    { href: "/admin/super/subscriptions", icon: CreditCard, label: "Assinaturas" },
    { href: "/admin/super/tickets", icon: Ticket, label: "Tickets" },
    { href: "/admin/super/settings", icon: Settings, label: "Configurações" },
  ];

  return (
    <nav className="p-4">
      <div className="mb-6 flex items-center gap-2 px-3">
        <div className="h-8 w-8 rounded bg-[#D22630]" />
        <span className="font-bold text-[#D22630]">DELIVEREI</span>
      </div>
      <div className="mb-4 px-3 text-xs text-[#4B5563] uppercase">Super Admin</div>
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
