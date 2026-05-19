import { Router } from 'express';
import { getHeroSlides, updateHeroSlides } from '../controllers/siteController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/hero', getHeroSlides);
router.put('/hero', authenticate, requireAdmin, updateHeroSlides);

export default router;
