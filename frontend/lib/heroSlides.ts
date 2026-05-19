export interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  cta: string;
  href: string;
  image: string;
}

export const DEFAULT_HERO_SLIDES: HeroSlide[] = [
  {
    id: 'slide-1',
    title: 'Streetwear Essentials',
    subtitle: "Premium men's tees crafted for everyday style",
    cta: 'Shop Collection',
    href: '/products',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1600&q=80',
  },
  {
    id: 'slide-2',
    title: 'Hot Sales — Up to 30% Off',
    subtitle: 'Limited time offers on bestsellers',
    cta: 'View Offers',
    href: '/products?isHotSale=true',
    image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=1600&q=80',
  },
  {
    id: 'slide-3',
    title: 'New Arrivals',
    subtitle: 'Fresh drops every week',
    cta: 'Explore New',
    href: '/products?isNewArrival=true',
    image: 'https://images.unsplash.com/photo-1622445275463-afa6ab5c4ecc?w=1600&q=80',
  },
];

export function newSlideId() {
  return `slide-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
