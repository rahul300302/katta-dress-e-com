import { Router } from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from '../controllers/cartController.js';
import { authenticate } from '../middleware/auth.js';
import { validate, addToCartSchema, updateCartSchema } from '../validations/schemas.js';

const router = Router();

router.use(authenticate);

router.get('/', getCart);
router.post('/', validate(addToCartSchema), addToCart);
router.patch('/:itemId', validate(updateCartSchema), updateCartItem);
router.delete('/:itemId', removeCartItem);
router.delete('/', clearCart);

export default router;
