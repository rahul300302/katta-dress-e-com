import { connectDB } from './db.js';
import { syncDatabase } from '../models/index.js';

let ready;

export function ensureDb() {
  if (!ready) {
    ready = (async () => {
      await connectDB();
      await syncDatabase();
    })();
  }
  return ready;
}
