import dotenv from 'dotenv';

dotenv.config();

const env = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  db: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 5432,
    name: process.env.DB_NAME || 'postgres',
    user: process.env.DB_USER || 'postgres',
    password: "Tv4CT8Tg2ckBPRwA" || '',
    dialect: process.env.DB_DIALECT || 'postgres',
    ssl: process.env.DB_SSL !== 'false',
  },
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    callbackUrl:
      process.env.GOOGLE_CALLBACK_URL ||
      (() => {
        const host =
          process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
        return host
          ? `https://${host}/api/auth/google/callback`
          : 'http://localhost:5000/api/auth/google/callback';
      })(),
  },
  adminEmails: (process.env.ADMIN_EMAILS || 'admin@gmail.com')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean),
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || '',
    keySecret: process.env.RAZORPAY_KEY_SECRET || '',
  },
  supabase: {
    url: process.env.SUPABASE_URL || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    bucket: process.env.SUPABASE_STORAGE_BUCKET || 'product-images',
  },
  cloudinary: {
    cloudName:
      process.env.CLOUDINARY_CLOUD_NAME ||
      process.env.CLOUDNARY_CLOUD_NAME ||
      '',
    apiKey:
      process.env.CLOUDINARY_API_KEY || process.env.CLOUDNARY_API_KEY || '',
    apiSecret:
      process.env.CLOUDINARY_API_SECRET ||
      process.env.CLOUDNARY_API_SECRET ||
      '',
  },
  deliveryCharge: Number(process.env.DELIVERY_CHARGE) || 49,
  storeEmail: process.env.STORE_EMAIL || 'kattaclothings@gmail.com',
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || process.env.SMTP_USER || 'kattaclothings@gmail.com',
  },
};

export default env;
