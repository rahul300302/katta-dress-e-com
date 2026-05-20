import { SiteSetting } from '../models/index.js';
import { AppError } from '../middleware/errorHandler.js';
import { DEFAULT_HERO_SLIDES } from '../constants/heroSlides.js';

const HERO_KEY = 'hero_slides';

function normalizeSlide(slide, index) {
  const media = String(slide.media || slide.image || '').trim();
  const mediaType = slide.mediaType === 'video' ? 'video' : 'image';
  return {
    id: slide.id || `slide-${index + 1}`,
    title: String(slide.title || '').trim(),
    subtitle: String(slide.subtitle || '').trim(),
    cta: String(slide.cta || 'Shop Now').trim(),
    href: String(slide.href || '/products').trim(),
    image: media,
    media,
    mediaType,
  };
}

function validateSlides(slides) {
  if (!Array.isArray(slides) || slides.length === 0) {
    throw new AppError('At least one hero slide is required', 400);
  }
  if (slides.length > 8) {
    throw new AppError('Maximum 8 hero slides allowed', 400);
  }
  return slides.map((s, i) => {
    const slide = normalizeSlide(s, i);
    if (!slide.title) throw new AppError(`Slide ${i + 1}: title is required`, 400);
    if (!slide.media) throw new AppError(`Slide ${i + 1}: media is required`, 400);
    return slide;
  });
}

async function getOrCreateHeroSetting() {
  let setting = await SiteSetting.findOne({ where: { key: HERO_KEY } });
  if (!setting) {
    setting = await SiteSetting.create({ key: HERO_KEY, value: DEFAULT_HERO_SLIDES });
  }
  return setting;
}

export async function getHeroSlides(_req, res, next) {
  try {
    const setting = await getOrCreateHeroSetting();
    res.json({ success: true, data: setting.value });
  } catch (err) {
    next(err);
  }
}

export async function updateHeroSlides(req, res, next) {
  try {
    const slides = validateSlides(req.body.slides);
    let setting = await SiteSetting.findOne({ where: { key: HERO_KEY } });
    if (!setting) {
      setting = await SiteSetting.create({ key: HERO_KEY, value: slides });
    } else {
      await setting.update({ value: slides });
    }
    res.json({ success: true, message: 'Hero carousel updated', data: setting.value });
  } catch (err) {
    next(err);
  }
}
