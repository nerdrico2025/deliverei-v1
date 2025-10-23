import React from "react";
import { DashboardShell } from "../../../components/layout/DashboardShell";
import { SuperAdminSidebar } from "../../../components/layout/SuperAdminSidebar";
import { Building2, DollarSign, Ticket, Users } from "lucide-react";

export default function SuperDashboard() {
  const stats = [
    { label: "Empresas ativas", value: "47", icon: Building2, color: "text-[#16A34A]" },
    { label: "MRR", value: "R$ 12.450", icon: DollarSign, color: "text-[#D22630]" },
    { label: "Tickets abertos", value: "8", icon: Ticket, color: "text-[#F59E0B]" },
    { label: "Clientes totais", value: "1.234", icon: Users, color: "text-[#0EA5E9]" },
  ];

  return (
    <DashboardShell sidebar={<SuperAdminSidebar currentPath="/admin/super" />}>
      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-md border border-[#E5E7EB] bg-white p-4">
              <div className="mb-2 flex items-center justify-between">
                <div className="text-sm text-[#4B5563]">{stat.label}</div>
                <Icon className={stat.color} size={20} />
              </div>
              <div className="text-2xl font-bold text-[#1F2937]">{stat.value}</div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="rounded-md border border-[#E5E7EB] bg-white p-4">
          <h3 className="mb-3 font-semibold text-[#1F2937]">Gráfico MRR/Churn</h3>
          <div className="h-48 rounded bg-[#F9FAFB] flex items-center justify-center text-[#4B5563]">
            Gráfico placeholder
          </div>
        </div>
        <div className="rounded-md border border-[#E5E7EB] bg-white p-4">
          <h3 className="mb-3 font-semibold text-[#1F2937]">Últimos tickets</h3>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between border-b border-[#E5E7EB] pb-2">
                <div>
                  <div className="text-sm font-medium text-[#1F2937]">Ticket #{100 + i}</div>
                  <div className="text-xs text-[#4B5563]">Empresa {i}</div>
                </div>
                <div className="text-xs text-[#F59E0B]">Aberto</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
