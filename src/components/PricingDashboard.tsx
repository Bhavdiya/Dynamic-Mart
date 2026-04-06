
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  BarChart2,
  AlertTriangle,
  RefreshCcw,
  Layers,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';
import { Product } from '../types';
import { DynamicPricingEngine } from '../services/pricingEngine';

interface PricingDashboardProps {
  products: Product[];
}

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

const fmtPct = (n: number) => `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`;

const timeAgo = (timestamp: number): string => {
  const diff = Math.floor((Date.now() - timestamp) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const HIGH_DEMAND_THRESHOLD = 70;
const LOW_STOCK_THRESHOLD = 10;

const PricingDashboard: React.FC<PricingDashboardProps> = ({ products }) => {
  const engine = useMemo(() => DynamicPricingEngine.getInstance(), []);

  const totalProducts = products.length;

  // ── KPI Calculations ────────────────────────────────────────────────────
  const avgPriceChangePct = useMemo(() => {
    const total = products.reduce((sum, p) => {
      return sum + ((p.currentPrice - p.basePrice) / p.basePrice) * 100;
    }, 0);
    return total / totalProducts;
  }, [products, totalProducts]);

  const lowStockItems = useMemo(
    () => products.filter(p => p.stock > 0 && p.stock <= LOW_STOCK_THRESHOLD),
    [products]
  );
  const outOfStockItems = useMemo(() => products.filter(p => p.stock === 0), [products]);
  const highDemandItems = useMemo(
    () => products.filter(p => p.demand >= HIGH_DEMAND_THRESHOLD),
    [products]
  );

  const avgDemandScore = useMemo(() => {
    return Math.round(
      products.reduce((sum, p) => sum + p.demand, 0) / totalProducts
    );
  }, [products, totalProducts]);

  const currentInventoryValue = useMemo(
    () => engine.getInventoryValue(products),
    [engine, products]
  );
  const baseInventoryValue = useMemo(
    () => engine.getBaseInventoryValue(products),
    [engine, products]
  );
  const inventoryValueDelta = currentInventoryValue - baseInventoryValue;
  const inventoryValueDeltaPct = (inventoryValueDelta / baseInventoryValue) * 100;

  const avgStock = useMemo(() => {
    return (
      products.reduce((sum, p) => sum + p.stock, 0) / totalProducts
    ).toFixed(1);
  }, [products, totalProducts]);

  // ── Recent Price Changes (last 5 with actual change amounts) ────────────
  const recentPriceChanges = useMemo(() => {
    return products
      .filter(p => p.priceHistory.length > 1)
      .map(p => {
        const recent = p.priceHistory[p.priceHistory.length - 1];
        const previous = p.priceHistory[p.priceHistory.length - 2];
        return {
          product: p,
          change: recent.price - previous.price,
          changePct: ((recent.price - previous.price) / previous.price) * 100,
          reason: recent.reason,
          timestamp: recent.timestamp,
          currentPrice: recent.price,
          basePrice: p.basePrice,
        };
      })
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 6);
  }, [products]);

  // ── Product summary table (sorted by price deviation) ───────────────────
  const productTableRows = useMemo(() => {
    return [...products]
      .map(p => ({
        ...p,
        pricePct: ((p.currentPrice - p.basePrice) / p.basePrice) * 100,
        totalStockEvents: p.stockHistory.length,
      }))
      .sort((a, b) => Math.abs(b.pricePct) - Math.abs(a.pricePct));
  }, [products]);

  // ── Stock events in last 24h ─────────────────────────────────────────────
  const recentStockEvents = useMemo(() => {
    const cutoff = Date.now() - 86_400_000;
    return products
      .flatMap(p =>
        p.stockHistory
          .filter(e => e.timestamp > cutoff)
          .map(e => ({ product: p, event: e }))
      )
      .sort((a, b) => b.event.timestamp - a.event.timestamp)
      .slice(0, 6);
  }, [products]);

  return (
    <div className="space-y-6">
      {/* ── KPI Cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Avg Price Change */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-gray-500 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5" />
              Avg Price Deviation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <span className={`text-2xl font-bold ${avgPriceChangePct >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                {fmtPct(avgPriceChangePct)}
              </span>
              {avgPriceChangePct >= 0
                ? <TrendingUp className="w-4 h-4 text-emerald-500 mb-1" />
                : <TrendingDown className="w-4 h-4 text-red-500 mb-1" />}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">vs. base price across all SKUs</p>
          </CardContent>
        </Card>

        {/* Inventory Value */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-gray-500 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" />
              Inventory Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{fmt(currentInventoryValue)}</div>
            <p className={`text-xs mt-0.5 ${inventoryValueDelta >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              {inventoryValueDelta >= 0 ? '+' : ''}{fmt(inventoryValueDelta)} vs. base ({fmtPct(inventoryValueDeltaPct)})
            </p>
          </CardContent>
        </Card>

        {/* Stock Alerts */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-gray-500 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-orange-500">{lowStockItems.length}</span>
              <span className="text-sm text-gray-500">low stock</span>
            </div>
            {outOfStockItems.length > 0 && (
              <p className="text-xs text-red-500 mt-0.5">
                {outOfStockItems.length} out of stock
              </p>
            )}
            <p className="text-xs text-gray-500 mt-0.5">
              Avg stock: {avgStock} units/SKU
            </p>
          </CardContent>
        </Card>

        {/* Demand Score */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-gray-500 flex items-center gap-1">
              <BarChart2 className="w-3.5 h-3.5" />
              High Demand SKUs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-violet-600">{highDemandItems.length}</span>
              <span className="text-sm text-gray-500">/ {totalProducts}</span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Score ≥ {HIGH_DEMAND_THRESHOLD} · Avg: {avgDemandScore}/100
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── Mid-row ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Price Changes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-violet-500" />
              Recent Price Changes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentPriceChanges.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-6">
                No price changes recorded yet. Add items to cart or wait for simulation.
              </p>
            ) : (
              <div className="space-y-2">
                {recentPriceChanges.map((change, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 border border-gray-100"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{change.product.name}</p>
                      <p className="text-xs text-gray-500 truncate">{change.reason}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-3 shrink-0">
                      <div className="text-right">
                        <p className="text-xs font-semibold text-gray-700">{fmt(change.currentPrice)}</p>
                        <p className={`text-xs font-medium ${change.change >= 0 ? 'text-orange-500' : 'text-emerald-600'}`}>
                          {change.change >= 0 ? '+' : ''}{fmt(change.change)} ({fmtPct(change.changePct)})
                        </p>
                      </div>
                      {change.change >= 0
                        ? <TrendingUp className="w-3.5 h-3.5 text-orange-500" />
                        : <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />}
                    </div>
                    <span className="text-xs text-gray-400 ml-2 shrink-0">{timeAgo(change.timestamp)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Stock Events */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <RefreshCcw className="w-4 h-4 text-blue-500" />
              Stock Activity (Last 24h)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentStockEvents.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-6">
                No stock movements in the last 24 hours.
              </p>
            ) : (
              <div className="space-y-2">
                {recentStockEvents.map(({ product, event }, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 border border-gray-100"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{product.name}</p>
                      <p className="text-xs text-gray-500 capitalize">
                        {event.trigger} · {event.stockAfter} units remaining
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-3 shrink-0">
                      <Badge
                        variant={event.delta > 0 ? 'secondary' : 'outline'}
                        className={event.delta > 0 ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-red-600 border-red-200'}
                      >
                        {event.delta > 0 ? '+' : ''}{event.delta} units
                      </Badge>
                      <span className="text-xs text-gray-400">{timeAgo(event.timestamp)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Full Product Table ──────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Package className="w-4 h-4 text-gray-600" />
            All Products — Pricing & Stock Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase">Product</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600 text-xs uppercase">Base Price</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600 text-xs uppercase">Current Price</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600 text-xs uppercase">Change</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600 text-xs uppercase">Stock</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600 text-xs uppercase">Demand Score</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600 text-xs uppercase">Category</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {productTableRows.map(row => (
                  <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900 max-w-[180px]">
                      <span className="truncate block">{row.name}</span>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-500">{fmt(row.basePrice)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-800">{fmt(row.currentPrice)}</td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
                          row.pricePct > 0
                            ? 'bg-orange-50 text-orange-600'
                            : row.pricePct < 0
                            ? 'bg-emerald-50 text-emerald-600'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {fmtPct(row.pricePct)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
                          row.stock === 0
                            ? 'bg-red-100 text-red-600'
                            : row.stock <= 5
                            ? 'bg-red-50 text-red-500'
                            : row.stock <= LOW_STOCK_THRESHOLD
                            ? 'bg-orange-50 text-orange-600'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {row.stock === 0 ? 'Out of stock' : `${row.stock} units`}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              row.demand >= HIGH_DEMAND_THRESHOLD ? 'bg-violet-500' : 'bg-blue-400'
                            }`}
                            style={{ width: `${row.demand}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-600 w-6 text-right">{row.demand}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Badge variant="outline" className="text-xs">{row.category}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ── Low Stock & High Demand Detail ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              Low Stock & Out-of-Stock Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lowStockItems.length === 0 && outOfStockItems.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">All products have healthy stock levels.</p>
            ) : (
              <ul className="space-y-2">
                {[...outOfStockItems, ...lowStockItems].map(p => (
                  <li key={p.id} className="flex items-center justify-between text-sm">
                    <span className="truncate pr-2 text-gray-700">{p.name}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
                          p.stock === 0
                            ? 'bg-red-100 text-red-600'
                            : p.stock <= 5
                            ? 'bg-red-50 text-red-500'
                            : 'bg-orange-50 text-orange-600'
                        }`}
                      >
                        {p.stock === 0 ? 'Out of stock' : `${p.stock} left`}
                      </span>
                      <span className="text-xs text-gray-400">{fmt(p.currentPrice)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-violet-500" />
              High Demand Products (Score ≥ {HIGH_DEMAND_THRESHOLD})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {highDemandItems.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">No high-demand products currently.</p>
            ) : (
              <ul className="space-y-2">
                {highDemandItems
                  .sort((a, b) => b.demand - a.demand)
                  .map(p => (
                    <li key={p.id} className="flex items-center justify-between text-sm">
                      <span className="truncate pr-2 text-gray-700">{p.name}</span>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-violet-500 rounded-full"
                            style={{ width: `${p.demand}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-violet-600 w-10 text-right">
                          {p.demand}/100
                        </span>
                        <span className="text-xs text-orange-500 font-medium">{fmt(p.currentPrice)}</span>
                      </div>
                    </li>
                  ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Base Price vs Current Price Bar Chart ───────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-violet-500" />
              Base Price vs. Current Price — All Products
            </CardTitle>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 rounded-sm bg-slate-400" />
                Base Price
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 rounded-sm bg-violet-500" />
                Current Price (higher)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 rounded-sm bg-emerald-500" />
                Current Price (lower)
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <PriceComparisonChart products={products} />
        </CardContent>
      </Card>
    </div>
  );
};

// ── Price Comparison Chart (extracted for clarity) ───────────────────────────
interface TooltipPayload {
  name: string;
  value: number;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) return null;
  const base = payload.find(p => p.name === 'Base Price');
  const current = payload.find(p => p.name === 'Current Price');
  if (!base || !current) return null;
  const delta = current.value - base.value;
  const deltaPct = (delta / base.value) * 100;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-xs min-w-[180px]">
      <p className="font-semibold text-gray-800 mb-2 text-sm">{label}</p>
      <div className="space-y-1">
        <div className="flex justify-between gap-4">
          <span className="text-gray-500">Base Price</span>
          <span className="font-medium text-gray-700">{fmt(base.value)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-500">Current Price</span>
          <span className={`font-semibold ${delta > 0 ? 'text-orange-600' : delta < 0 ? 'text-emerald-600' : 'text-gray-700'}`}>
            {fmt(current.value)}
          </span>
        </div>
        <div className="border-t pt-1 mt-1 flex justify-between gap-4">
          <span className="text-gray-500">Change</span>
          <span className={`font-bold ${delta > 0 ? 'text-orange-600' : delta < 0 ? 'text-emerald-600' : 'text-gray-500'}`}>
            {delta > 0 ? '+' : ''}{fmt(delta)} ({delta >= 0 ? '+' : ''}{deltaPct.toFixed(1)}%)
          </span>
        </div>
      </div>
    </div>
  );
};

const PriceComparisonChart: React.FC<{ products: Product[] }> = ({ products }) => {
  const chartData = useMemo(() =>
    products.map(p => ({
      name: p.name.length > 14 ? p.name.slice(0, 13) + '…' : p.name,
      fullName: p.name,
      basePrice: p.basePrice,
      currentPrice: p.currentPrice,
      isHigher: p.currentPrice > p.basePrice,
    })),
    [products]
  );

  return (
    <ResponsiveContainer width="100%" height={340}>
      <BarChart
        data={chartData}
        margin={{ top: 10, right: 20, left: 10, bottom: 60 }}
        barCategoryGap="28%"
        barGap={4}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: '#6b7280' }}
          tickLine={false}
          axisLine={{ stroke: '#e5e7eb' }}
          angle={-35}
          textAnchor="end"
          interval={0}
          height={60}
        />
        <YAxis
          tickFormatter={(v) => `$${v}`}
          tick={{ fontSize: 11, fill: '#6b7280' }}
          tickLine={false}
          axisLine={false}
          width={60}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(139,92,246,0.05)' }} />
        <Legend
          wrapperStyle={{ display: 'none' }}
        />
        <Bar dataKey="basePrice" name="Base Price" fill="#94a3b8" radius={[4, 4, 0, 0]} maxBarSize={32} />
        <Bar dataKey="currentPrice" name="Current Price" radius={[4, 4, 0, 0]} maxBarSize={32}>
          {chartData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.isHigher ? '#8b5cf6' : entry.currentPrice < entry.basePrice ? '#10b981' : '#94a3b8'}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default PricingDashboard;
