
import React, { useMemo, useState } from "react";
import { DashboardShell } from "../../../components/layout/DashboardShell";
import { SuperAdminSidebar } from "../../../components/layout/SuperAdminSidebar";
import { Button } from "../../../components/common/Button";
import { Input } from "../../../components/common/Input";
import { Badge } from "../../../components/common/Badge";

type Company = {
  id: string;
  nome: string;
  plano: string;
  status: "ativo" | "inativo" | "trial";
  dataCriacao: string;
};

export default function CompaniesPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"" | Company["status"]>("");
  const [list] = useState<Company[]>([
    { id: "1", nome: "Marmita Boa", plano: "Pro", status: "ativo", dataCriacao: "2025-08-15" },
    { id: "2", nome: "Fit Express", plano: "Basic", status: "ativo", dataCriacao: "2025-09-01" },
    { id: "3", nome: "Delivery Top", plano: "Pro", status: "trial", dataCriacao: "2025-10-01" },
    { id: "4", nome: "Sabor da Casa", plano: "Basic", status: "inativo", dataCriacao: "2025-07-10" },
    { id: "5", nome: "Pizza Express", plano: "Pro", status: "ativo", dataCriacao: "2025-10-06" },
    { id: "6", nome: "Burger King", plano: "Pro", status: "ativo", dataCriacao: "2025-10-06" },
  ]);

  const filtered = useMemo(
    () =>
      list.filter(
        (c) =>
          (status ? c.status === status : true) &&
          (q ? c.nome.toLowerCase().includes(q.toLowerCase()) : true)
      ),
    [list, q, status]
  );

  return (
    <DashboardShell sidebar={<SuperAdminSidebar currentPath="/admin/super/companies" />}>
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h1 className="text-xl font-semibold text-[#1F2937]">Empresas</h1>
        <div className="flex gap-2">
          <Input placeholder="Buscar por nome" value={q} onChange={(e) => setQ(e.target.value)} />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="h-10 rounded-md border border-[#E5E7EB] px-3 focus:border-[#D22630] focus:ring-2 focus:ring-[#D22630]/20 outline-none"
          >
            <option value="">Todos</option>
            <option value="ativo">Ativo</option>
            <option value="trial">Trial</option>
            <option value="inativo">Inativo</option>
          </select>
          <Button>Nova Empresa</Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-md border border-[#E5E7EB] bg-white">
        <table className="w-full min-w-[800px]">
          <thead className="bg-[#F9FAFB]">
            <tr>
              <th className="p-3 text-left text-sm text-[#4B5563]">Nome</th>
              <th className="p-3 text-left text-sm text-[#4B5563]">Plano</th>
              <th className="p-3 text-left text-sm text-[#4B5563]">Status</th>
              <th className="p-3 text-left text-sm text-[#4B5563]">Data de criação</th>
              <th className="p-3 text-right text-sm text-[#4B5563]">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="p-3 font-medium text-[#1F2937]">{c.nome}</td>
                <td className="p-3">{c.plano}</td>
                <td className="p-3">
                  <Badge
                    tone={
                      c.status === "ativo"
                        ? "success"
                        : c.status === "trial"
                        ? "warning"
                        : "muted"
                    }
                  >
                    {c.status}
                  </Badge>
                </td>
                <td className="p-3">{c.dataCriacao}</td>
                <td className="p-3 text-right">
                  <button className="text-[#D22630] hover:underline mr-3">Ver detalhes</button>
                  <button className="text-[#DC2626] hover:underline">Desativar</button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td className="p-6 text-center text-[#4B5563]" colSpan={5}>
                  Nenhuma empresa encontrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </DashboardShell>
  );
}
