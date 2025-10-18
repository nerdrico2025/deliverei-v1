import React, { useState } from 'react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { ImageUpload } from '../common/ImageUpload';

export interface ProductFormData {
  nome: string;
  descricao: string;
  preco: number;
  imagem: string;
  estoque: number;
  categoria?: string;
  ativo?: boolean;
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
  estoque?: string;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = 'Salvar',
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<ProductFormData>({
    nome: initialData?.nome || '',
    descricao: initialData?.descricao || '',
    preco: initialData?.preco || 0,
    imagem: initialData?.imagem || '',
    estoque: initialData?.estoque || 0,
    categoria: initialData?.categoria || '',
    ativo: initialData?.ativo !== undefined ? initialData.ativo : true,
  });

  const [errors, setErrors] = useState<FormErrors>({});

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    await onSubmit(formData);
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

            {/* Preço e Categoria */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-[#4B5563]">
                  Preço (R$) <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="29.90"
                  value={formData.preco}
                  onChange={(e) =>
                    handleChange('preco', parseFloat(e.target.value || '0'))
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
                  Categoria
                </label>
                <Input
                  placeholder="Ex: Pizzas, Bebidas..."
                  value={formData.categoria}
                  onChange={(e) => handleChange('categoria', e.target.value)}
                  disabled={isLoading}
                />
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

            {/* Produto Ativo */}
            <label className="inline-flex items-center gap-2 text-sm text-[#1F2937]">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-[#E5E7EB] text-[#D22630] focus:ring-2 focus:ring-[#D22630]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                checked={formData.ativo}
                onChange={(e) => handleChange('ativo', e.target.checked)}
                disabled={isLoading}
              />
              Produto ativo (visível para clientes)
            </label>
          </div>
        </section>

        {/* Image Upload */}
        <section className="rounded-lg border border-[#E5E7EB] bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-[#1F2937]">
            Imagem do Produto
          </h2>
          <ImageUpload
            value={formData.imagem}
            onChange={(url) => handleChange('imagem', url)}
            disabled={isLoading}
          />
          <p className="mt-2 text-xs text-[#6B7280]">
            Faça upload de uma foto do produto. Formatos aceitos: JPEG, PNG, WebP,
            GIF (máx. 5MB)
          </p>
        </section>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-[#E5E7EB]">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Salvando...' : submitLabel}
        </Button>
      </div>
    </form>
  );
};
