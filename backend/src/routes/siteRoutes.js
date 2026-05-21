import { Router } from 'express';
import {
  getHeroSlides,
  updateHeroSlides,
  getAnnouncement,
  updateAnnouncement,
  getBranding,
  updateBranding,
} from '../controllers/siteController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/hero', getHeroSlides);
router.put('/hero', authenticate, requireAdmin, updateHeroSlides);
router.get('/announcement', getAnnouncement);
router.put('/announcement', authenticate, requireAdmin, updateAnnouncement);
router.get('/branding', getBranding);
router.put('/branding', authenticate, requireAdmin, updateBranding);

export default router;
