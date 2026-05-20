import { v2 as cloudinary } from 'cloudinary';
import env from './env.js';

let configured = false;

export function isCloudinaryConfigured() {
  return Boolean(
    env.cloudinary.cloudName && env.cloudinary.apiKey && env.cloudinary.apiSecret
  );
}

export function getCloudinary() {
  if (!isCloudinaryConfigured()) {
    throw new Error('Cloudinary is not configured');
  }
  if (!configured) {
    cloudinary.config({
      cloud_name: env.cloudinary.cloudName,
      api_key: env.cloudinary.apiKey,
      api_secret: env.cloudinary.apiSecret,
    });
    configured = true;
  }
  return cloudinary;
}

export async function uploadToCloudinary(file) {
  const cld = getCloudinary();
  return new Promise((resolve, reject) => {
    const stream = cld.uploader.upload_stream(
      {
        folder: 'katta/products',
        resource_type: 'image',
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    stream.end(file.buffer);
  });
}

export async function uploadMediaToCloudinary(file, folder = 'katta/hero') {
  const cld = getCloudinary();
  const isVideo = file?.mimetype?.startsWith('video/');
  return new Promise((resolve, reject) => {
    const stream = cld.uploader.upload_stream(
      {
        folder,
        resource_type: isVideo ? 'video' : 'image',
      },
      (error, result) => {
        if (error) reject(error);
        else {
          resolve({
            url: result.secure_url,
            mediaType: isVideo ? 'video' : 'image',
          });
        }
      }
    );
    stream.end(file.buffer);
  });
}
