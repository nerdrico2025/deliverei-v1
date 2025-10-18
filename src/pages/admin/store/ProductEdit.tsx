import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DashboardShell } from "../../../components/layout/DashboardShell";
import { StoreSidebar } from "../../../components/layout/StoreSidebar";
import { Button } from "../../../components/common/Button";
import { useToast } from "../../../ui/feedback/ToastContext";
import { ProductForm, ProductFormData } from "../../../components/products/ProductForm";
import { getProduct, updateProduct, Product } from "../../../services/productsApi";
import { Loader2 } from "lucide-react";

export default function ProductEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { push } = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        push({ message: "ID do produto não fornecido", tone: "error" });
        navigate("/admin/store/products");
        return;
      }

      try {
        setLoading(true);
        const data = await getProduct(id);
        setProduct(data);
      } catch (error) {
        console.error("Error fetching product:", error);
        push({
          message: "Erro ao carregar produto",
          tone: "error",
        });
        navigate("/admin/store/products");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleUpdate = async (data: ProductFormData) => {
    if (!id) return;

    try {
      setSubmitting(true);
      await updateProduct(id, {
        nome: data.nome,
        descricao: data.descricao,
        preco: data.preco,
        imagem: data.imagem,
        estoque: data.estoque,
        categoria: data.categoria,
        ativo: data.ativo,
      });

      push({
        message: "Produto atualizado com sucesso!",
        tone: "success",
      });

      navigate("/admin/store/products");
    } catch (error) {
      console.error("Error updating product:", error);
      push({
        message: "Erro ao atualizar produto",
        tone: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardShell sidebar={<StoreSidebar />}>
        <div className="flex items-center justify-center p-12">
          <Loader2 className="animate-spin text-[#D22630]" size={32} />
        </div>
      </DashboardShell>
    );
  }

  if (!product) {
    return (
      <DashboardShell sidebar={<StoreSidebar />}>
        <div className="text-center p-12">
          <p className="text-[#4B5563]">Produto não encontrado</p>
          <Button onClick={() => navigate("/admin/store/products")} className="mt-4">
            Voltar para produtos
          </Button>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell sidebar={<StoreSidebar />}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-[#111827]">Editar Produto</h1>
          <Button variant="ghost" onClick={() => navigate("/admin/store/products")}>
            Voltar
          </Button>
        </div>

        <ProductForm
          initialData={{
            nome: product.nome,
            descricao: product.descricao || "",
            preco: Number(product.preco),
            imagem: product.imagem || "",
            estoque: product.estoque,
            categoria: product.categoria || "",
            ativo: product.ativo,
          }}
          onSubmit={handleUpdate}
          onCancel={() => navigate("/admin/store/products")}
          submitLabel="Atualizar Produto"
          isLoading={submitting}
        />
      </div>
    </DashboardShell>
  );
}
