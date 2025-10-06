import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardShell } from "../../../components/layout/DashboardShell";
import { StoreSidebar } from "../../../components/layout/StoreSidebar";
import { Button } from "../../../components/common/Button";
import { Input } from "../../../components/common/Input";
import { X } from "lucide-react";

type Product = { id: string; title: string; price: number; status: string };

export default function ProductsPage() {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [list] = useState<Product[]>([
    { id: "1", title: "Marmita Fit", price: 24.9, status: "publicado" },
    { id: "2", title: "Marmita Tradicional", price: 22.5, status: "publicado" },
    { id: "3", title: "Marmita Vegana", price: 26.0, status: "rascunho" },
  ]);

  return (
    <DashboardShell sidebar={<StoreSidebar />}>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-[#1F2937]">Produtos</h1>
        <Button onClick={() => setModalOpen(true)}>Novo Produto</Button>
      </div>
      <div className="overflow-x-auto rounded-md border border-[#E5E7EB] bg-white">
        <table className="w-full min-w-[640px]">
          <thead className="bg-[#F9FAFB]">
            <tr>
              <th className="p-3 text-left text-sm text-[#4B5563]">Título</th>
              <th className="p-3 text-left text-sm text-[#4B5563]">Preço</th>
              <th className="p-3 text-left text-sm text-[#4B5563]">Status</th>
              <th className="p-3 text-right text-sm text-[#4B5563]">Ações</th>
            </tr>
          </thead>
          <tbody>
            {list.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="p-3">{p.title}</td>
                <td className="p-3">R$ {p.price.toFixed(2)}</td>
                <td className="p-3 capitalize">{p.status}</td>
                <td className="p-3 text-right">
                  <button
                    className="text-[#D22630] hover:underline"
                    onClick={() => navigate(`/admin/store/products/${p.id}/edit`)}
                  >
                    Editar
                  </button>
                  <span className="mx-2 text-[#E5E7EB]">|</span>
                  <button className="text-[#DC2626] hover:underline">Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
          <div className="w-full max-w-lg rounded-md border border-[#E5E7EB] bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#1F2937]">Novo Produto</h2>
              <button onClick={() => setModalOpen(false)} aria-label="Fechar">
                <X size={20} />
              </button>
            </div>
            <div className="grid gap-3">
              <Input placeholder="Título" />
              <Input placeholder="Preço" type="number" step="0.01" />
              <Input placeholder="URL da imagem" />
              <textarea
                placeholder="Descrição"
                className="w-full rounded-md border border-[#E5E7EB] bg-white px-3 py-2 text-[#1F2937] placeholder-[#9CA3AF] focus:border-[#D22630] focus:ring-2 focus:ring-[#D22630]/20 outline-none"
                rows={3}
              />
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
