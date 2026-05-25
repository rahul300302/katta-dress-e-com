import env from '../config/env.js';
import { signToken } from '../middleware/auth.js';
import { User } from '../models/index.js';

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
      addresses: req.user.addresses || [],
    },
  });
}

export async function updateMe(req, res, next) {
  try {
    const updates = {};
    if (typeof req.body.name === 'string') updates.name = req.body.name;
    if (Array.isArray(req.body.addresses)) updates.addresses = req.body.addresses;

    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    await user.update(updates);

    res.json({
      success: true,
      data: {
        id: String(user.id),
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        addresses: user.addresses || [],
      },
    });
  } catch (err) {
    next(err);
  }
}
