import { createRequire } from 'node:module';
import { Sequelize } from 'sequelize';
import env from './env.js';

const require = createRequire(import.meta.url);
const pg = require('./pgDriver.cjs');

export const sequelize = new Sequelize(
  env.db.name,
  env.db.user,
  env.db.password,
  {
    host: env.db.host,
    port: env.db.port,
    dialect: 'postgres',
    dialectModule: pg,
    logging: env.nodeEnv === 'development' ? false : false,
    dialectOptions: env.db.ssl
      ? { ssl: { require: true, rejectUnauthorized: false } }
      : {},
    pool:
      process.env.VERCEL === '1'
        ? { max: 1, min: 0, acquire: 20000, idle: 5000 }
        : { max: 10, min: 0, acquire: 30000, idle: 10000 },
  }
);

export async function connectDB() {
  await sequelize.authenticate();
  console.log('PostgreSQL connected (Supabase)');
}
