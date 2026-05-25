import { Router } from 'express';
import Joi from 'joi';
import {
  getMyOrders,
  getOrder,
  createOrderFromCart,
  getAllOrders,
  updateOrderStatus,
} from '../controllers/orderController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { validate, addressSchema } from '../validations/schemas.js';

const router = Router();

const createOrderSchema = Joi.object({
  deliveryAddress: addressSchema.required(),
});

const updateOrderSchema = Joi.object({
  orderStatus: Joi.string().valid('placed', 'confirmed', 'shipped', 'delivered', 'cancelled').required(),
  trackingCarrier: Joi.string().allow('').optional(),
  trackingNumber: Joi.string().allow('').optional(),
  trackingUrl: Joi.string().uri().allow('').optional(),
});

router.post('/', authenticate, validate(createOrderSchema), createOrderFromCart);
router.get('/my', authenticate, getMyOrders);
router.get('/admin/all', authenticate, requireAdmin, getAllOrders);
router.get('/:id', authenticate, getOrder);
router.patch('/:id/status', authenticate, requireAdmin, validate(updateOrderSchema), updateOrderStatus);

export default router;
