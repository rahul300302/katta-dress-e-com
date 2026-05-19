import Razorpay from 'razorpay';
import crypto from 'crypto';
import env from '../config/env.js';
import { AppError } from '../middleware/errorHandler.js';

let instance = null;

function getRazorpay() {
  if (!env.razorpay.keyId || !env.razorpay.keySecret) {
    throw new AppError('Razorpay is not configured', 503);
  }
  if (!instance) {
    instance = new Razorpay({
      key_id: env.razorpay.keyId,
      key_secret: env.razorpay.keySecret,
    });
  }
  return instance;
}

export async function createRazorpayOrder(amountInPaise, receipt) {
  const razorpay = getRazorpay();
  return razorpay.orders.create({
    amount: Math.round(amountInPaise),
    currency: 'INR',
    receipt,
  });
}

export function verifyRazorpaySignature(orderId, paymentId, signature) {
  const body = `${orderId}|${paymentId}`;
  const expected = crypto
    .createHmac('sha256', env.razorpay.keySecret)
    .update(body)
    .digest('hex');
  return expected === signature;
}

export function getRazorpayKeyId() {
  return env.razorpay.keyId;
}
