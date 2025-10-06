import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardShell } from "../../../components/layout/DashboardShell";
import { StoreSidebar } from "../../../components/layout/StoreSidebar";
import { Button } from "../../../components/common/Button";
import { Input } from "../../../components/common/Input";
import { X } from "lucide-react";

type Client = {
  id: string;
  nome: string;
  whatsapp: string;
  email?: string;
  status: "ativo" | "inativo";
  ultCompra?: string;
  ltv?: number;
};

export default function ClientsPage() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"" | "ativo" | "inativo">("");
  const [list] = useState<Client[]>([
    { id: "c1", nome: "Maria Silva", whatsapp: "(11) 99999-0000", email: "maria@email.com", status: "ativo", ultCompra: "2025-10-03", ltv: 560 },
    { id: "c2", nome: "João Souza", whatsapp: "(11) 98888-1111", status: "ativo", ltv: 120 },
    { id: "c3", nome: "Ana Costa", whatsapp: "(11) 97777-2222", email: "ana@email.com", status: "inativo", ltv: 89 },
  ]);
  const [modalOpen, setModalOpen] = useState(false);

  const filtered = useMemo(() => {
    return list.filter(
      (c) =>
        (status ? c.status === status : true) &&
        (q ? c.nome.toLowerCase().includes(q.toLowerCase()) || c.whatsapp.includes(q) : true)
    );
  }, [list, q, status]);

  return (
    <DashboardShell sidebar={<StoreSidebar />}>
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h1 className="text-xl font-semibold text-[#1F2937]">Clientes</h1>
        <div className="flex gap-2">
          <Input
            placeholder="Buscar por nome/WhatsApp"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="h-10 rounded-md border border-[#E5E7EB] px-3 focus:border-[#D22630] focus:ring-2 focus:ring-[#D22630]/20 outline-none"
          >
            <option value="">Todos</option>
            <option value="ativo">Ativos</option>
            <option value="inativo">Inativos</option>
          </select>
          <Button variant="secondary">Enviar campanha</Button>
          <Button onClick={() => setModalOpen(true)}>Novo cliente</Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-md border border-[#E5E7EB] bg-white">
        <table className="w-full min-w-[820px]">
          <thead className="bg-[#F9FAFB]">
            <tr>
              <th className="p-3 text-left text-sm text-[#4B5563]">Nome</th>
              <th className="p-3 text-left text-sm text-[#4B5563]">WhatsApp</th>
              <th className="p-3 text-left text-sm text-[#4B5563]">E-mail</th>
              <th className="p-3 text-left text-sm text-[#4B5563]">Status</th>
              <th className="p-3 text-left text-sm text-[#4B5563]">Última compra</th>
              <th className="p-3 text-left text-sm text-[#4B5563]">LTV</th>
              <th className="p-3 text-right text-sm text-[#4B5563]">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="p-3">{c.nome}</td>
                <td className="p-3">{c.whatsapp}</td>
                <td className="p-3">{c.email || "—"}</td>
                <td className="p-3 capitalize">{c.status}</td>
                <td className="p-3">{c.ultCompra || "—"}</td>
                <td className="p-3">{c.ltv ? `R$ ${c.ltv.toFixed(2)}` : "—"}</td>
                <td className="p-3 text-right">
                  <button
                    className="text-[#D22630] hover:underline mr-3"
                    onClick={() => navigate(`/admin/store/clients/${c.id}/edit`)}
                  >
                    Editar
                  </button>
                  <button className="text-[#DC2626] hover:underline">Desativar</button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td className="p-6 text-center text-[#4B5563]" colSpan={7}>
                  Nenhum cliente encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
          <div className="w-full max-w-lg rounded-md border border-[#E5E7EB] bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#1F2937]">Novo Cliente</h2>
              <button onClick={() => setModalOpen(false)} aria-label="Fechar">
                <X size={20} />
              </button>
            </div>
            <div className="grid gap-3">
              <Input placeholder="Nome" />
              <Input placeholder="WhatsApp" />
              <Input placeholder="E-mail (opcional)" type="email" />
              <Input placeholder="CEP" />
              <Input placeholder="Rua" />
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="Número" />
                <Input placeholder="Bairro" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="Cidade" />
                <Input placeholder="UF" />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setModalOpen(false)}>
                Cancelar
              </Button>
              <Button>Salvar</Button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
