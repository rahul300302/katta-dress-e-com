import { Router } from 'express';
import {
  createRazorpayPaymentOrder,
  verifyRazorpayPayment,
  getPaymentConfig,
} from '../controllers/paymentController.js';
import { authenticate } from '../middleware/auth.js';
import { validate, paymentVerifySchema } from '../validations/schemas.js';
import Joi from 'joi';

const router = Router();

router.get('/config', getPaymentConfig);
router.post(
  '/razorpay/order',
  authenticate,
  validate(Joi.object({ orderId: Joi.string().required() })),
  createRazorpayPaymentOrder
);
router.post('/razorpay/verify', authenticate, validate(paymentVerifySchema), verifyRazorpayPayment);

export default router;
