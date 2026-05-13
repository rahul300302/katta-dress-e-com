# Fashion & Leisure Ecommerce Platform

Full-stack ecommerce starter inspired by modern fashion stores (structure inspired by Coozo-style UX, without copying exact design).

## Tech Stack

- Frontend: Next.js 14 (App Router), React, Tailwind CSS
- Backend: Node.js, Express.js
- Database: PostgreSQL + Sequelize
- Auth: JWT (user/admin roles)
- Payments: Stripe + Razorpay + COD
- Media: Cloudinary (swap with S3 if needed)

## Project Structure

```txt
frontend/
  app/
  components/
  services/
  hooks/
  store/
  styles/
  utils/
  types/

backend/
  src/
    controllers/
    routes/
    services/
    repositories/
    middleware/
    models/
    migrations/
    seeders/
    validations/
    config/
    utils/
    helpers/
```

## Quick Start

### 1) Prerequisites

- Node.js 20+
- PostgreSQL 14+

### 2) Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Update .env values
npm run db:migrate
npm run db:seed
npm run dev
```

Backend runs on `http://localhost:5000`.

### 3) Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env.local
# Update API + payment public keys
npm run dev
```

Frontend runs on `http://localhost:3000`.

## Implemented Modules

- Homepage with hero, mega menu, sections, newsletter, referral banner, footer
- Product listing with filters, search, sorting, pagination
- Product details with gallery, variants, review section, related products
- Cart + wishlist APIs and UI scaffolding
- JWT auth (register/login/forgot/reset placeholders)
- Admin auth + dashboard + product/category/brand/order/coupon/banner endpoints
- Order creation and payment status flow
- Sequelize models, associations, migrations starter, seeders
- Stripe/Razorpay service scaffolding and webhook endpoint placeholders
- Security middleware: helmet, rate-limit, CORS, validation, role guards

## Notes

- This is a production-style starter architecture with core implementation and extensible modules.
- Stripe/Razorpay webhooks and email templates are scaffolded and ready to wire with real keys.
- For PDF reports, integrate `pdfkit`/`puppeteer` in report service.

