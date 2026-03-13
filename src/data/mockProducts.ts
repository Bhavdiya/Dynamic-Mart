
import { Product } from '../types';

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Premium Wireless Headphones',
    description: 'High-quality noise-canceling wireless headphones with premium sound',
    basePrice: 299.99,
    currentPrice: 299.99,
    stock: 15,
    category: 'Electronics',
    image: '/images/headphones.jpg',
    demand: 45,
    priceHistory: [
      { timestamp: Date.now() - 86400000, price: 299.99, reason: 'Initial price' }
    ],
    tags: ['wireless', 'premium', 'audio']
  },
  {
    id: '2',
    name: 'Smart Fitness Watch',
    description: 'Advanced fitness tracking with heart rate monitoring and GPS',
    basePrice: 199.99,
    currentPrice: 199.99,
    stock: 8,
    category: 'Fitness',
    image: '/images/fitness-watch.jpg',
    demand: 78,
    priceHistory: [
      { timestamp: Date.now() - 86400000, price: 199.99, reason: 'Initial price' }
    ],
    tags: ['fitness', 'smart', 'health']
  },
  {
    id: '3',
    name: 'Ergonomic Office Chair',
    description: 'Professional ergonomic chair with lumbar support and adjustable height',
    basePrice: 449.99,
    currentPrice: 449.99,
    stock: 25,
    category: 'Furniture',
    image: '/images/office-chair.jpg',
    demand: 32,
    priceHistory: [
      { timestamp: Date.now() - 86400000, price: 449.99, reason: 'Initial price' }
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
      { timestamp: Date.now() - 86400000, price: 79.99, reason: 'Initial price' }
    ],
    tags: ['portable', 'waterproof', 'audio']
  },
  {
    id: '5',
    name: 'Premium Coffee Maker',
    description: 'Programmable coffee maker with built-in grinder and thermal carafe',
    basePrice: 189.99,
    currentPrice: 189.99,
    stock: 12,
    category: 'Kitchen',
    image: '/images/coffee-maker.jpg',
    demand: 56,
    priceHistory: [
      { timestamp: Date.now() - 86400000, price: 189.99, reason: 'Initial price' }
    ],
    tags: ['coffee', 'kitchen', 'appliance']
  },
  {
    id: '6',
    name: 'Gaming Mechanical Keyboard',
    description: 'RGB backlit mechanical keyboard with tactile switches',
    basePrice: 129.99,
    currentPrice: 129.99,
    stock: 20,
    category: 'Gaming',
    image: '/images/gaming-keyboard.jpg',
    demand: 67,
    priceHistory: [
      { timestamp: Date.now() - 86400000, price: 129.99, reason: 'Initial price' }
    ],
    tags: ['gaming', 'mechanical', 'rgb']
  },
  {
    id: '7',
    name: '4K Ultra HD Smart TV',
    description: '55-inch 4K UHD Smart TV with HDR and built-in streaming apps',
    basePrice: 599.99,
    currentPrice: 599.99,
    stock: 10,
    category: 'Electronics',
    image: '/images/4K-tv.jpg',
    demand: 84,
    priceHistory: [
      { timestamp: Date.now() - 86400000, price: 599.99, reason: 'Initial price' }
    ],
    tags: ['tv', '4k', 'smart']
  },
  {
    id: '8',
    name: 'Noise-Canceling Earbuds',
    description: 'Truly wireless earbuds with active noise cancellation and long battery life',
    basePrice: 149.99,
    currentPrice: 149.99,
    stock: 30,
    category: 'Electronics',
    image: '/images/earbuds.jpg',
    demand: 58,
    priceHistory: [
      { timestamp: Date.now() - 86400000, price: 149.99, reason: 'Initial price' }
    ],
    tags: ['audio', 'wireless', 'earbuds']
  },
  {
    id: '9',
    name: 'Standing Desk Converter',
    description: 'Adjustable standing desk converter for existing office desks',
    basePrice: 229.99,
    currentPrice: 229.99,
    stock: 18,
    category: 'Furniture',
    image: '/images/standing-desk-converter.jpg',
    demand: 41,
    priceHistory: [
      { timestamp: Date.now() - 86400000, price: 229.99, reason: 'Initial price' }
    ],
    tags: ['office', 'health', 'desk']
  },
  {
    id: '10',
    name: 'Stainless Steel Cookware Set',
    description: '10-piece stainless steel cookware set with glass lids',
    basePrice: 159.99,
    currentPrice: 159.99,
    stock: 22,
    category: 'Kitchen',
    image: '/images/cookware-set.jpg',
    demand: 63,
    priceHistory: [
      { timestamp: Date.now() - 86400000, price: 159.99, reason: 'Initial price' }
    ],
    tags: ['kitchen', 'cookware', 'home']
  },
  {
    id: '11',
    name: 'Yoga Mat with Alignment Lines',
    description: 'Non-slip yoga mat with body alignment guides and carrying strap',
    basePrice: 39.99,
    currentPrice: 39.99,
    stock: 40,
    category: 'Fitness',
    image: '/images/yoga-mat.jpg',
    demand: 52,
    priceHistory: [
      { timestamp: Date.now() - 86400000, price: 39.99, reason: 'Initial price' }
    ],
    tags: ['fitness', 'yoga', 'wellness']
  },
  {
    id: '12',
    name: 'RGB Gaming Mouse',
    description: 'High-precision gaming mouse with customizable RGB lighting',
    basePrice: 59.99,
    currentPrice: 59.99,
    stock: 35,
    category: 'Gaming',
    image: '/images/gaming-mouse.jpg',
    demand: 74,
    priceHistory: [
      { timestamp: Date.now() - 86400000, price: 59.99, reason: 'Initial price' }
    ],
    tags: ['gaming', 'mouse', 'rgb']
  }
];
