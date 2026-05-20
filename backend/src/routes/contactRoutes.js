import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { submitFeedback } from '../controllers/contactController.js';
import { validate, feedbackSchema } from '../validations/schemas.js';

const router = Router();

const feedbackLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many feedback submissions. Try again later.' },
});

router.post('/feedback', feedbackLimiter, validate(feedbackSchema), submitFeedback);

export default router;
