import { uploadToCloudinary, isCloudinaryConfigured } from '../config/cloudinary.js';
import { AppError } from '../middleware/errorHandler.js';

export async function uploadImage(req, res, next) {
  try {
    if (!isCloudinaryConfigured()) {
      throw new AppError('Image upload unavailable — configure Cloudinary in .env', 503);
    }
    if (!req.file) throw new AppError('No file uploaded', 400);
    const url = await uploadToCloudinary(req.file);
    res.json({ success: true, data: { url } });
  } catch (err) {
    next(err);
  }
}
