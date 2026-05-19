import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import { User } from '../models/index.js';
import { AppError } from './errorHandler.js';

export function signToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role, email: user.email },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );
}

export async function authenticate(req, _res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) throw new AppError('Authentication required', 401);

    const decoded = jwt.verify(token, env.jwtSecret);
    const user = await User.findByPk(decoded.id);
    if (!user) throw new AppError('User not found', 401);

    user._id = user.id;
    req.user = user;
    next();
  } catch (err) {
    next(err.name === 'JsonWebTokenError' ? new AppError('Invalid token', 401) : err);
  }
}

export function requireAdmin(req, _res, next) {
  if (req.user?.role !== 'admin') {
    return next(new AppError('Admin access required', 403));
  }
  next();
}
