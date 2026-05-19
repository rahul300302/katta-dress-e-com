import { Router } from 'express';
import {
  getDashboard,
  getAllUsers,
  updateUserRole,
} from '../controllers/adminController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/dashboard', authenticate, requireAdmin, getDashboard);
router.get('/users', authenticate, requireAdmin, getAllUsers);
router.patch('/users/:id/role', authenticate, requireAdmin, updateUserRole);

export default router;
