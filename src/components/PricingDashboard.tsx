
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign, Package, Eye } from 'lucide-react';
import { Product } from '../types';

interface PricingDashboardProps {
  products: Product[];
}

const PricingDashboard: React.FC<PricingDashboardProps> = ({ products }) => {
  const totalProducts = products.length;
  const avgPriceIncrease = products.reduce((sum, p) => {
    const increase = ((p.currentPrice - p.basePrice) / p.basePrice) * 100;
    return sum + increase;
  }, 0) / totalProducts;

  const lowStockList = products.filter(p => p.stock <= 10);
  const highDemandList = products.filter(p => p.demand > 60);
  const lowStockProducts = lowStockList.length;
  const highDemandProducts = highDemandList.length;
  const totalViews = products.reduce((sum, p) => sum + p.demand, 0);

  const recentPriceChanges = products
    .filter(p => p.priceHistory.length > 1)
    .map(p => {
      const recent = p.priceHistory[p.priceHistory.length - 1];
      const previous = p.priceHistory[p.priceHistory.length - 2];
      return {
        product: p,
        change: recent.price - previous.price,
        reason: recent.reason
      };
    })
    .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <DollarSign className="w-4 h-4 mr-2" />
              Avg Price Change
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <span className={`text-2xl font-bold ${avgPriceIncrease >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {avgPriceIncrease >= 0 ? '+' : ''}{avgPriceIncrease.toFixed(1)}%
              </span>
              {avgPriceIncrease >= 0 ? 
                <TrendingUp className="w-4 h-4 text-green-500" /> : 
                <TrendingDown className="w-4 h-4 text-red-500" />
              }
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Package className="w-4 h-4 mr-2" />
              Low Stock Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockProducts}</div>
            <p className="text-xs text-gray-600">out of {totalProducts} products</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              High Demand
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{highDemandProducts}</div>
            <p className="text-xs text-gray-600">products trending</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Eye className="w-4 h-4 mr-2" />
              Total Views
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalViews}</div>
            <p className="text-xs text-gray-600">across all products</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Recent Price Changes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPriceChanges.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No recent price changes</p>
              ) : (
                recentPriceChanges.map((change, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{change.product.name}</h4>
                      <p className="text-xs text-gray-600">{change.reason}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={change.change >= 0 ? "destructive" : "secondary"}>
                        {change.change >= 0 ? '+' : ''}${change.change.toFixed(2)}
                      </Badge>
                      {change.change >= 0 ? 
                        <TrendingUp className="w-4 h-4 text-red-500" /> : 
                        <TrendingDown className="w-4 h-4 text-green-500" />
                      }
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Low Stock & High Demand Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Low Stock</h4>
                {lowStockList.length === 0 ? (
                  <p className="text-gray-500 text-xs">No low stock items</p>
                ) : (
                  <ul className="space-y-1">
                    {lowStockList.map((p) => (
                      <li key={p.id} className="flex justify-between">
                        <span className="truncate pr-2">{p.name}</span>
                        <span className="text-xs text-gray-600">{p.stock} left</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <h4 className="font-semibold mb-2">High Demand</h4>
                {highDemandList.length === 0 ? (
                  <p className="text-gray-500 text-xs">No high demand items</p>
                ) : (
                  <ul className="space-y-1">
                    {highDemandList.map((p) => (
                      <li key={p.id} className="flex justify-between">
                        <span className="truncate pr-2">{p.name}</span>
                        <span className="text-xs text-gray-600">{p.demand} views</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PricingDashboard;
