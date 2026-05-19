import { Sequelize } from 'sequelize';
import env from './env.js';

export const sequelize = new Sequelize(
  env.db.name,
  env.db.user,
  env.db.password,
  {
    host: env.db.host,
    port: env.db.port,
    dialect: 'postgres',
    logging: env.nodeEnv === 'development' ? false : false,
    dialectOptions: env.db.ssl
      ? { ssl: { require: true, rejectUnauthorized: false } }
      : {},
    pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
  }
);

export async function connectDB() {
  await sequelize.authenticate();
  console.log('PostgreSQL connected (Supabase)');
}
