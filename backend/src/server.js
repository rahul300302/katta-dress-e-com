import app from './app.js';
import env from './config/env.js';
import { connectDB } from './config/db.js';
import { syncDatabase } from './models/index.js';

let initialized = false;

async function initServer() {
  if (initialized) return;

  await connectDB();
  await syncDatabase();

  initialized = true;
}

if (process.env.VERCEL !== '1') {
  initServer()
    .then(() => {
      app.listen(env.port, () => {
        console.log(`KATTA API running on port ${env.port}`);
      });
    })
    .catch((err) => {
      console.error('Failed to start server:', err);
    });
}

export default async function handler(req, res) {
  try {
    await initServer();
    return app(req, res);
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}