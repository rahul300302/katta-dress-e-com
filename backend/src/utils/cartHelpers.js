import { Product } from '../models/index.js';
import { AppError } from '../middleware/errorHandler.js';
import { toApi } from './serialize.js';
import {
  normalizeProductRecord,
  productOffersSize,
  stockForSize,
} from './productStock.js';

export function getEffectivePrice(product) {
  const price = Number(product.price);
  const offer = product.offerPrice != null ? Number(product.offerPrice) : null;
  return offer != null && offer < price ? offer : price;
}

export async function populateCartItems(cartItems) {
  const populated = [];
  for (const item of cartItems) {
    const product = await Product.findByPk(item.productId);
    if (!product) continue;
    const p = normalizeProductRecord(toApi(product));
    const images = p.images || [];
    populated.push({
      _id: String(item.id),
      productId: String(product.id),
      name: p.name,
      image: images[0] || '',
      images,
      size: item.size,
      quantity: item.quantity,
      price: Number(item.price),
      offerPrice: p.offerPrice != null ? Number(p.offerPrice) : null,
      originalPrice: Number(p.price),
      stock: stockForSize(p, item.size),
      sizeStock: p.sizeStock,
    });
  }
  return populated;
}

export function calcCartTotals(items, deliveryCharge) {
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const discount = items.reduce((sum, i) => {
    const orig = i.originalPrice ?? i.price;
    if (orig > i.price) return sum + (orig - i.price) * i.quantity;
    return sum;
  }, 0);
  const totalAmount = subtotal + deliveryCharge;
  return { subtotal, discount, deliveryCharge, totalAmount };
}

export async function validateCartStock(cartItems) {
  for (const item of cartItems) {
    const product = await Product.findByPk(item.productId);
    if (!product) throw new AppError('Product no longer available', 400);
    if (!productOffersSize(product, item.size)) {
      throw new AppError(`Size ${item.size} unavailable for ${product.name}`, 400);
    }
    const available = stockForSize(product, item.size);
    if (available < item.quantity) {
      throw new AppError(
        available === 0
          ? `${product.name} (${item.size}) is out of stock`
          : `Only ${available} left in ${item.size} for ${product.name}`,
        400
      );
    }
  }
}

export function formatOrder(order, items = []) {
  const o = toApi(order);
  o.items = items.map((i) => ({
    productId: String(i.productId),
    name: i.name,
    image: i.image,
    size: i.size,
    quantity: i.quantity,
    price: Number(i.price),
  }));
  o.subtotal = Number(o.subtotal);
  o.discount = Number(o.discount);
  o.deliveryCharge = Number(o.deliveryCharge);
  o.totalAmount = Number(o.totalAmount);
  o.price = undefined;
  return o;
}
