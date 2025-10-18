
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardShell } from "../../../components/layout/DashboardShell";
import { StoreSidebar } from "../../../components/layout/StoreSidebar";
import { Button } from "../../../components/common/Button";
import { X, Loader2 } from "lucide-react";
import { useAuth } from "../../../auth/AuthContext";
import { formatCurrency } from "../../../utils/formatters";
import { useToast } from "../../../ui/feedback/ToastContext";
import { ProductForm, ProductFormData } from "../../../components/products/ProductForm";
import { getProducts, createProduct, deleteProduct, Product } from "../../../services/productsApi";

export default function ProductsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { push } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [list, setList] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await getProducts({ ativo: undefined });
      setList(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      push({
        message: 'Erro ao carregar produtos',
        tone: 'error',
      });
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.empresaId) {
      fetchProducts();
    }
  }, [user?.empresaId]);

  const handleCreate = async (data: ProductFormData) => {
    try {
      setSubmitting(true);
      await createProduct({
        nome: data.nome,
        descricao: data.descricao,
        preco: data.preco,
        imagem: data.imagem,
        estoque: data.estoque,
        categoria: data.categoria,
        ativo: data.ativo,
      });

      push({
        message: 'Produto criado com sucesso!',
        tone: 'success',
      });

      setModalOpen(false);
      await fetchProducts();
    } catch (error) {
      console.error('Error creating product:', error);
      push({
        message: 'Erro ao criar produto',
        tone: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) {
      return;
    }

    try {
      await deleteProduct(id);
      push({
        message: 'Produto excluído com sucesso!',
        tone: 'success',
      });
      await fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      push({
        message: 'Erro ao excluir produto',
        tone: 'error',
      });
    }
  };

  return (
    <DashboardShell sidebar={<StoreSidebar />}>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-[#1F2937]">Produtos</h1>
        <Button onClick={() => setModalOpen(true)}>Novo Produto</Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="animate-spin text-[#D22630]" size={32} />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-md border border-[#E5E7EB] bg-white">
          <table className="w-full min-w-[640px]">
            <thead className="bg-[#F9FAFB]">
              <tr>
                <th className="p-3 text-left text-sm text-[#4B5563]">Produto</th>
                <th className="p-3 text-left text-sm text-[#4B5563]">Preço</th>
                <th className="p-3 text-left text-sm text-[#4B5563]">Estoque</th>
                <th className="p-3 text-left text-sm text-[#4B5563]">Status</th>
                <th className="p-3 text-right text-sm text-[#4B5563]">Ações</th>
              </tr>
            </thead>
            <tbody>
              {list.length === 0 ? (
                <tr>
                  <td className="p-6 text-center text-[#4B5563]" colSpan={5}>
                    Nenhum produto encontrado. Crie seu primeiro produto!
                  </td>
                </tr>
              ) : (
                list.map((p) => (
                  <tr key={p.id} className="border-t hover:bg-gray-50">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        {p.imagem && (
                          <img
                            src={p.imagem}
                            alt={p.nome}
                            className="h-10 w-10 rounded object-cover"
                          />
                        )}
                        <div>
                          <div className="font-medium text-[#1F2937]">{p.nome}</div>
                          {p.categoria && (
                            <div className="text-xs text-[#6B7280]">{p.categoria}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-[#1F2937]">
                      {formatCurrency(Number(p.preco))}
                    </td>
                    <td className="p-3 text-[#1F2937]">{p.estoque}</td>
                    <td className="p-3">
                      <span
                        className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                          p.ativo
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {p.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        className="text-[#D22630] hover:underline"
                        onClick={() => navigate(`/admin/store/products/${p.id}/edit`)}
                      >
                        Editar
                      </button>
                      <span className="mx-2 text-[#E5E7EB]">|</span>
                      <button
                        className="text-[#DC2626] hover:underline"
                        onClick={() => handleDelete(p.id)}
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 bg-black/30">
            <div className="w-full max-w-5xl rounded-lg border border-[#E5E7EB] bg-white shadow-xl">
              <div className="border-b border-[#E5E7EB] px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-[#1F2937]">Novo Produto</h2>
                <button
                  onClick={() => !submitting && setModalOpen(false)}
                  aria-label="Fechar"
                  disabled={submitting}
                  className="text-[#6B7280] hover:text-[#1F2937] disabled:opacity-50"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="p-6">
                <ProductForm
                  onSubmit={handleCreate}
                  onCancel={() => setModalOpen(false)}
                  submitLabel="Criar Produto"
                  isLoading={submitting}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
