# KATTA — Men's T-Shirt Ecommerce

Premium men's t-shirt online store. **KATTA** · Nagercoil, India.

## Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 14, React 18, TypeScript, Tailwind CSS, Framer Motion, Zustand |
| Backend | Node.js, Express, PostgreSQL (Supabase), Sequelize |
| Auth | Google OAuth (JWT) |
| Payments | Razorpay |
| Images | Supabase Storage (S3-compatible bucket) |

## Features

- Browse all pages **without login**
- Google sign-in required only for **Add to Cart**, **Checkout**, and **Orders**
- Home: hero carousel, hot sales, offers, collection, new arrivals, best sellers, store location
- Product listing with filters (size, color, collection, price) and sort
- Product detail with gallery, size picker, quantity, buy now
- Cart with quantity controls and order summary
- Checkout with address form + Razorpay
- Order success page
- Admin: dashboard, add/delete products, update order status

## Quick Start

### Prerequisites

- Node.js 18.17+
- Supabase PostgreSQL database
- Google Cloud OAuth credentials
- Razorpay test/live keys
- Supabase project with a public storage bucket (optional for uploads)

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with DB_HOST, DB_USER, DB_PASSWORD, Google, Razorpay, Supabase keys
npm run dev
```

API: `http://localhost:5000` · Health: `GET /health`

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:5000/api
npm run dev
```

Store: `http://localhost:3000`

## Google OAuth Setup

1. [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials
2. Create **OAuth 2.0 Client ID** (Web application)
3. Authorized redirect URI: `http://localhost:5000/api/auth/google/callback`
4. Add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` to `backend/.env`
5. Set `ADMIN_EMAILS=your@gmail.com` for admin access

## Razorpay Setup

1. [Razorpay Dashboard](https://dashboard.razorpay.com/) → API Keys
2. Add `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` to `backend/.env`
3. Add `NEXT_PUBLIC_RAZORPAY_KEY_ID` to `frontend/.env.local`

## Supabase Storage

1. Create a bucket named `product-images` (public)
2. Add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to `backend/.env`
3. Admin can upload via `POST /api/upload/image` (multipart field: `image`)

## Brand

- **KATTA** — Men's T-Shirts only
- 14, Ganapathy Nager, Chettikulam Jn, Nagercoil - 629 002, India
- Currency: INR (₹)

## API Overview

| Method | Route | Auth |
|--------|-------|------|
| GET | `/api/products` | Public |
| GET | `/api/products/home` | Public |
| GET | `/api/auth/google` | Public |
| GET | `/api/cart` | User |
| POST | `/api/cart` | User |
| POST | `/api/orders` | User |
| POST | `/api/payments/razorpay/order` | User |
| POST | `/api/payments/razorpay/verify` | User |
| GET | `/api/admin/dashboard` | Admin |

## License

Private — KATTA
