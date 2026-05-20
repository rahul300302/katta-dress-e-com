import { Router } from 'express';
import { uploadImage, uploadHeroMedia } from '../controllers/uploadController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { upload, uploadHeroMedia as uploadHeroMediaFile } from '../middleware/upload.js';

const router = Router();

router.post('/image', authenticate, requireAdmin, upload.single('image'), uploadImage);
router.post('/hero-media', authenticate, requireAdmin, uploadHeroMediaFile.single('media'), uploadHeroMedia);

export default router;
