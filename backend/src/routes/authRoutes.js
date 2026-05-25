import { Router } from 'express';
import Joi from 'joi';
import passport from 'passport';
import env from '../config/env.js';
import { authenticate } from '../middleware/auth.js';
import { getMe, updateMe, googleCallback } from '../controllers/authController.js';
import { validate, addressSchema } from '../validations/schemas.js';

const router = Router();

router.get(
  '/google',
  (req, res, next) => {
    const state = req.query.redirect || '';
    passport.authenticate('google', {
      scope: ['profile', 'email'],
      session: false,
      state,
      prompt: 'select_account',
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

const profileUpdateSchema = Joi.object({
  name: Joi.string().min(2).optional(),
  // addresses: Joi.array().items(addressSchema.keys({ label: Joi.string().allow('').optional() })).optional(),
});

router.get('/me', authenticate, getMe);
router.patch('/me', authenticate, validate(profileUpdateSchema), updateMe);

export default router;
