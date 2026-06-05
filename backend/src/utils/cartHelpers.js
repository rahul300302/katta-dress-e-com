import { Product } from '../models/index.js';
import { AppError } from '../middleware/errorHandler.js';
import { toApi } from './serialize.js';
import {
  normalizeProductRecord,
  productOffersSize,
  stockForSize,
} from './productStock.js';
import { resolveDeliveryCharge } from '../services/deliverySettings.js';

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
    
    // Priority: images > colorVariants
    let images = Array.isArray(p.images) ? p.images.filter(Boolean) : [];
    let image = images[0] || '';
    
    // Fallback to colorVariants if no direct images
    if (!image && Array.isArray(p.colorVariants) && p.colorVariants.length > 0) {
      const colorImages = p.colorVariants
        .map(v => v?.image)
        .filter(Boolean);
      if (colorImages.length > 0) {
        image = colorImages[0];
        images = colorImages;
      }
    }
    
    // If still no image, log for debugging but continue gracefully
    if (!image) {
      console.warn(`[Cart] Product ${item.productId} (${p.name}) has no images or colorVariants`);
    }
    
    populated.push({
      _id: String(item.id),
      productId: String(product.id),
      name: p.name,
      image: image,
      images: images,
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

export function calcCartTotals(items, deliveryInput) {
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const discount = items.reduce((sum, i) => {
    const orig = i.originalPrice ?? i.price;
    if (orig > i.price) return sum + (orig - i.price) * i.quantity;
    return sum;
  }, 0);

  let deliveryCharge;
  if (typeof deliveryInput === 'number') {
    deliveryCharge = deliveryInput;
  } else if (deliveryInput && typeof deliveryInput === 'object') {
    deliveryCharge = resolveDeliveryCharge(subtotal, deliveryInput);
  } else {
    deliveryCharge = 0;
  }

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
  o.items = items.map((i) => {
    // Ensure image is never empty - use a fallback
    const image = i.image || '';
    return {
      productId: String(i.productId),
      name: i.name,
      image: image,
      size: i.size,
      quantity: i.quantity,
      price: Number(i.price),
    };
  });
  o.subtotal = Number(o.subtotal);
  o.discount = Number(o.discount);
  o.deliveryCharge = Number(o.deliveryCharge);
  o.totalAmount = Number(o.totalAmount);
  o.invoiceNumber = `KATTA-${String(o._id).padStart(6, '0')}`;
  o.invoiceDate = o.createdAt ? new Date(o.createdAt).toISOString() : new Date().toISOString();
  o.invoiceStatus = o.paymentStatus === 'paid' ? 'Paid' : 'Pending';
  o.price = undefined;
  return o;
}
