import { Button } from '../common/Button';

interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
  description?: string;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export const ProductCard = ({ product, onAddToCart }: ProductCardProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="h-48 w-full object-cover object-center"
          />
        ) : (
          <div className="h-48 w-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">Sem imagem</span>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-2">{product.name}</h3>
        
        {product.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
        )}
        
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-gray-900">
            {formatPrice(product.price)}
          </span>
          
          <Button
            onClick={() => onAddToCart(product)}
            variant="primary"
            size="sm"
          >
            Adicionar
          </Button>
        </div>
      </div>
    </div>
  );
};