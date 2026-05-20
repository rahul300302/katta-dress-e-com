import { AppError } from '../middleware/errorHandler.js';
import { sendFeedbackEmail } from '../services/emailService.js';

export async function submitFeedback(req, res, next) {
  try {
    const { name, email, message } = req.body;
    const sent = await sendFeedbackEmail({
      name,
      email: email || undefined,
      message,
    });

    if (!sent) {
      throw new AppError(
        'Feedback could not be sent right now. Please email kattaclothings@gmail.com directly.',
        503
      );
    }

    res.json({ success: true, message: 'Thank you! Your feedback has been sent.' });
  } catch (err) {
    next(err);
  }
}
