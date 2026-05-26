import { Router } from 'express';
import {
  getUserFavorites,
  toggleFavorite,
  checkFavorites,
  removeFavorite,
} from '../controllers/favoriteController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Get all user favorites
router.get('/', authenticate, getUserFavorites);

// Check which products are favorited
router.post('/check', authenticate, checkFavorites);

// Toggle favorite (add/remove)
router.post('/:productId', authenticate, toggleFavorite);

// Remove favorite
router.delete('/:productId', authenticate, removeFavorite);

export default router;
