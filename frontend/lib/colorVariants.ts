import type { Product } from '@/services/api';

export interface ColorVariant {
  name: string;
  image: string;
}

export function getColorVariants(product: Product): ColorVariant[] {
  const variants = product.colorVariants?.filter((v) => v?.name && v?.image) || [];
  if (variants.length) return variants;

  const colors = product.colors || [];
  const images = product.images || [];
  if (colors.length) {
    return colors.map((name, i) => ({
      name,
      image: images[i] || images[0] || '',
    }));
  }
  if (images.length) {
    return [{ name: 'Default', image: images[0] }];
  }
  return [];
}

export function variantsToProductFields(variants: ColorVariant[]) {
  const valid = variants.filter((v) => v.name.trim() && v.image.trim());
  return {
    colorVariants: valid,
    colors: valid.map((v) => v.name.trim()),
    images: valid.map((v) => v.image.trim()),
  };
}

export function getDisplayImages(product: Product, selectedColor?: string): string[] {
  const variants = getColorVariants(product);
  const all = [
    ...variants.map((v) => v.image),
    ...(product.images || []).filter((img) => !variants.some((v) => v.image === img)),
  ].filter(Boolean);
  const unique = Array.from(new Set(all));
  if (!selectedColor) return unique.length ? unique : product.images || [];
  const match = variants.find((v) => v.name === selectedColor);
  if (match) {
    return [match.image, ...unique.filter((u) => u !== match.image)];
  }
  return unique.length ? unique : product.images || [];
}
