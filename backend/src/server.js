import app from './app.js';
import { connectDB } from './config/db.js';
import { syncDatabase } from './models/index.js';
// import { seedProducts } from './scripts/seed.js';

let initialized = false;

async function initServer() {
  if (initialized) return;

  await connectDB();
  await syncDatabase();

  // Do not run seedProducts in Vercel every request
  // await seedProducts();

  initialized = true;
}

export default async function handler(req, res) {
  try {
    await initServer();
    return app(req, res);
  } catch (err) {
    console.error('Vercel server error:', err);

    return res.status(500).json({
      success: false,
      message: err.message || 'Internal Server Error',
    });
  }
}