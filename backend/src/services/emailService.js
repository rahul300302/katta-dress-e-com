import nodemailer from 'nodemailer';
import env from '../config/env.js';

let transporter;

function getTransporter() {
  if (transporter) return transporter;
  if (!env.smtp.user || !env.smtp.pass) return null;

  transporter = nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.secure,
    service: "gmail",
    auth: {
      user: env.smtp.user,
      pass: env.smtp.pass,
    },
  });
  return transporter;
}

function formatInr(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);
}

function orderItemsHtml(items) {
  const rows = items
    .map(
      (i) =>
        `<tr>
          <td style="padding:8px;border-bottom:1px solid #eee;">${i.name} (${i.size})</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${i.quantity}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">${formatInr(i.price)}</td>
        </tr>`
    )
    .join('');

  return `
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      <thead>
        <tr style="background:#f5f5f5;">
          <th style="padding:8px;text-align:left;">Item</th>
          <th style="padding:8px;">Qty</th>
          <th style="padding:8px;text-align:right;">Price</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function emailLayout(title, bodyHtml) {
  return `<!DOCTYPE html><html><body style="margin:0;padding:16px;background:#fafafa;">
    <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;color:#111;">
      <div style="background:#111;color:#fff;padding:20px 24px;border-radius:12px 12px 0 0;">
        <h1 style="margin:0;font-size:20px;">KATTA</h1>
        <p style="margin:6px 0 0;opacity:0.85;font-size:13px;">${title}</p>
      </div>
      <div style="padding:24px;border:1px solid #eee;border-top:0;border-radius:0 0 12px 12px;background:#fff;">
        ${bodyHtml}
        <p style="margin-top:24px;font-size:12px;color:#666;">
          Questions? Email <a href="mailto:kattaclothings@gmail.com">kattaclothings@gmail.com</a>
          or WhatsApp <a href="https://wa.me/918220865023">+91 82208 65023</a>.
        </p>
      </div>
    </div>
  </body></html>`;
}

export async function sendMail({ to, subject, html }) {
  const transport = getTransporter();
  if (!transport) {
    console.warn('[email] SMTP not configured — skipping:', subject, '→', to);
    return false;
  }

  try {
    await transport.sendMail({
      from: `"KATTA Store" <${env.smtp.from}>`,
      to,
      subject,
      html,
    });
    return true;
  } catch (err) {
    console.error('[email] Send failed:', err.message);
    return false;
  }
}

export function buildOrderConfirmedEmail({ order, items, customerName, forStore }) {
  const orderId = String(order.id);
  const addr = order.deliveryAddress || {};
  const intro = forStore
    ? `<p>A new order <strong>#${orderId}</strong> has been confirmed and paid.</p>`
    : `<p>Hi ${customerName || 'there'},</p>
       <p>Thank you for your order! Your payment was received and your order is <strong>confirmed</strong>.</p>`;

  let body = `
    ${intro}
    <p><strong>Order #${orderId}</strong></p>
    ${orderItemsHtml(items)}
    <p style="margin-top:16px;">
      Subtotal: ${formatInr(order.subtotal)}<br/>
      Delivery: ${formatInr(order.deliveryCharge)}<br/>
      <strong>Total: ${formatInr(order.totalAmount)}</strong>
    </p>
  `;

  if (forStore) {
    body += `
      <p><strong>Customer</strong><br/>
      ${addr.name || '—'}<br/>
      ${addr.email || '—'}<br/>
      ${addr.phone || '—'}<br/>
      ${addr.street || ''}, ${addr.city || ''}, ${addr.state || ''} ${addr.pincode || ''}
      </p>`;
    return {
      subject: `[KATTA] New order confirmed #${orderId}`,
      html: emailLayout('New order confirmed', body),
    };
  }

  return {
    subject: `KATTA — Order #${orderId} confirmed`,
    html: emailLayout('Order confirmed', body),
  };
}

export function buildOrderShippedEmail({ order, items, customerName }) {
  const orderId = String(order.id);
  const body = `
  <div style="font-family: Arial, sans-serif; font-size: 15px; color: #222; line-height: 1.5;">
    <p>Hi ${customerName || 'there'},</p>

    <p>Your KATTA order <strong>#${orderId}</strong> has been shipped and is on its way.</p>

    ${orderItemsHtml(items)}

    <p>You will receive another update once the delivery status changes.</p>

    <p style="margin-top:16px;">
      Thank you for shopping with KATTA.
    </p>

    <p style="font-size:12px;color:#666;">
      This is an order update email from KATTA.
    </p>
  </div>
`;
  return {
    subject: `KATTA — Order #${orderId} shipped`,
    html: emailLayout('Your order is on the way', body),
  };
}

export async function notifyOrderConfirmed(order, items, customerEmail, customerName) {
  const storeEmail = env.storeEmail;
  const tasks = [];

  if (storeEmail) {
    const storeMail = buildOrderConfirmedEmail({
      order,
      items,
      customerName,
      forStore: true,
    });
    tasks.push(sendMail({ to: storeEmail, ...storeMail }));
  }

  if (customerEmail) {
    const userMail = buildOrderConfirmedEmail({
      order,
      items,
      customerName,
      forStore: false,
    });
    tasks.push(sendMail({ to: customerEmail, ...userMail }));
  }

  await Promise.all(tasks);
}

export async function notifyOrderShipped(order, items, customerEmail, customerName) {
  if (!customerEmail) return;
  const mail = buildOrderShippedEmail({ order, items, customerName });
  await sendMail({ to: customerEmail, ...mail });
}
