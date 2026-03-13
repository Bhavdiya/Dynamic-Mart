
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Store } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ProductCard from '../components/ProductCard';
import ShoppingCart from '../components/ShoppingCart';
import PricingDashboard from '../components/PricingDashboard';
import { mockProducts } from '../data/mockProducts';
import { Product, CartItem, PricingFactors } from '../types';
import { DynamicPricingEngine } from '../services/pricingEngine';

const Index = () => {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { toast } = useToast();
  const pricingEngineRef = useRef(DynamicPricingEngine.getInstance());

  const categories = useMemo(
    () => ['all', ...Array.from(new Set(products.map((p) => p.category)))],
    [products]
  );

  const filteredProducts = useMemo(
    () =>
      products.filter((product) => {
        const lowerSearch = searchTerm.toLowerCase();
        const matchesSearch =
          product.name.toLowerCase().includes(lowerSearch) ||
          product.description.toLowerCase().includes(lowerSearch);
        const matchesCategory =
          selectedCategory === 'all' || product.category === selectedCategory;
        return matchesSearch && matchesCategory;
      }),
    [products, searchTerm, selectedCategory]
  );

  const handleAddToCart = (product: Product) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.product.id === product.id);
      if (existingItem) {
        if (existingItem.quantity >= product.stock) {
          toast({
            title: "Stock limit reached",
            description: `Only ${product.stock} items available`,
            variant: "destructive"
          });
          return prev;
        }
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prev, { product, quantity: 1 }];
      }
    });

    // Simulate stock reduction
    setProducts(prev =>
      prev.map(p =>
        p.id === product.id ? { ...p, stock: Math.max(0, p.stock - 1) } : p
      )
    );

    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart`,
    });
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity === 0) {
      handleRemoveItem(productId);
      return;
    }

    setCartItems(prev =>
      prev.map(item =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const handleRemoveItem = (productId: string) => {
    const item = cartItems.find(item => item.product.id === productId);
    if (item) {
      // Restore stock
      setProducts(prev => prev.map(p =>
        p.id === productId ? { ...p, stock: p.stock + item.quantity } : p
      ));
    }

    setCartItems(prev => prev.filter(item => item.product.id !== productId));
    toast({
      title: "Item removed",
      description: "Item has been removed from your cart",
    });
  };

  const handleProductView = (product: Product) => {
    // Simulate user interaction for pricing algorithm
    setProducts(prev =>
      prev.map(p =>
        p.id === product.id ? { ...p, demand: p.demand + 1 } : p
      )
    );
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Add some products to your cart before checking out.",
        variant: "destructive",
      });
      return;
    }

    // Clear the cart to simulate a completed checkout
    setCartItems([]);

    toast({
      title: "Checkout successful",
      description: "Your order has been placed successfully.",
    });
    // In a real app, this is where payment integration would happen
  };

  // Centralized dynamic pricing loop to keep products and analytics in sync
  useEffect(() => {
    const engine = pricingEngineRef.current;

    const interval = setInterval(() => {
      setProducts(prevProducts =>
        prevProducts.map(product => {
          const factors: PricingFactors = {
            stockLevel: product.stock,
            demandLevel: engine.simulateDemand(product),
            userBehavior: 0.5,
            timeOfDay: new Date().getHours(),
            seasonality: 1,
          };

          const oldPrice = product.currentPrice;
          const newPrice = engine.calculateDynamicPrice(product, factors);

          if (Math.abs(newPrice - oldPrice) <= 0.01) {
            return product;
          }

          return {
            ...product,
            currentPrice: newPrice,
            demand: factors.demandLevel,
            priceHistory: [
              ...product.priceHistory,
              {
                timestamp: Date.now(),
                price: newPrice,
                reason: engine.getPriceChangeReason(oldPrice, newPrice, factors),
              },
            ],
          };
        })
      );
    }, 12000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-gray-900">DynamicMart</h1>
            </div>
            <div className="flex items-center space-x-4">
              <ShoppingCart
                items={cartItems}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveItem={handleRemoveItem}
                onCheckout={handleCheckout}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {categories.map(category => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category === 'all' ? 'All' : category}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  onProductView={handleProductView}
                />
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No products found matching your criteria.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics">
            <PricingDashboard products={products} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
