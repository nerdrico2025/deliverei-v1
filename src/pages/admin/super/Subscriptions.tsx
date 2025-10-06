import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardShell } from "../../../components/layout/DashboardShell";
import { SuperAdminSidebar } from "../../../components/layout/SuperAdminSidebar";
import { Button } from "../../../components/common/Button";
import { Input } from "../../../components/common/Input";
import { Badge } from "../../../components/common/Badge";
import { useAuth } from "../../../auth/AuthContext";
import { useToast } from "../../../ui/feedback/ToastContext";

type Sub = {
  id: string;
  empresa: string;
  plano: string;
  status: "ativo" | "inativo" | "atrasado" | "cancelado";
  proxCobranca?: string;
};

export default function SubscriptionsPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"" | Sub["status"]>("");
  const [list] = useState<Sub[]>([
    { id: "s1", empresa: "Marmita Boa", plano: "Pro", status: "ativo", proxCobranca: "2025-11-05" },
    { id: "s2", empresa: "Fit Express", plano: "Basic", status: "atrasado", proxCobranca: "2025-10-01" },
    { id: "s3", empresa: "Delivery Top", plano: "Pro", status: "ativo", proxCobranca: "2025-11-01" },
    { id: "s4", empresa: "Sabor da Casa", plano: "Basic", status: "cancelado" },
  ]);

  const { impersonate } = useAuth();
  const { push } = useToast();
  const navigate = useNavigate();

  const handleImpersonate = (sub: Sub) => {
    impersonate(sub.id, sub.empresa);
    push({ message: `Entrando como ${sub.empresa}...`, tone: "info" });
    navigate("/admin/store", { replace: true });
  };

  const filtered = useMemo(
    () =>
      list.filter(
        (s) =>
          (status ? s.status === status : true) &&
          (q ? s.empresa.toLowerCase().includes(q.toLowerCase()) : true)
      ),
    [list, q, status]
  );

  return (
    <DashboardShell sidebar={<SuperAdminSidebar />}>
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h1 className="text-xl font-semibold text-[#1F2937]">Assinaturas</h1>
        <div className="flex gap-2">
          <Input
            placeholder="Buscar por empresa"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="h-10 rounded-md border border-[#E5E7EB] px-3 focus:border-[#D22630] focus:ring-2 focus:ring-[#D22630]/20 outline-none"
          >
            <option value="">Todos</option>
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
            <option value="atrasado">Atrasado</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto rounded-md border border-[#E5E7EB] bg-white">
        <table className="w-full min-w-[800px]">
          <thead className="bg-[#F9FAFB]">
            <tr>
              <th className="p-3 text-left text-sm text-[#4B5563]">Empresa</th>
              <th className="p-3 text-left text-sm text-[#4B5563]">Plano</th>
              <th className="p-3 text-left text-sm text-[#4B5563]">Status</th>
              <th className="p-3 text-left text-sm text-[#4B5563]">Próxima cobrança</th>
              <th className="p-3 text-right text-sm text-[#4B5563]">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.id} className="border-t">
                <td className="p-3">{s.empresa}</td>
                <td className="p-3">{s.plano}</td>
                <td className="p-3">
                  <Badge
                    tone={
                      s.status === "ativo"
                        ? "success"
                        : s.status === "atrasado"
                        ? "warning"
                        : "muted"
                    }
                  >
                    {s.status}
                  </Badge>
                </td>
                <td className="p-3">{s.proxCobranca || "—"}</td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => handleImpersonate(s)}
                    className="text-[#0EA5E9] hover:underline mr-3"
                  >
                    Entrar como empresa
                  </button>
                  <button className="text-[#D22630] hover:underline mr-3">Alterar plano</button>
                  <button className="text-[#DC2626] hover:underline">Cancelar</button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td className="p-6 text-center text-[#4B5563]" colSpan={5}>
                  Nenhuma assinatura.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </DashboardShell>
  );
}
