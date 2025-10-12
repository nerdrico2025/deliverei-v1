
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardShell } from "../../../components/layout/DashboardShell";
import { StoreSidebar } from "../../../components/layout/StoreSidebar";
import { Button } from "../../../components/common/Button";
import { Input } from "../../../components/common/Input";
import { X } from "lucide-react";
import { useAuth } from "../../../auth/AuthContext";
import { formatCurrency } from "../../../utils/formatters";

type Product = { id: string; title: string; price: number; status: string; empresaId: string };

// Mock data with empresaId for data isolation
const MOCK_PRODUCTS: Product[] = [
  { id: "1", title: "Pizza Margherita", price: 35.9, status: "publicado", empresaId: "pizza-express" },
  { id: "2", title: "Pizza Calabresa", price: 39.9, status: "publicado", empresaId: "pizza-express" },
  { id: "3", title: "Pizza Portuguesa", price: 42.9, status: "publicado", empresaId: "pizza-express" },
  { id: "4", title: "Pizza Quatro Queijos", price: 44.9, status: "rascunho", empresaId: "pizza-express" },
  { id: "5", title: "Refrigerante Coca-Cola 2L", price: 8.9, status: "publicado", empresaId: "pizza-express" },
  { id: "6", title: "Whopper", price: 28.9, status: "publicado", empresaId: "burger-king" },
  { id: "7", title: "Mega Stacker 2.0", price: 32.9, status: "publicado", empresaId: "burger-king" },
  { id: "8", title: "Batata Frita Grande", price: 12.9, status: "publicado", empresaId: "burger-king" },
];

export default function ProductsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [list, setList] = useState<Product[]>([]);

  useEffect(() => {
    // Filter products by empresaId for data isolation
    if (user?.empresaId) {
      const filteredProducts = MOCK_PRODUCTS.filter(p => p.empresaId === user.empresaId);
      setList(filteredProducts);
    } else {
      setList([]);
    }
  }, [user?.empresaId]);

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
            {list.length === 0 ? (
              <tr>
                <td className="p-6 text-center text-[#4B5563]" colSpan={4}>
                  Nenhum produto encontrado para esta empresa.
                </td>
              </tr>
            ) : (
              list.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="p-3">{p.title}</td>
                  <td className="p-3">{formatCurrency(p.price)}</td>
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
              ))
            )}
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
