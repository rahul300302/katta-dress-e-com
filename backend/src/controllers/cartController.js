import { Cart, CartItem } from '../models/index.js';
import { Product } from '../models/index.js';
import { getDeliverySettings } from '../services/deliverySettings.js';
import { AppError } from '../middleware/errorHandler.js';
import {
  populateCartItems,
  calcCartTotals,
  getEffectivePrice,
} from '../utils/cartHelpers.js';
import { productOffersSize, stockForSize } from '../utils/productStock.js';

async function getOrCreateCart(userId) {
  let cart = await Cart.findOne({ where: { userId } });
  if (!cart) cart = await Cart.create({ userId });
  return cart;
}

async function getCartItems(cartId) {
  return CartItem.findAll({ where: { cartId } });
}

export async function getCart(req, res, next) {
  try {
    const cart = await getOrCreateCart(req.user.id);
    const items = await populateCartItems(await getCartItems(cart.id));
    const deliverySettings = await getDeliverySettings();
    const totals = calcCartTotals(items, deliverySettings);
    res.json({ success: true, data: { items, ...totals } });
  } catch (err) {
    next(err);
  }
}

export async function addToCart(req, res, next) {
  try {
    const { productId, size, quantity = 1 } = req.body;
    const product = await Product.findByPk(productId);
    if (!product) throw new AppError('Product not found', 404);
    if (!productOffersSize(product, size)) throw new AppError('Invalid size', 400);
    const available = stockForSize(product, size);
    if (available < quantity) {
      throw new AppError(
        available === 0 ? `Size ${size} is out of stock` : `Only ${available} available in ${size}`,
        400
      );
    }

    const cart = await getOrCreateCart(req.user.id);
    const price = getEffectivePrice(product);
    const existing = await CartItem.findOne({
      where: { cartId: cart.id, productId: product.id, size },
    });

    if (existing) {
      const newQty = existing.quantity + quantity;
      if (newQty > stockForSize(product, size)) throw new AppError('Insufficient stock', 400);
      await existing.update({ quantity: newQty });
    } else {
      await CartItem.create({
        cartId: cart.id,
        productId: product.id,
        size,
        quantity,
        price,
      });
    }

    const items = await populateCartItems(await getCartItems(cart.id));
    const deliverySettings = await getDeliverySettings();
    const totals = calcCartTotals(items, deliverySettings);
    res.json({ success: true, message: 'Added to cart', data: { items, ...totals } });
  } catch (err) {
    next(err);
  }
}

export async function updateCartItem(req, res, next) {
  try {
    const { quantity } = req.body;
    const cart = await getOrCreateCart(req.user.id);
    const item = await CartItem.findOne({
      where: { id: req.params.itemId, cartId: cart.id },
    });
    if (!item) throw new AppError('Cart item not found', 404);

    const product = await Product.findByPk(item.productId);
    if (!product) throw new AppError('Product not found', 404);
    if (quantity < 1) throw new AppError('Invalid quantity', 400);
    if (stockForSize(product, item.size) < quantity) throw new AppError('Insufficient stock', 400);

    await item.update({ quantity });

    const items = await populateCartItems(await getCartItems(cart.id));
    const deliverySettings = await getDeliverySettings();
    const totals = calcCartTotals(items, deliverySettings);
    res.json({ success: true, data: { items, ...totals } });
  } catch (err) {
    next(err);
  }
}

export async function removeCartItem(req, res, next) {
  try {
    const cart = await getOrCreateCart(req.user.id);
    const item = await CartItem.findOne({
      where: { id: req.params.itemId, cartId: cart.id },
    });
    if (!item) throw new AppError('Cart item not found', 404);
    await item.destroy();

    const items = await populateCartItems(await getCartItems(cart.id));
    const deliverySettings = await getDeliverySettings();
    const totals = calcCartTotals(items, deliverySettings);
    res.json({ success: true, data: { items, ...totals } });
  } catch (err) {
    next(err);
  }
}

export async function clearCart(req, res, next) {
  try {
    const cart = await getOrCreateCart(req.user.id);
    await CartItem.destroy({ where: { cartId: cart.id } });
    res.json({ success: true, message: 'Cart cleared' });
  } catch (err) {
    next(err);
  }
}
