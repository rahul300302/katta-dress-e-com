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

function htmlToPlainText(html) {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/tr>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function sendMail({ to, subject, html, text, replyTo: customReplyTo }) {
  const transport = getTransporter();
  if (!transport) {
    console.warn('[email] SMTP not configured — skipping:', subject, '→', to);
    return false;
  }

  const plainText = text || htmlToPlainText(html);
  const defaultReply = env.storeEmail || env.smtp.from;

  try {
    await transport.sendMail({
      from: `"KATTA" <${env.smtp.from}>`,
      replyTo: customReplyTo || `"KATTA Support" <${defaultReply}>`,
      to,
      subject,
      html,
      text: plainText,
      headers: {
        'X-Entity-Ref-ID': `katta-order-${Date.now()}`,
        Precedence: 'auto',
      },
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
  const trackingCarrier = order.trackingCarrier || '';
  const trackingNumber = order.trackingNumber || '';
  const trackingUrl = order.trackingUrl || '';
  const trackingHtml = trackingCarrier || trackingNumber || trackingUrl
    ? `<div style="margin-top:18px;padding:16px;background:#f9f9f9;border:1px solid #eee;border-radius:10px;">
         <p style="margin:0 0 8px;font-weight:600;">Shipment details</p>
         ${trackingCarrier ? `<p style="margin:0;">Carrier: ${escapeHtml(trackingCarrier)}</p>` : ''}
         ${trackingNumber ? `<p style="margin:0;">Tracking number: ${escapeHtml(trackingNumber)}</p>` : ''}
         ${trackingUrl ? `<p style="margin:0;">Track online: <a href="${escapeHtml(trackingUrl)}">${escapeHtml(trackingUrl)}</a></p>` : ''}
       </div>`
    : '';

  const body = `
    <p>Hi ${customerName || 'there'},</p>
    <p>Your KATTA order <strong>#${orderId}</strong> has been shipped and is on its way to you.</p>
    ${orderItemsHtml(items)}
    <p style="margin-top:16px;">
      Subtotal: ${formatInr(order.subtotal)}<br/>
      Delivery: ${formatInr(order.deliveryCharge)}<br/>
      <strong>Total: ${formatInr(order.totalAmount)}</strong>
    </p>
    ${trackingHtml}
    <p style="margin-top:16px;">We will notify you when your order is delivered.</p>
    <p style="margin-top:16px;">Thank you for shopping with KATTA.</p>
  `;
  const html = emailLayout('Your order has shipped', body);

  const textParts = [
    `Hi ${customerName || 'there'},`,
    '',
    `Your KATTA order #${orderId} has been shipped and is on its way.`,
    '',
    `Order total: ${formatInr(order.totalAmount)}`,
  ];

  if (trackingCarrier) textParts.push('', `Carrier: ${trackingCarrier}`);
  if (trackingNumber) textParts.push(`Tracking number: ${trackingNumber}`);
  if (trackingUrl) textParts.push(`Track online: ${trackingUrl}`);

  textParts.push('', 'We will notify you when your order is delivered.', '', 'Thank you for shopping with KATTA.', '', `Questions? Email ${env.storeEmail || 'kattaclothings@gmail.com'}`);

  return {
    subject: `Your KATTA order #${orderId} has shipped`,
    html,
    text: textParts.join('\n'),
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
  await sendMail({ to: customerEmail, subject: mail.subject, html: mail.html, text: mail.text });
}

const FEEDBACK_EMAIL = 'kattaclothings@gmail.com';

export async function sendFeedbackEmail({ name, email, message }) {
  const to = env.storeEmail || FEEDBACK_EMAIL;
  const safeName = escapeHtml(name);
  const safeEmail = email ? escapeHtml(email) : 'Not provided';
  const safeMessage = escapeHtml(message).replace(/\n/g, '<br/>');

  const body = `
    <p><strong>New feedback from the KATTA website</strong></p>
    <p><strong>Name:</strong> ${safeName}<br/>
    <strong>Email:</strong> ${safeEmail}</p>
    <p style="margin-top:16px;padding:12px;background:#f5f5f5;border-radius:8px;line-height:1.6;">
      ${safeMessage}
    </p>
  `;

  const html = emailLayout('Customer feedback', body);
  const text = [
    'New feedback from the KATTA website',
    '',
    `Name: ${name}`,
    `Email: ${email || 'Not provided'}`,
    '',
    message,
  ].join('\n');

  const replyTo = email ? `"${name}" <${email}>` : undefined;

  return sendMail({
    to,
    subject: `KATTA — Feedback from ${name}`,
    html,
    text,
    replyTo,
  });
}
