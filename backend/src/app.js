import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import passport from 'passport';
import env from './config/env.js';
import { configurePassport } from './config/passport.js';
import { ensureDb } from './config/initDb.js';
import routes from './routes/index.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

const app = express();

if (process.env.VERCEL === '1') {
  app.set('trust proxy', 1);
}

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

const allowedOrigins = [
  'https://katta-dress-frontend.vercel.app',
  ...(env.frontendUrl || process.env.ALLOWED_ORIGINS || 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),
];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

app.use(morgan(env.nodeEnv === 'development' ? 'dev' : 'combined'));

app.use(express.json({ limit: '2mb' }));

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: env.nodeEnv === 'development' ? 10000 : 1000,
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests, please try again later.',
    skip: (req) =>
      env.nodeEnv === 'development' &&
      req.path.startsWith('/api/auth/google'),
  })
);

app.use(async (req, res, next) => {
  try {
    await ensureDb();
    next();
  } catch (err) {
    next(err);
  }
});

configurePassport();
app.use(passport.initialize());

app.get('/health', (_req, res) => res.json({ ok: true }));
app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

export default app;