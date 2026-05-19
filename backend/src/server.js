import app from './app.js';
import env from './config/env.js';
import { ensureDb } from './config/initDb.js';

if (process.env.VERCEL !== '1') {
  ensureDb()
    .then(() => {
      app.listen(env.port, () => {
        console.log(`KATTA API running on port ${env.port}`);
      });
    })
    .catch((err) => {
      console.error('Failed to start server:', err);
      process.exit(1);
    });
}

export default app;
