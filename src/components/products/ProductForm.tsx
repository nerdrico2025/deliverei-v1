import React, { useState, useEffect } from 'react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { ImageUpload } from '../common/ImageUpload';
import { resolveTenantSlug } from '../../services/api.utils';
import { storefrontApi } from '../../services/backendApi';
import { Tag as TagIcon, Crown, Sparkles } from 'lucide-react';
import { parseBRNumber } from '../../utils/formatters';

export interface ProductFormData {
  nome: string;
  descricao: string;
  preco: number;
  preco_riscado?: number;
  imagem: string;
  estoque: number;
  categoria?: string;
  ativo?: boolean;
  // Flags de destaque
  promo_tag?: boolean;
  bestseller_tag?: boolean;
  new_tag?: boolean;
}

interface ProductFormProps {
  initialData?: Partial<ProductFormData>;
  onSubmit: (data: ProductFormData) => void | Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
  isLoading?: boolean;
}

interface FormErrors {
  nome?: string;
  preco?: string;
  preco_riscado?: string;
  estoque?: string;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = 'Salvar',
  isLoading = false,
}) => {
  // Helper: parse número com vírgula decimal (pt-BR)
  const parseBRNumber = (input: string): number => {
    const s = String(input || '')
      .replace(/\./g, '')
      .replace(',', '.');
    const n = parseFloat(s);
    return Number.isNaN(n) ? 0 : n;
  };
  
  
  const [formData, setFormData] = useState<ProductFormData>({
    nome: initialData?.nome || '',
    descricao: initialData?.descricao || '',
    preco: initialData?.preco || 0,
    preco_riscado: initialData?.preco_riscado,
    imagem: initialData?.imagem || '',
    estoque: initialData?.estoque || 0,
    categoria: initialData?.categoria || '',
    ativo: initialData?.ativo !== undefined ? initialData.ativo : true,
    promo_tag: initialData?.promo_tag ?? false,
    bestseller_tag: initialData?.bestseller_tag ?? false,
    new_tag: initialData?.new_tag ?? false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [categoryOptions, setCategoryOptions] = useState<string[]>([]);
  const [loadingCategories, setLoadingCategories] = useState<boolean>(false);
  const [addingCategory, setAddingCategory] = useState<boolean>(false);
  const [newCategory, setNewCategory] = useState<string>('');
  const [categoryError, setCategoryError] = useState<string>('');

  useEffect(() => {
    const slug = resolveTenantSlug();
    if (!slug) return;
    setLoadingCategories(true);
    storefrontApi
      .getCategorias(slug)
      .then((cats) => {
        if (Array.isArray(cats)) {
          setCategoryOptions(cats.filter(Boolean));
        }
      })
      .catch(() => {
        // silent fail for suggestions
      })
      .finally(() => setLoadingCategories(false));
  }, []);

  const handleChange = (field: keyof ProductFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome do produto é obrigatório';
    }

    if (formData.preco <= 0) {
      newErrors.preco = 'Preço deve ser maior que zero';
    }

    if (formData.estoque < 0) {
      newErrors.estoque = 'Estoque não pode ser negativo';
    }

    // Validação do preço riscado (opcional e menor que o preço normal)
    if (formData.preco_riscado !== undefined && formData.preco_riscado !== null && formData.preco_riscado !== 0) {
      if (formData.preco_riscado < 0) {
        newErrors.preco_riscado = 'Preço riscado não pode ser negativo';
      } else if (formData.preco_riscado >= formData.preco) {
        newErrors.preco_riscado = 'Preço riscado deve ser menor que o preço normal';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const data: ProductFormData = {
      ...formData,
      categoria: formData.categoria?.trim() ? formData.categoria.trim() : undefined,
    };

    await onSubmit(data);
  };

  const startAddingCategory = () => {
    setAddingCategory(true);
    setNewCategory('');
    setCategoryError('');
  };

  const cancelAddingCategory = () => {
    setAddingCategory(false);
    setNewCategory('');
    setCategoryError('');
  };

  const confirmAddCategory = () => {
    const val = newCategory.trim();
    if (!val) {
      setCategoryError('Informe o nome da categoria');
      return;
    }
    if (!categoryOptions.includes(val)) {
      setCategoryOptions((prev) => [...prev, val]);
    }
    handleChange('categoria', val);
    setAddingCategory(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Product Information */}
        <section className="md:col-span-2 rounded-lg border border-[#E5E7EB] bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-[#1F2937]">
            Informações do Produto
          </h2>
          <div className="grid gap-4">
            {/* Nome do Produto */}
            <div>
              <label className="mb-1 block text-sm font-medium text-[#4B5563]">
                Nome do Produto <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Ex: Pizza Margherita"
                value={formData.nome}
                onChange={(e) => handleChange('nome', e.target.value)}
                disabled={isLoading}
                className={errors.nome ? 'border-red-500' : ''}
              />
              {errors.nome && (
                <p className="mt-1 text-xs text-red-500">{errors.nome}</p>
              )}
            </div>

            {/* Descrição */}
            <div>
              <label className="mb-1 block text-sm font-medium text-[#4B5563]">
                Descrição do Produto
              </label>
              <textarea
                className="min-h-[120px] w-full rounded-md border border-[#E5E7EB] p-3 text-[#1F2937] placeholder-[#9CA3AF] focus:border-[#D22630] focus:ring-2 focus:ring-[#D22630]/20 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Descreva o produto em detalhes..."
                value={formData.descricao}
                onChange={(e) => handleChange('descricao', e.target.value)}
                disabled={isLoading}
              />
            </div>

            {/* Preços e Categoria */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-[#4B5563]">
                  Preço (R$) <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="29,90"
                  value={formData.preco}
                  onChange={(e) =>
                    handleChange('preco', parseBRNumber(e.target.value))
                  }
                  disabled={isLoading}
                  className={errors.preco ? 'border-red-500' : ''}
                />
                {errors.preco && (
                  <p className="mt-1 text-xs text-red-500">{errors.preco}</p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-[#4B5563]">
                  Preço riscado (R$)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="39,90"
                  value={formData.preco_riscado ?? ''}
                  onChange={(e) =>
                    handleChange(
                      'preco_riscado',
                      e.target.value === '' ? undefined : parseBRNumber(e.target.value)
                    )
                  }
                  disabled={isLoading}
                  className={errors.preco_riscado ? 'border-red-500' : ''}
                />
                {errors.preco_riscado && (
                  <p className="mt-1 text-xs text-red-500">{errors.preco_riscado}</p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-[#4B5563]">
                  Categoria
                </label>
                {!addingCategory ? (
                  <>
                    <select
                      value={formData.categoria || ''}
                      onChange={(e) => handleChange('categoria', e.target.value)}
                      disabled={isLoading}
                      className="h-10 w-full rounded-md border border-[#E5E7EB] bg-white px-3 text-[#1F2937] placeholder-[#9CA3AF] focus:border-[#D22630] focus:ring-2 focus:ring-[#D22630]/20 outline-none"
                    >
                      <option value="">Selecione uma categoria...</option>
                      {categoryOptions.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                    {loadingCategories ? (
                      <p className="mt-1 text-xs text-[#6B7280]">Carregando categorias...</p>
                    ) : null}
                    <button
                      type="button"
                      onClick={startAddingCategory}
                      className="mt-2 text-xs text-[#D22630] hover:underline"
                    >
                      + Adicionar categoria
                    </button>
                  </>
                ) : (
                  <div>
                    <Input
                      placeholder="Nova categoria"
                      value={newCategory}
                      onChange={(e) => { setNewCategory(e.target.value); setCategoryError(''); }}
                      disabled={isLoading}
                    />
                    {categoryError && (
                      <p className="mt-1 text-xs text-red-500">{categoryError}</p>
                    )}
                    <div className="mt-2 flex items-center gap-2">
                      <Button type="button" onClick={confirmAddCategory} variant="primary" size="sm">Salvar</Button>
                      <Button type="button" onClick={cancelAddingCategory} variant="ghost" size="sm">Cancelar</Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Estoque */}
            <div>
              <label className="mb-1 block text-sm font-medium text-[#4B5563]">
                Quantidade em Estoque <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                min="0"
                placeholder="100"
                value={formData.estoque}
                onChange={(e) =>
                  handleChange('estoque', parseInt(e.target.value || '0'))
                }
                disabled={isLoading}
                className={errors.estoque ? 'border-red-500' : ''}
              />
              {errors.estoque && (
                <p className="mt-1 text-xs text-red-500">{errors.estoque}</p>
              )}
            </div>

            {/* Imagem */}
            <div>
              <label className="mb-1 block text-sm font-medium text-[#4B5563]">
                Imagem do Produto
              </label>
              <ImageUpload
                value={formData.imagem}
                onChange={(url) => handleChange('imagem', url)}
                disabled={isLoading}
              />
            </div>


          </div>
        </section>

        {/* Secondary Column: Status and Actions */}
        <section className="rounded-lg border border-[#E5E7EB] bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-[#1F2937]">Status e Ações</h2>
          <div className="space-y-4">
            {/* Disponibilidade */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#4B5563]">Disponível para venda</span>
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={!!formData.ativo}
                  onChange={(e) => handleChange('ativo', e.target.checked)}
                  disabled={isLoading}
                />
              </label>
            </div>

            {/* Destaques */}
            <div>
              <span className="text-sm font-medium text-[#4B5563]">Destaques</span>
              <div className="mt-2 grid grid-cols-1 gap-3">
                <label className="inline-flex items-center gap-2 text-sm text-[#1F2937]">
                  <input
                    type="checkbox"
                    checked={!!formData.promo_tag}
                    onChange={(e) => handleChange('promo_tag', e.target.checked)}
                    disabled={isLoading}
                  />
                  <TagIcon className="h-4 w-4 text-[#D22630]" />
                  Promoção
                </label>
                <label className="inline-flex items-center gap-2 text-sm text-[#1F2937]">
                  <input
                    type="checkbox"
                    checked={!!formData.bestseller_tag}
                    onChange={(e) => handleChange('bestseller_tag', e.target.checked)}
                    disabled={isLoading}
                  />
                  <Crown className="h-4 w-4 text-[#6B7280]" />
                  Mais vendido
                </label>
                <label className="inline-flex items-center gap-2 text-sm text-[#1F2937]">
                  <input
                    type="checkbox"
                    checked={!!formData.new_tag}
                    onChange={(e) => handleChange('new_tag', e.target.checked)}
                    disabled={isLoading}
                  />
                  <Sparkles className="h-4 w-4 text-[#10B981]" />
                  Novidade
                </label>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Salvando...' : submitLabel}
              </Button>
            </div>
          </div>
        </section>
      </div>
    </form>
  );
};
