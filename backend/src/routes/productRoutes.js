import { Router } from 'express';
import {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getHomeSections,
} from '../controllers/productController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { validate, productSchema } from '../validations/schemas.js';

const router = Router();

router.get('/home', getHomeSections);
router.get('/', listProducts);
router.get('/:id', getProduct);

router.post('/', authenticate, requireAdmin, validate(productSchema), createProduct);
router.patch('/:id', authenticate, requireAdmin, updateProduct);
router.delete('/:id', authenticate, requireAdmin, deleteProduct);

export default router;
