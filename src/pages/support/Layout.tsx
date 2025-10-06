import React from "react";
import { Outlet, NavLink } from "react-router-dom";
import { Ticket } from "lucide-react";
import { Topbar } from "../../components/layout/Topbar";

export default function SupportLayout() {
  return (
    <div className="flex min-h-screen bg-[#F9FAFB]">
      <aside className="w-64 border-r border-[#E5E7EB] bg-white">
        <div className="p-4">
          <div className="mb-6 flex items-center gap-2">
            <div className="h-8 w-8 rounded bg-[#D22630]" />
            <span className="font-bold text-[#D22630]">DELIVEREI</span>
          </div>
          <div className="mb-4 px-3 text-xs text-[#4B5563] uppercase">Suporte</div>
          <nav className="space-y-1">
            <NavLink
              to="/support/tickets"
              className={({ isActive }) =>
                `flex items-center gap-3 rounded px-3 py-2 transition ${
                  isActive
                    ? "bg-[#D22630] text-white"
                    : "text-[#1F2937] hover:bg-[#D22630]/10"
                }`
              }
            >
              <Ticket size={20} />
              <span>Tickets</span>
            </NavLink>
          </nav>
        </div>
      </aside>
      <div className="flex-1">
        <Topbar />
        <main className="mx-auto max-w-7xl p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
