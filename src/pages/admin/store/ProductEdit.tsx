import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DashboardShell } from "../../../components/layout/DashboardShell";
import { StoreSidebar } from "../../../components/layout/StoreSidebar";
import { Button } from "../../../components/common/Button";
import { Input } from "../../../components/common/Input";
import { useToast } from "../../../ui/feedback/ToastContext";

type Product = {
  id: string;
  nome: string;
  descricao?: string;
  preco: number;
  categoria?: string;
  ativo: boolean;
  imagemUrl?: string;
  estoque?: number;
  sku?: string;
};

export default function ProductEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { push } = useToast();
  const [loading, setLoading] = useState(true);
  const [model, setModel] = useState<Product>({
    id: id || "",
    nome: "",
    descricao: "",
    preco: 0,
    categoria: "",
    ativo: true,
    imagemUrl: "",
    estoque: 0,
    sku: "",
  });

  useEffect(() => {
    setTimeout(() => {
      setModel((m) => ({
        ...m,
        nome: "Marmita Fit Frango",
        descricao: "Frango grelhado com arroz integral e salada.",
        preco: 29.9,
        categoria: "Fitness",
        ativo: true,
        imagemUrl: "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=600",
        estoque: 50,
        sku: "FIT-FRANGO-001",
      }));
      setLoading(false);
    }, 300);
  }, [id]);

  const onChange = (k: keyof Product, v: any) => setModel((m) => ({ ...m, [k]: v }));

  const onSave = async () => {
    push({ message: "Produto salvo com sucesso!", tone: "success" });
    navigate("/admin/store/products", { replace: true });
  };

  if (loading) {
    return (
      <DashboardShell sidebar={<StoreSidebar />}>
        <div className="text-[#4B5563]">Carregando produto...</div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell sidebar={<StoreSidebar />}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-[#111827]">Editar Produto</h1>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => navigate(-1)}>
              Voltar
            </Button>
            <Button onClick={onSave}>Salvar</Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <section className="md:col-span-2 rounded-lg border border-[#E5E7EB] bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-[#1F2937]">Informações do Produto</h2>
            <div className="grid gap-4">
              <div>
                <label className="mb-1 block text-sm text-[#4B5563]">Nome do Produto</label>
                <Input
                  placeholder="Ex: Marmita Fit Frango"
                  value={model.nome}
                  onChange={(e) => onChange("nome", e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-[#4B5563]">Descrição</label>
                <textarea
                  className="min-h-[120px] w-full rounded-md border border-[#E5E7EB] p-3 focus:border-[#D22630] focus:ring-2 focus:ring-[#D22630]/20 outline-none"
                  placeholder="Descreva o produto..."
                  value={model.descricao}
                  onChange={(e) => onChange("descricao", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm text-[#4B5563]">Preço (R$)</label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="29.90"
                    value={model.preco}
                    onChange={(e) => onChange("preco", parseFloat(e.target.value || "0"))}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-[#4B5563]">Categoria</label>
                  <Input
                    placeholder="Ex: Fitness"
                    value={model.categoria}
                    onChange={(e) => onChange("categoria", e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm text-[#4B5563]">SKU</label>
                  <Input
                    placeholder="FIT-FRANGO-001"
                    value={model.sku}
                    onChange={(e) => onChange("sku", e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-[#4B5563]">Estoque</label>
                  <Input
                    type="number"
                    placeholder="50"
                    value={model.estoque}
                    onChange={(e) => onChange("estoque", parseInt(e.target.value || "0"))}
                  />
                </div>
              </div>
              <label className="inline-flex items-center gap-2 text-sm text-[#1F2937]">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-[#E5E7EB] text-[#D22630] focus:ring-2 focus:ring-[#D22630]/20"
                  checked={model.ativo}
                  onChange={(e) => onChange("ativo", e.target.checked)}
                />
                Produto ativo
              </label>
            </div>
          </section>

          <section className="rounded-lg border border-[#E5E7EB] bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-[#1F2937]">Imagem</h2>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm text-[#4B5563]">URL da Imagem</label>
                <Input
                  placeholder="https://..."
                  value={model.imagemUrl}
                  onChange={(e) => onChange("imagemUrl", e.target.value)}
                />
              </div>
              {model.imagemUrl ? (
                <img
                  src={model.imagemUrl}
                  alt="preview"
                  className="mt-2 w-full rounded border border-[#E5E7EB] object-cover"
                />
              ) : (
                <div className="mt-2 h-40 w-full rounded border border-dashed border-[#E5E7EB] grid place-items-center text-sm text-[#9CA3AF]">
                  Pré-visualização
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </DashboardShell>
  );
}
