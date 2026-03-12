
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, TrendingUp, TrendingDown, Package } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onProductView: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, onProductView }) => {
  const [priceChange, setPriceChange] = useState<'up' | 'down' | 'stable'>('stable');
  const previousPriceRef = useRef(product.currentPrice);
  const [imageError, setImageError] = useState(false);

  // Reset image error when product image URL changes
  useEffect(() => {
    setImageError(false);
  }, [product.image]);

  // Detect external price changes to show a short visual indicator
  useEffect(() => {
    const previousPrice = previousPriceRef.current;
    if (Math.abs(product.currentPrice - previousPrice) > 0.01) {
      setPriceChange(product.currentPrice > previousPrice ? 'up' : 'down');
      previousPriceRef.current = product.currentPrice;

      const timeout = setTimeout(() => setPriceChange('stable'), 2000);
      return () => clearTimeout(timeout);
    }
  }, [product.currentPrice]);

  const handleProductClick = () => {
    onProductView(product);
  };

  const getStockStatus = (stock: number) => {
    if (stock <= 5) return { label: 'Limited Stock', color: 'destructive' as const };
    if (stock <= 15) return { label: 'Low Stock', color: 'default' as const };
    return { label: 'In Stock', color: 'secondary' as const };
  };

  const stockStatus = getStockStatus(product.stock);
  const priceIncrease = product.currentPrice > product.basePrice;
  const priceDifference = Math.abs(product.currentPrice - product.basePrice);

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
      <CardContent className="p-6" onClick={handleProductClick}>
        <div className="aspect-square bg-gray-100 rounded-lg mb-4 flex items-center justify-center overflow-hidden group-hover:shadow-md transition-shadow">
          {imageError || !product.image ? (
            <Package className="w-16 h-16 text-gray-400" />
          ) : (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
              onError={() => setImageError(true)}
            />
          )}
        </div>
        
        <div className="space-y-2">
          <h3 className="font-semibold text-lg group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
          
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={stockStatus.color}>{stockStatus.label}</Badge>
            <Badge variant="outline">{product.stock} left</Badge>
            <Badge variant="secondary">{product.demand} views</Badge>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={`text-2xl font-bold transition-colors duration-500 ${
                  priceChange === 'up' ? 'text-red-600' : 
                  priceChange === 'down' ? 'text-green-600' : 
                  'text-gray-900'
                }`}>
                  ${product.currentPrice.toFixed(2)}
                </span>
                {priceChange === 'up' && <TrendingUp className="w-4 h-4 text-red-500" />}
                {priceChange === 'down' && <TrendingDown className="w-4 h-4 text-green-500" />}
              </div>
              
              {priceDifference > 0.01 && (
                <div className="text-sm">
                  {priceIncrease ? (
                    <span className="text-red-600">+${priceDifference.toFixed(2)} from base</span>
                  ) : (
                    <span className="text-green-600">-${priceDifference.toFixed(2)} from base</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-6 pt-0">
        <Button 
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart(product);
          }}
          className="w-full"
          disabled={product.stock === 0}
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
