import { Order } from '../models/index.js';
import env from '../config/env.js';
import { getDeliverySettings } from '../services/deliverySettings.js';
import { AppError } from '../middleware/errorHandler.js';
import {
  createRazorpayOrder,
  verifyRazorpaySignature,
  getRazorpayKeyId,
} from '../services/razorpayService.js';
import { finalizePaidOrder } from './orderController.js';

export async function createRazorpayPaymentOrder(req, res, next) {
  try {
    const { orderId } = req.body;
    const order = await Order.findOne({
      where: { id: orderId, userId: req.user.id },
    });
    if (!order) throw new AppError('Order not found', 404);
    if (order.paymentStatus === 'paid') throw new AppError('Order already paid', 400);

    const receipt = `katta_${order.id}`;
    const razorpayOrder = await createRazorpayOrder(
      Number(order.totalAmount) * 100,
      receipt
    );

    await order.update({ razorpayOrderId: razorpayOrder.id });

    const addr = order.deliveryAddress || {};
    res.json({
      success: true,
      data: {
        keyId: getRazorpayKeyId(),
        orderId: String(order.id),
        razorpayOrderId: razorpayOrder.id,
        amount: Number(order.totalAmount) * 100,
        currency: 'INR',
        name: 'KATTA',
        description: `Order ${order.id}`,
        prefill: {
          name: addr.name,
          email: addr.email,
          contact: addr.phone,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function verifyRazorpayPayment(req, res, next) {
  try {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    const valid = verifyRazorpaySignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );
    if (!valid) throw new AppError('Payment verification failed', 400);

    const order = await Order.findOne({
      where: { id: orderId, userId: req.user.id },
    });
    if (!order) throw new AppError('Order not found', 404);

    const finalized = await finalizePaidOrder(orderId, razorpayOrderId, razorpayPaymentId);

    res.json({
      success: true,
      message: 'Payment successful',
      data: finalized,
    });
  } catch (err) {
    next(err);
  }
}

export async function getPaymentConfig(_req, res, next) {
  try {
    let keyId = '';
    try {
      keyId = getRazorpayKeyId();
    } catch {
      keyId = env.razorpay.keyId || '';
    }
    const delivery = await getDeliverySettings();
    res.json({
      success: true,
      data: {
        keyId,
        deliveryCharge: delivery.charge,
        freeDeliveryMinOrder: delivery.freeDeliveryMinOrder,
      },
    });
  } catch (err) {
    next(err);
  }
}
