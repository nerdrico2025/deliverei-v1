import React from "react";
import { Button } from "../common/Button";

type UpsellProduct = {
  id: string;
  title: string;
  price: number;
  image?: string;
};

const UPSELL_PRODUCTS: UpsellProduct[] = [
  { id: "u1", title: "Refrigerante Lata", price: 4.5, image: "https://images.pexels.com/photos/50593/coca-cola-cold-drink-soft-drink-coke-50593.jpeg?auto=compress&cs=tinysrgb&w=200" },
  { id: "u2", title: "Sobremesa do Dia", price: 7.9, image: "https://images.pexels.com/photos/1126359/pexels-photo-1126359.jpeg?auto=compress&cs=tinysrgb&w=200" },
  { id: "u3", title: "Suco Natural", price: 6.5, image: "https://images.pexels.com/photos/96974/pexels-photo-96974.jpeg?auto=compress&cs=tinysrgb&w=200" },
  { id: "u4", title: "Salada Extra", price: 5.9, image: "https://images.pexels.com/photos/1059905/pexels-photo-1059905.jpeg?auto=compress&cs=tinysrgb&w=200" },
];

export const UpsellStrip: React.FC<{
  lastAddedId?: string;
  cartIds: string[];
  onAdd: (product: { id: string; title: string; price: number }) => void;
  title?: string;
}> = ({ cartIds, onAdd, title = "Adicione também" }) => {
  const available = UPSELL_PRODUCTS.filter((p) => !cartIds.includes(p.id));

  if (available.length === 0) return null;

  const toShow = available.slice(0, 3);

  return (
    <div className="my-4 rounded-md border border-[#FFC107] bg-[#FFF9E6] p-3">
      <h3 className="mb-2 text-sm font-semibold text-[#1F2937]">{title}</h3>
      <div className="space-y-2">
        {toShow.map((p) => (
          <div key={p.id} className="flex items-center gap-3">
            {p.image && (
              <img
                src={p.image}
                alt={p.title}
                className="h-12 w-12 rounded object-cover"
              />
            )}
            <div className="flex-1">
              <div className="text-sm font-medium text-[#1F2937]">{p.title}</div>
              <div className="text-xs text-[#4B5563]">R$ {p.price.toFixed(2)}</div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onAdd({ id: p.id, title: p.title, price: p.price })}
              className="text-xs"
            >
              Adicionar
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
