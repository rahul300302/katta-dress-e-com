import { Product } from '../models/index.js';
import { buildSizeStockFromLegacy } from '../utils/productStock.js';

const SAMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
  'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80',
  'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&q=80',
  'https://images.unsplash.com/photo-1622445275463-afa6ab5c4ecc?w=800&q=80',
  'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80',
  'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800&q=80',
];

const samples = [
  {
    name: 'KATTA Classic Black Tee',
    description: 'Premium cotton crew neck. Soft feel, regular fit. Perfect everyday essential.',
    images: [SAMPLE_IMAGES[0], SAMPLE_IMAGES[1]],
    price: 899,
    offerPrice: 699,
    category: 'T-Shirt',
    collection: 'Essentials',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Black'],
    stock: 50,
    isHotSale: true,
    isBestSeller: true,
  },
  {
    name: 'Street Oversized White',
    description: 'Relaxed oversized fit streetwear tee. Breathable fabric for all-day comfort.',
    images: [SAMPLE_IMAGES[2], SAMPLE_IMAGES[3]],
    price: 999,
    offerPrice: 799,
    category: 'T-Shirt',
    collection: 'Street',
    sizes: ['M', 'L', 'XL', 'XXL', 'XXXL'],
    colors: ['White'],
    stock: 40,
    isOffer: true,
    isNewArrival: true,
  },
  {
    name: 'Urban Graphic Navy',
    description: 'Minimal graphic print. Premium streetwear style with durable stitching.',
    images: [SAMPLE_IMAGES[4], SAMPLE_IMAGES[5]],
    price: 1099,
    offerPrice: 849,
    category: 'T-Shirt',
    collection: 'Urban',
    sizes: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
    colors: ['Navy'],
    stock: 35,
    isHotSale: true,
    isOffer: true,
    isBestSeller: true,
  },
  {
    name: 'Essential Grey Melange',
    description: 'Heather grey melange fabric. Versatile fit for casual and layered looks.',
    images: [SAMPLE_IMAGES[1], SAMPLE_IMAGES[0]],
    price: 849,
    offerPrice: 649,
    category: 'T-Shirt',
    collection: 'Essentials',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Grey'],
    stock: 60,
    isNewArrival: true,
  },
  {
    name: 'Olive Military Fit',
    description: 'Structured military-inspired fit. Reinforced collar and cuffs.',
    images: [SAMPLE_IMAGES[3], SAMPLE_IMAGES[4]],
    price: 949,
    offerPrice: 749,
    category: 'T-Shirt',
    collection: 'Street',
    sizes: ['M', 'L', 'XL', 'XXL'],
    colors: ['Olive'],
    stock: 30,
    isOffer: true,
  },
  {
    name: 'Sunset Orange Boxy',
    description: 'Boxy cropped street fit. Bold color for statement outfits.',
    images: [SAMPLE_IMAGES[5], SAMPLE_IMAGES[2]],
    price: 899,
    offerPrice: 699,
    category: 'T-Shirt',
    collection: 'Urban',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Orange'],
    stock: 25,
    isHotSale: true,
    isNewArrival: true,
  },
];

function withSizeStock(sample) {
  const { sizes, stock, ...rest } = sample;
  const sizeStock = buildSizeStockFromLegacy(sizes, stock);
  if (sample.name === 'Essential Grey Melange') {
    sizeStock.L = 0;
  }
  return {
    ...rest,
    sizes: Object.keys(sizeStock),
    sizeStock,
    stock: Object.values(sizeStock).reduce((a, b) => a + b, 0),
  };
}

export async function seedProducts() {
  const count = await Product.count();
  if (count > 0) {
    console.log(`Products already seeded (${count} items)`);
    return;
  }
  await Product.bulkCreate(samples.map(withSizeStock));
  console.log(`Seeded ${samples.length} sample products`);
}
