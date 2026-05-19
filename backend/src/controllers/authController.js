import env from '../config/env.js';
import { signToken } from '../middleware/auth.js';

export function googleAuth(_req, res, next) {
  next();
}

export function googleCallback(req, res) {
  const token = signToken(req.user);
  const redirect = req.query.state || `${env.frontendUrl}/auth/callback`;
  const url = new URL(redirect);
  url.searchParams.set('token', token);
  url.searchParams.set('role', req.user.role);
  res.redirect(url.toString());
}

export async function getMe(req, res) {
  res.json({
    success: true,
    data: {
      id: String(req.user.id),
      name: req.user.name,
      email: req.user.email,
      avatar: req.user.avatar,
      role: req.user.role,
    },
  });
}
