
export interface Product {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  currentPrice: number;
  stock: number;
  category: string;
  image: string;
  /** Demand score 0–100: higher = more popular */
  demand: number;
  priceHistory: PricePoint[];
  stockHistory: StockEvent[];
  tags: string[];
  lastRestocked?: number; // timestamp of last restock
}

export interface PricePoint {
  timestamp: number;
  price: number;
  reason: string;
}

export interface StockEvent {
  timestamp: number;
  delta: number;        // positive = restock, negative = sold/consumed
  stockAfter: number;
  trigger: 'restock' | 'purchase' | 'simulation' | 'manual';
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  purchaseHistory: Purchase[];
  behaviorScore: number;
}

export interface Purchase {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  timestamp: number;
}

export interface PricingFactors {
  stockLevel: number;
  demandLevel: number;
  userBehavior: number;
  timeOfDay: number;
  seasonality: number;
}
