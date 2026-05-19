import { OrderItem, User } from '../models/index.js';
import { notifyOrderConfirmed, notifyOrderShipped } from '../services/emailService.js';

export async function getOrderNotifyContext(order) {
  const items = await OrderItem.findAll({ where: { orderId: order.id } });
  const user = await User.findByPk(order.userId);
  const addr = order.deliveryAddress || {};
  const customerEmail = (addr.email || user?.email || '').trim().toLowerCase();
  const customerName = addr.name || user?.name || 'Customer';
  return { items, customerEmail, customerName };
}

export async function sendOrderConfirmedEmails(order) {
  try {
    const { items, customerEmail, customerName } = await getOrderNotifyContext(order);
    await notifyOrderConfirmed(order, items, customerEmail, customerName);
  } catch (err) {
    console.error('[email] Order confirmed notification failed:', err.message);
  }
}

export async function sendOrderShippedEmail(order) {
  try {
    const { items, customerEmail, customerName } = await getOrderNotifyContext(order);
    await notifyOrderShipped(order, items, customerEmail, customerName);
  } catch (err) {
    console.error('[email] Order shipped notification failed:', err.message);
  }
}
