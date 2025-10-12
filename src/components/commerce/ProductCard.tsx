import React from "react";
import { Button } from "../common/Button";
import { Badge } from "../common/Badge";
import { formatCurrency } from "../../utils/formatters";

type Product = {
  id: string;
  title: string;
  price: number;
  image: string;
  lowStock?: boolean;
  outOfStock?: boolean;
};

export const ProductCard: React.FC<{
  product: Product;
  onAdd: (id: string) => void;
}> = ({ product, onAdd }) => (
  <div className="overflow-hidden rounded-md border border-[#E5E7EB] bg-white shadow-sm hover:shadow-md transition-shadow">
    <div className="relative">
      <img src={product.image} alt={product.title} className="h-48 w-full object-cover" />
      <div className="absolute left-2 top-2 space-y-1">
        {product.outOfStock && <Badge tone="muted">ESGOTADO</Badge>}
        {product.lowStock && !product.outOfStock && (
          <Badge tone="warning">ÚLTIMAS UNIDADES</Badge>
        )}
      </div>
    </div>
    <div className="p-3">
      <div className="mb-2 line-clamp-1 font-semibold text-[#1F2937]">{product.title}</div>
      <div className="mb-3 text-lg font-bold text-[#1F2937]">{formatCurrency(product.price)}</div>
      <Button
        variant="primary"
        disabled={product.outOfStock}
        onClick={() => onAdd(product.id)}
        className="w-full"
      >
        Adicionar
      </Button>
    </div>
  </div>
);
