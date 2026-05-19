import app from './app.js';
import env from './config/env.js';
import { connectDB } from './config/db.js';
import { syncDatabase } from './models/index.js';
import { seedProducts } from './scripts/seed.js';

async function start() {
  await connectDB();
  await syncDatabase();
  await seedProducts();

  app.listen(env.port, () => {
    console.log(`KATTA API running on port ${env.port}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
