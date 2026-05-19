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
  phone: '+91 98765 43210',
  email: 'hello@katta.in',
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
