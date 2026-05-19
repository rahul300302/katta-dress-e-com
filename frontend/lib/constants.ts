export const BRAND = {
  name: 'KATTA',
  logo: '/logo.png',
  tagline: "Premium Men's T-Shirts",
  address: {
    line1: '14, Ganapathy Nager,',
    line2: 'Chettikulam Jn,',
    city: 'Nagercoil - 629 002',
    country: 'India',
  },
  phone: '+91 82208 65023',
  email: 'kattaclothings@gmail.com',
  instagram: 'https://www.instagram.com/katta.in_?igsh=MWYxdjAzdGgyaG5pMg==',
  whatsapp: 'https://wa.me/918220865023',
};

export const SIZES = ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'] as const;

export type Size = (typeof SIZES)[number];

export function formatPrice(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getDiscountPercent(price: number, offerPrice?: number) {
  if (!offerPrice || offerPrice >= price) return 0;
  return Math.round(((price - offerPrice) / price) * 100);
}
