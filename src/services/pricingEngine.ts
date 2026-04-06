
import { Product, PricingFactors } from '../types';

export class DynamicPricingEngine {
  private static instance: DynamicPricingEngine;

  static getInstance(): DynamicPricingEngine {
    if (!DynamicPricingEngine.instance) {
      DynamicPricingEngine.instance = new DynamicPricingEngine();
    }
    return DynamicPricingEngine.instance;
  }

  calculateDynamicPrice(product: Product, factors: PricingFactors): number {
    let priceMultiplier = 1;

    // Stock-based pricing (scarcity premium)
    // BUG FIX: Check stricter threshold first, then looser one
    if (product.stock <= 0) {
      // Out of stock — no sale, but record pricing
      priceMultiplier += 0.35;
    } else if (product.stock < 5) {
      priceMultiplier += 0.25; // 25% increase for critical stock
    } else if (product.stock < 10) {
      priceMultiplier += 0.12; // 12% increase for low stock
    } else if (product.stock < 20) {
      priceMultiplier += 0.04; // 4% increase for moderate stock
    }

    // Demand-based pricing (demand score 0–100)
    // Weight: each 10 points of demand above 50 adds 3% premium
    const demandPremium = Math.max(0, (factors.demandLevel - 50) / 10) * 0.03;
    priceMultiplier += Math.min(demandPremium, 0.25); // Cap demand premium at 25%

    // Time-based pricing (peak shopping hours)
    const hour = new Date().getHours();
    if (hour >= 18 && hour <= 21) {
      priceMultiplier += 0.05; // 5% peak-hour surcharge (6pm–9pm)
    } else if (hour >= 12 && hour <= 14) {
      priceMultiplier += 0.02; // 2% lunch-hour uptick
    } else if (hour >= 1 && hour <= 6) {
      priceMultiplier -= 0.03; // Slight discount in off-peak night hours
    }

    // User behavior scoring (0.0–1.0)
    if (factors.userBehavior > 0.85) {
      priceMultiplier += 0.08; // High-intent user (added to cart / checkout)
    } else if (factors.userBehavior > 0.65) {
      priceMultiplier += 0.04;
    }

    // Seasonality factor (1.0 = normal, >1 = peak season, <1 = off-season)
    priceMultiplier *= factors.seasonality;

    // Apply limits: price can be 60%–160% of base price
    priceMultiplier = Math.max(0.6, Math.min(1.6, priceMultiplier));

    return Math.round(product.basePrice * priceMultiplier * 100) / 100;
  }

  getPriceChangeReason(oldPrice: number, newPrice: number, factors: PricingFactors): string {
    const pct = ((newPrice - oldPrice) / oldPrice) * 100;
    if (newPrice > oldPrice) {
      if (factors.stockLevel < 5) return `Critical stock (${factors.stockLevel} left) — scarcity premium`;
      if (factors.stockLevel < 10) return `Low stock (${factors.stockLevel} left) — price adjusted`;
      if (factors.demandLevel > 75) return `High demand score (${factors.demandLevel}) — surge pricing`;
      if (factors.userBehavior > 0.85) return `High-intent purchase activity`;
      const h = new Date().getHours();
      if (h >= 18 && h <= 21) return `Peak shopping hours — price adjusted`;
      return `Market adjustment (+${pct.toFixed(1)}%)`;
    } else if (newPrice < oldPrice) {
      if (factors.stockLevel >= 20) return `Stock replenished (${factors.stockLevel} units) — price reduced`;
      if (factors.demandLevel < 40) return `Low demand — competitive pricing`;
      return `Price reduction (${pct.toFixed(1)}%)`;
    }
    return 'Price stable';
  }

  /**
   * Simulates a realistic demand score (0–100) based on product properties.
   * Higher stock pressure → higher perceived demand.
   */
  simulateDemand(product: Product): number {
    const stockPressure = product.stock < 10 ? 1.4 : product.stock < 20 ? 1.15 : 1.0;
    const pricePressure = product.currentPrice < product.basePrice ? 1.25 : 0.9;
    const randomNoise = (Math.random() - 0.5) * 10; // ±5 noise

    const rawDemand = product.demand * stockPressure * pricePressure + randomNoise;

    // Clamp to [0, 100]
    return Math.round(Math.max(0, Math.min(100, rawDemand)));
  }

  /**
   * Simulates realistic stock fluctuation for a product.
   * Returns a stock delta: negative = sold units, positive = restocked units.
   */
  simulateStockFluctuation(product: Product): number {
    const r = Math.random();

    // 20% chance of small restock
    if (r < 0.20) {
      const restock = Math.floor(Math.random() * 8) + 2; // restock 2–9 units
      return restock;
    }

    // 60% chance of organic sales activity (1–3 units sold)
    if (r < 0.80) {
      if (product.stock <= 0) return 0;
      const sold = Math.floor(Math.random() * 3) + 1;
      return -Math.min(sold, product.stock);
    }

    // 20% chance of no change
    return 0;
  }

  /**
   * Returns total inventory value across all products at current price.
   */
  getInventoryValue(products: Product[]): number {
    return products.reduce((sum, p) => sum + p.currentPrice * p.stock, 0);
  }

  /**
   * Returns total potential revenue if all products sold at base price.
   */
  getBaseInventoryValue(products: Product[]): number {
    return products.reduce((sum, p) => sum + p.basePrice * p.stock, 0);
  }
}
