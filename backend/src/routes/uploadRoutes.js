import { Router } from 'express';
import { uploadImage } from '../controllers/uploadController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();

router.post('/image', authenticate, requireAdmin, upload.single('image'), uploadImage);

export default router;
