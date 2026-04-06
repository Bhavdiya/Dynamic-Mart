
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

  // Detect price changes to show a brief visual indicator
  useEffect(() => {
    const previousPrice = previousPriceRef.current;
    if (Math.abs(product.currentPrice - previousPrice) > 0.01) {
      setPriceChange(product.currentPrice > previousPrice ? 'up' : 'down');
      previousPriceRef.current = product.currentPrice;

      const timeout = setTimeout(() => setPriceChange('stable'), 2500);
      return () => clearTimeout(timeout);
    }
  }, [product.currentPrice]);

  const handleProductClick = () => {
    onProductView(product);
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: 'Out of Stock', color: 'destructive' as const };
    if (stock <= 5) return { label: 'Critical Stock', color: 'destructive' as const };
    if (stock <= 10) return { label: 'Low Stock', color: 'default' as const };
    return { label: 'In Stock', color: 'secondary' as const };
  };

  const stockStatus = getStockStatus(product.stock);
  const priceIncrease = product.currentPrice > product.basePrice;
  const priceDifference = product.currentPrice - product.basePrice;
  const priceDiffPct = ((product.currentPrice - product.basePrice) / product.basePrice) * 100;

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col">
      <CardContent className="p-6 flex-1" onClick={handleProductClick}>
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
          <h3 className="font-semibold text-lg group-hover:text-blue-600 transition-colors leading-tight">
            {product.name}
          </h3>
          <p className="text-sm text-gray-500 line-clamp-2">{product.description}</p>

          {/* Stock & Demand Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={stockStatus.color}>{stockStatus.label}</Badge>
            {product.stock > 0 && (
              <Badge variant="outline" className="text-xs">
                {product.stock} unit{product.stock !== 1 ? 's' : ''} left
              </Badge>
            )}
            <Badge
              variant="secondary"
              className={`text-xs ${product.demand >= 70 ? 'bg-violet-100 text-violet-700 border-violet-200' : ''}`}
              title="Demand score: 0–100. Higher score = more popular"
            >
              Demand: {product.demand}/100
            </Badge>
          </div>

          {/* Price Block */}
          <div className="flex items-start justify-between pt-1">
            <div className="space-y-0.5">
              {/* Current Price with animation */}
              <div className="flex items-center gap-1.5">
                <span
                  className={`text-2xl font-bold transition-colors duration-500 ${
                    priceChange === 'up'
                      ? 'text-orange-600'
                      : priceChange === 'down'
                      ? 'text-emerald-600'
                      : 'text-gray-900'
                  }`}
                >
                  ${product.currentPrice.toFixed(2)}
                </span>
                {priceChange === 'up' && <TrendingUp className="w-4 h-4 text-orange-500 animate-bounce" />}
                {priceChange === 'down' && <TrendingDown className="w-4 h-4 text-emerald-500 animate-bounce" />}
              </div>

              {/* Base price and delta */}
              {Math.abs(priceDifference) > 0.01 && (
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-gray-400 line-through">${product.basePrice.toFixed(2)}</span>
                  <span className={priceIncrease ? 'text-orange-500 font-medium' : 'text-emerald-600 font-medium'}>
                    {priceIncrease ? '+' : ''}{priceDiffPct.toFixed(1)}% from base
                  </span>
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
          variant={product.stock <= 5 && product.stock > 0 ? 'destructive' : 'default'}
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          {product.stock === 0
            ? 'Out of Stock'
            : product.stock <= 5
            ? `Add to Cart — Only ${product.stock} left!`
            : 'Add to Cart'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
