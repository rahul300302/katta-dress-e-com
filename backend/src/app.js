import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import passport from 'passport';
import env from './config/env.js';
import { configurePassport } from './config/passport.js';
import routes from './routes/index.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

app.use(
  cors({
    origin: env.frontendUrl,
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

configurePassport();
app.use(passport.initialize());

app.get('/health', (_req, res) => res.json({ ok: true }));
app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

export default app;