
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ProductCard from '../components/ProductCard';
import ShoppingCart from '../components/ShoppingCart';
import PricingDashboard from '../components/PricingDashboard';
import { mockProducts } from '../data/mockProducts';
import { Product, CartItem, PricingFactors, StockEvent } from '../types';
import { DynamicPricingEngine } from '../services/pricingEngine';

// How often (ms) the background stock simulation runs
const STOCK_SIMULATION_INTERVAL_MS = 20_000;

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

  // ─────────────────────────────────────────────────────────────────────────
  // Background stock simulation — runs every STOCK_SIMULATION_INTERVAL_MS
  // ─────────────────────────────────────────────────────────────────────────
  const runStockSimulation = useCallback(() => {
    const engine = pricingEngineRef.current;

    setProducts(prev =>
      prev.map(p => {
        const delta = engine.simulateStockFluctuation(p);
        if (delta === 0) return p;

        const newStock = Math.max(0, p.stock + delta);
        const trigger: StockEvent['trigger'] = delta > 0 ? 'restock' : 'simulation';

        const newStockEvent: StockEvent = {
          timestamp: Date.now(),
          delta,
          stockAfter: newStock,
          trigger,
        };

        // Re-calculate price given the new stock level
        const newDemand = engine.simulateDemand({ ...p, stock: newStock });
        const factors: PricingFactors = {
          stockLevel: newStock,
          demandLevel: newDemand,
          userBehavior: 0.5,
          timeOfDay: new Date().getHours(),
          seasonality: 1,
        };

        const oldPrice = p.currentPrice;
        const newPrice = engine.calculateDynamicPrice({ ...p, stock: newStock }, factors);
        const pricedChanged = Math.abs(newPrice - oldPrice) > 0.01;

        return {
          ...p,
          stock: newStock,
          demand: newDemand,
          currentPrice: pricedChanged ? newPrice : oldPrice,
          lastRestocked: delta > 0 ? Date.now() : p.lastRestocked,
          stockHistory: [...p.stockHistory, newStockEvent],
          priceHistory: pricedChanged
            ? [
                ...p.priceHistory,
                {
                  timestamp: Date.now(),
                  price: newPrice,
                  reason: engine.getPriceChangeReason(oldPrice, newPrice, factors),
                },
              ]
            : p.priceHistory,
        };
      })
    );
  }, []);

  useEffect(() => {
    const interval = setInterval(runStockSimulation, STOCK_SIMULATION_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [runStockSimulation]);

  // ─────────────────────────────────────────────────────────────────────────
  // Cart operations
  // ─────────────────────────────────────────────────────────────────────────
  const handleAddToCart = (product: Product) => {
    const engine = pricingEngineRef.current;

    setCartItems(prev => {
      const existingItem = prev.find(item => item.product.id === product.id);
      const currentQtyInCart = existingItem?.quantity ?? 0;

      // Check against remaining available stock
      if (currentQtyInCart >= product.stock) {
        toast({
          title: 'Stock limit reached',
          description: `Only ${product.stock} unit${product.stock !== 1 ? 's' : ''} available`,
          variant: 'destructive',
        });
        return prev;
      }

      if (existingItem) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prev, { product, quantity: 1 }];
      }
    });

    // Reduce stock and recalculate price
    setProducts(prev =>
      prev.map(p => {
        if (p.id !== product.id) return p;

        const updatedStock = Math.max(0, p.stock - 1);
        const factors: PricingFactors = {
          stockLevel: updatedStock,
          demandLevel: engine.simulateDemand({ ...p, stock: updatedStock }),
          userBehavior: 0.85, // high intent — user adding to cart
          timeOfDay: new Date().getHours(),
          seasonality: 1,
        };

        const oldPrice = p.currentPrice;
        const enginePrice = engine.calculateDynamicPrice({ ...p, stock: updatedStock }, factors);
        // Ensure price reflects scarcity — nudge upward at least 1%
        const targetPrice = Math.max(oldPrice * 1.01, enginePrice);
        const newPrice = Math.round(targetPrice * 100) / 100;
        const priceChanged = Math.abs(newPrice - oldPrice) > 0.01;

        const stockEvent: StockEvent = {
          timestamp: Date.now(),
          delta: -1,
          stockAfter: updatedStock,
          trigger: 'purchase',
        };

        return {
          ...p,
          stock: updatedStock,
          demand: factors.demandLevel,
          currentPrice: priceChanged ? newPrice : oldPrice,
          stockHistory: [...p.stockHistory, stockEvent],
          priceHistory: priceChanged
            ? [
                ...p.priceHistory,
                {
                  timestamp: Date.now(),
                  price: newPrice,
                  reason: engine.getPriceChangeReason(oldPrice, newPrice, factors),
                },
              ]
            : p.priceHistory,
        };
      })
    );

    toast({
      title: 'Added to cart',
      description: `${product.name} added. Price may fluctuate with demand.`,
    });
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity === 0) {
      handleRemoveItem(productId);
      return;
    }

    const item = cartItems.find(i => i.product.id === productId);
    if (!item) return;

    // Validate against available stock
    const productInState = products.find(p => p.id === productId);
    if (productInState && quantity > productInState.stock + item.quantity) {
      toast({
        title: 'Insufficient stock',
        description: `Only ${productInState.stock + item.quantity} units available`,
        variant: 'destructive',
      });
      return;
    }

    const quantityDelta = quantity - item.quantity; // + means adding more, - means returning

    // Adjust stock accordingly
    setProducts(prev =>
      prev.map(p => {
        if (p.id !== productId) return p;
        const newStock = Math.max(0, p.stock - quantityDelta);

        const stockEvent: StockEvent = {
          timestamp: Date.now(),
          delta: -quantityDelta,
          stockAfter: newStock,
          trigger: 'purchase',
        };

        return {
          ...p,
          stock: newStock,
          stockHistory: [...p.stockHistory, stockEvent],
        };
      })
    );

    setCartItems(prev =>
      prev.map(i =>
        i.product.id === productId ? { ...i, quantity } : i
      )
    );
  };

  const handleRemoveItem = (productId: string) => {
    const item = cartItems.find(i => i.product.id === productId);
    if (item) {
      // Restore stock when item is removed from cart
      setProducts(prev =>
        prev.map(p => {
          if (p.id !== productId) return p;
          const restoredStock = p.stock + item.quantity;
          const stockEvent: StockEvent = {
            timestamp: Date.now(),
            delta: item.quantity,
            stockAfter: restoredStock,
            trigger: 'manual',
          };
          return {
            ...p,
            stock: restoredStock,
            stockHistory: [...p.stockHistory, stockEvent],
          };
        })
      );
    }

    setCartItems(prev => prev.filter(i => i.product.id !== productId));
    toast({ title: 'Item removed', description: 'Item removed from your cart.' });
  };

  const handleProductView = (product: Product) => {
    // Increment demand score when a user interacts with the product card
    setProducts(prev =>
      prev.map(p =>
        p.id === product.id
          ? { ...p, demand: Math.min(100, p.demand + 1) }
          : p
      )
    );
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast({
        title: 'Cart is empty',
        description: 'Add products before checking out.',
        variant: 'destructive',
      });
      return;
    }

    const engine = pricingEngineRef.current;

    // Reflect higher demand after a confirmed purchase
    setProducts(prevProducts =>
      prevProducts.map(product => {
        const cartItem = cartItems.find(item => item.product.id === product.id);
        if (!cartItem) return product;

        const factors: PricingFactors = {
          stockLevel: product.stock,
          demandLevel: engine.simulateDemand(product),
          userBehavior: 0.95, // highest intent — completed checkout
          timeOfDay: new Date().getHours(),
          seasonality: 1,
        };

        const oldPrice = product.currentPrice;
        const enginePrice = engine.calculateDynamicPrice(product, factors);
        // Stronger upward adjustment post-purchase — at least 2% bump
        const targetPrice = Math.max(oldPrice * 1.02, enginePrice);
        const newPrice = Math.round(targetPrice * 100) / 100;
        const priceChanged = Math.abs(newPrice - oldPrice) > 0.01;

        return {
          ...product,
          currentPrice: priceChanged ? newPrice : oldPrice,
          demand: factors.demandLevel,
          priceHistory: priceChanged
            ? [
                ...product.priceHistory,
                {
                  timestamp: Date.now(),
                  price: newPrice,
                  reason: engine.getPriceChangeReason(oldPrice, newPrice, factors),
                },
              ]
            : product.priceHistory,
        };
      })
    );

    setCartItems([]);
    toast({
      title: '✅ Checkout successful',
      description: 'Your order has been placed. Prices adjusted based on new demand.',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-gray-900">DynamicMart</h1>
              <Badge variant="outline" className="text-xs text-green-600 border-green-300">
                Live Pricing
              </Badge>
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
                    variant={selectedCategory === category ? 'default' : 'outline'}
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
