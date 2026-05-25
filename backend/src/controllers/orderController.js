import { Order, OrderItem, Cart, CartItem, Product, User } from '../models/index.js';
import env from '../config/env.js';
import { AppError } from '../middleware/errorHandler.js';
import {
  populateCartItems,
  calcCartTotals,
  validateCartStock,
  formatOrder,
} from '../utils/cartHelpers.js';
import { decrementSizeStock } from '../utils/productStock.js';
import { sendOrderConfirmedEmails, sendOrderShippedEmail } from '../utils/orderNotify.js';
async function orderWithItems(order) {
  const items = await OrderItem.findAll({ where: { orderId: order.id } });
  return formatOrder(order, items);
}

export async function getMyOrders(req, res, next) {
  try {
    const orders = await Order.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
    });
    const data = await Promise.all(orders.map(orderWithItems));
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getOrder(req, res, next) {
  try {
    const order = await Order.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!order) throw new AppError('Order not found', 404);
    res.json({ success: true, data: await orderWithItems(order) });
  } catch (err) {
    next(err);
  }
}

export async function createOrderFromCart(req, res, next) {
  try {
    const { deliveryAddress } = req.body;
    const cart = await Cart.findOne({ where: { userId: req.user.id } });
    if (!cart) throw new AppError('Cart is empty', 400);

    const cartItems = await CartItem.findAll({ where: { cartId: cart.id } });
    if (!cartItems.length) throw new AppError('Cart is empty', 400);

    await validateCartStock(cartItems);
    const items = await populateCartItems(cartItems);
    const { subtotal, discount, deliveryCharge, totalAmount } = calcCartTotals(
      items,
      env.deliveryCharge
    );

    const order = await Order.create({
      userId: req.user.id,
      deliveryAddress,
      subtotal,
      discount,
      deliveryCharge,
      totalAmount,
      paymentStatus: 'pending',
      orderStatus: 'placed',
    });

    await OrderItem.bulkCreate(
      items.map((i) => ({
        orderId: order.id,
        productId: Number(i.productId),
        name: i.name,
        image: i.image,
        size: i.size,
        quantity: i.quantity,
        price: i.price,
      }))
    );

    res.status(201).json({ success: true, data: await orderWithItems(order) });
  } catch (err) {
    next(err);
  }
}

export async function finalizePaidOrder(orderId, razorpayOrderId, razorpayPaymentId) {
  const order = await Order.findByPk(orderId);
  if (!order) throw new AppError('Order not found', 404);
  if (order.paymentStatus === 'paid') return orderWithItems(order);

  await order.update({
    paymentStatus: 'paid',
    orderStatus: 'confirmed',
    razorpayOrderId,
    razorpayPaymentId,
  });

  const items = await OrderItem.findAll({ where: { orderId: order.id } });
  for (const item of items) {
    const product = await Product.findByPk(item.productId);
    if (product) {
      const stockUpdate = decrementSizeStock(product, item.size, item.quantity);
      await product.update(stockUpdate);
    }
  }

  const cart = await Cart.findOne({ where: { userId: order.userId } });
  if (cart) await CartItem.destroy({ where: { cartId: cart.id } });

  await sendOrderConfirmedEmails(order);

  return orderWithItems(order);
}

export async function getAllOrders(_req, res, next) {
  try {
    const orders = await Order.findAll({
      order: [['createdAt', 'DESC']],
      include: [{ model: User, attributes: ['id', 'name', 'email'] }],
    });
    const data = await Promise.all(
      orders.map(async (order) => {
        const formatted = await orderWithItems(order);
        if (order.User) {
          formatted.userId = {
            _id: String(order.User.id),
            name: order.User.name,
            email: order.User.email,
          };
        }
        return formatted;
      })
    );
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function updateOrderStatus(req, res, next) {
  try {
    const { orderStatus, trackingCarrier, trackingNumber, trackingUrl } = req.body;
    const order = await Order.findByPk(req.params.id);
    if (!order) throw new AppError('Order not found', 404);

    const previousStatus = order.orderStatus;
    await order.update({
      orderStatus,
      trackingCarrier: trackingCarrier || order.trackingCarrier,
      trackingNumber: trackingNumber || order.trackingNumber,
      trackingUrl: trackingUrl || order.trackingUrl,
    });

    if (orderStatus === 'confirmed' && previousStatus !== 'confirmed') {
      await sendOrderConfirmedEmails(order);
    }
    if (orderStatus === 'shipped' && previousStatus !== 'shipped') {
      await sendOrderShippedEmail(order);
    }

    res.json({ success: true, data: await orderWithItems(order) });
  } catch (err) {
    next(err);
  }
}
