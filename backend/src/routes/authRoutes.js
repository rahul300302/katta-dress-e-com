import { Router } from 'express';
import passport from 'passport';
import env from '../config/env.js';
import { authenticate } from '../middleware/auth.js';
import { getMe, googleCallback } from '../controllers/authController.js';

const router = Router();

router.get(
  '/google',
  (req, res, next) => {
    const state = req.query.redirect || '';
    passport.authenticate('google', {
      scope: ['profile', 'email'],
      session: false,
      state,
    })(req, res, next);
  }
);

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/api/auth/failure' }),
  googleCallback
);

router.get('/failure', (_req, res) => {
  res.redirect(`${env.frontendUrl}/auth/login?error=oauth`);
});

router.get('/me', authenticate, getMe);

export default router;
