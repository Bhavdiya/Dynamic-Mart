
import { Product } from '../types';

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Premium Wireless Headphones',
    description: 'High-quality noise-canceling wireless headphones with premium sound',
    basePrice: 299.99,
    currentPrice: 299.99,
    stock: 14,
    category: 'Electronics',
    image: '/images/headphones.jpg',
    demand: 45,
    priceHistory: [
      { timestamp: Date.now() - 86400000 * 2, price: 289.99, reason: 'Launch price' },
      { timestamp: Date.now() - 86400000, price: 299.99, reason: 'Initial price' }
    ],
    stockHistory: [
      { timestamp: Date.now() - 86400000, delta: 15, stockAfter: 15, trigger: 'restock' }
    ],
    tags: ['wireless', 'premium', 'audio']
  },
  {
    id: '2',
    name: 'Smart Fitness Watch',
    description: 'Advanced fitness tracking with heart rate monitoring and GPS',
    basePrice: 199.99,
    currentPrice: 199.99,
    stock: 7,
    category: 'Fitness',
    image: '/images/fitness-watch.jpg',
    demand: 78,
    priceHistory: [
      { timestamp: Date.now() - 86400000 * 3, price: 189.99, reason: 'Launch price' },
      { timestamp: Date.now() - 86400000, price: 199.99, reason: 'Initial price' }
    ],
    stockHistory: [
      { timestamp: Date.now() - 86400000 * 2, delta: 10, stockAfter: 10, trigger: 'restock' },
      { timestamp: Date.now() - 86400000, delta: -3, stockAfter: 7, trigger: 'purchase' }
    ],
    tags: ['fitness', 'smart', 'health']
  },
  {
    id: '3',
    name: 'Ergonomic Office Chair',
    description: 'Professional ergonomic chair with lumbar support and adjustable height',
    basePrice: 449.99,
    currentPrice: 449.99,
    stock: 24,
    category: 'Furniture',
    image: '/images/office-chair.jpg',
    demand: 32,
    priceHistory: [
      { timestamp: Date.now() - 86400000, price: 449.99, reason: 'Initial price' }
    ],
    stockHistory: [
      { timestamp: Date.now() - 86400000, delta: 25, stockAfter: 25, trigger: 'restock' }
    ],
    tags: ['office', 'ergonomic', 'furniture']
  },
  {
    id: '4',
    name: 'Portable Bluetooth Speaker',
    description: 'Compact waterproof speaker with 12-hour battery life',
    basePrice: 79.99,
    currentPrice: 79.99,
    stock: 3,
    category: 'Electronics',
    image: '/images/bluetooth-speaker.jpg',
    demand: 92,
    priceHistory: [
      { timestamp: Date.now() - 86400000 * 4, price: 74.99, reason: 'Launch price' },
      { timestamp: Date.now() - 86400000 * 2, price: 79.99, reason: 'Low stock — price increased' },
      { timestamp: Date.now() - 86400000, price: 84.99, reason: 'Critical stock — scarcity premium' }
    ],
    stockHistory: [
      { timestamp: Date.now() - 86400000 * 2, delta: -4, stockAfter: 4, trigger: 'simulation' },
      { timestamp: Date.now() - 86400000, delta: -1, stockAfter: 3, trigger: 'simulation' }
    ],
    tags: ['portable', 'waterproof', 'audio']
  },
  {
    id: '5',
    name: 'Premium Coffee Maker',
    description: 'Programmable coffee maker with built-in grinder and thermal carafe',
    basePrice: 189.99,
    currentPrice: 189.99,
    stock: 18,
    category: 'Kitchen',
    image: '/images/coffee-maker.jpg',
    demand: 56,
    priceHistory: [
      { timestamp: Date.now() - 86400000, price: 189.99, reason: 'Initial price' }
    ],
    stockHistory: [
      { timestamp: Date.now() - 86400000, delta: 18, stockAfter: 18, trigger: 'restock' }
    ],
    tags: ['coffee', 'kitchen', 'appliance']
  },
  {
    id: '6',
    name: 'Gaming Mechanical Keyboard',
    description: 'RGB backlit mechanical keyboard with tactile switches',
    basePrice: 129.99,
    currentPrice: 129.99,
    stock: 22,
    category: 'Gaming',
    image: '/images/gaming-keyboard.jpg',
    demand: 67,
    priceHistory: [
      { timestamp: Date.now() - 86400000, price: 129.99, reason: 'Initial price' }
    ],
    stockHistory: [
      { timestamp: Date.now() - 86400000, delta: 22, stockAfter: 22, trigger: 'restock' }
    ],
    tags: ['gaming', 'mechanical', 'rgb']
  },
  {
    id: '7',
    name: '4K Ultra HD Smart TV',
    description: '55-inch 4K UHD Smart TV with HDR and built-in streaming apps',
    basePrice: 599.99,
    currentPrice: 599.99,
    stock: 9,
    category: 'Electronics',
    image: '/images/4K-tv.jpg',
    demand: 84,
    priceHistory: [
      { timestamp: Date.now() - 86400000 * 2, price: 579.99, reason: 'Launch price' },
      { timestamp: Date.now() - 86400000, price: 599.99, reason: 'Low stock — price adjusted' }
    ],
    stockHistory: [
      { timestamp: Date.now() - 86400000 * 2, delta: 12, stockAfter: 12, trigger: 'restock' },
      { timestamp: Date.now() - 86400000, delta: -3, stockAfter: 9, trigger: 'purchase' }
    ],
    tags: ['tv', '4k', 'smart']
  },
  {
    id: '8',
    name: 'Noise-Canceling Earbuds',
    description: 'Truly wireless earbuds with active noise cancellation and long battery life',
    basePrice: 149.99,
    currentPrice: 149.99,
    stock: 31,
    category: 'Electronics',
    image: '/images/earbuds.jpg',
    demand: 58,
    priceHistory: [
      { timestamp: Date.now() - 86400000, price: 149.99, reason: 'Initial price' }
    ],
    stockHistory: [
      { timestamp: Date.now() - 86400000, delta: 31, stockAfter: 31, trigger: 'restock' }
    ],
    tags: ['audio', 'wireless', 'earbuds']
  },
  {
    id: '9',
    name: 'Standing Desk Converter',
    description: 'Adjustable standing desk converter for existing office desks',
    basePrice: 229.99,
    currentPrice: 229.99,
    stock: 4,
    category: 'Furniture',
    image: '/images/standing-desk-converter.jpg',
    demand: 71,
    priceHistory: [
      { timestamp: Date.now() - 86400000 * 3, price: 219.99, reason: 'Launch price' },
      { timestamp: Date.now() - 86400000, price: 229.99, reason: 'Low stock — price increased' }
    ],
    stockHistory: [
      { timestamp: Date.now() - 86400000 * 2, delta: 8, stockAfter: 8, trigger: 'restock' },
      { timestamp: Date.now() - 86400000, delta: -4, stockAfter: 4, trigger: 'simulation' }
    ],
    tags: ['office', 'health', 'desk']
  },
  {
    id: '10',
    name: 'Stainless Steel Cookware Set',
    description: '10-piece stainless steel cookware set with glass lids',
    basePrice: 159.99,
    currentPrice: 159.99,
    stock: 20,
    category: 'Kitchen',
    image: '/images/cookware-set.jpg',
    demand: 63,
    priceHistory: [
      { timestamp: Date.now() - 86400000, price: 159.99, reason: 'Initial price' }
    ],
    stockHistory: [
      { timestamp: Date.now() - 86400000, delta: 20, stockAfter: 20, trigger: 'restock' }
    ],
    tags: ['kitchen', 'cookware', 'home']
  },
  {
    id: '11',
    name: 'Yoga Mat with Alignment Lines',
    description: 'Non-slip yoga mat with body alignment guides and carrying strap',
    basePrice: 39.99,
    currentPrice: 39.99,
    stock: 42,
    category: 'Fitness',
    image: '/images/yoga-mat.jpg',
    demand: 52,
    priceHistory: [
      { timestamp: Date.now() - 86400000, price: 39.99, reason: 'Initial price' }
    ],
    stockHistory: [
      { timestamp: Date.now() - 86400000, delta: 42, stockAfter: 42, trigger: 'restock' }
    ],
    tags: ['fitness', 'yoga', 'wellness']
  },
  {
    id: '12',
    name: 'RGB Gaming Mouse',
    description: 'High-precision gaming mouse with customizable RGB lighting',
    basePrice: 59.99,
    currentPrice: 59.99,
    stock: 37,
    category: 'Gaming',
    image: '/images/gaming-mouse.jpg',
    demand: 74,
    priceHistory: [
      { timestamp: Date.now() - 86400000, price: 59.99, reason: 'Initial price' }
    ],
    stockHistory: [
      { timestamp: Date.now() - 86400000, delta: 37, stockAfter: 37, trigger: 'restock' }
    ],
    tags: ['gaming', 'mouse', 'rgb']
  }
];
