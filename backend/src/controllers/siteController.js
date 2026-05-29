import { SiteSetting } from '../models/index.js';
import { AppError } from '../middleware/errorHandler.js';
import { DEFAULT_HERO_SLIDES } from '../constants/heroSlides.js';
import { inferMediaType } from '../utils/mediaUtils.js';
import { DELIVERY_SETTINGS_KEY, getDeliverySettings } from '../services/deliverySettings.js';

const HERO_KEY = 'hero_slides';
const ANNOUNCEMENT_KEY = 'announcement_bar';
const DEFAULT_ANNOUNCEMENT =
  "Free shipping on orders above ₹1500 · Premium men's tees only";

function normalizeSlide(slide, index) {
  const media = String(slide.media || slide.image || '').trim();
  const mediaType = inferMediaType({ ...slide, media });
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

async function getOrCreateAnnouncementSetting() {
  let setting = await SiteSetting.findOne({ where: { key: ANNOUNCEMENT_KEY } });
  if (!setting) {
    setting = await SiteSetting.create({
      key: ANNOUNCEMENT_KEY,
      value: { text: DEFAULT_ANNOUNCEMENT },
    });
  }
  return setting;
}

export async function getAnnouncement(_req, res, next) {
  try {
    const setting = await getOrCreateAnnouncementSetting();
    const text = String(setting.value?.text || DEFAULT_ANNOUNCEMENT).trim();
    res.json({ success: true, data: { text: text || DEFAULT_ANNOUNCEMENT } });
  } catch (err) {
    next(err);
  }
}

export async function updateAnnouncement(req, res, next) {
  try {
    const text = String(req.body.text || '').trim();
    if (!text) throw new AppError('Announcement text is required', 400);
    if (text.length > 200) throw new AppError('Announcement text is too long (max 200)', 400);

    let setting = await SiteSetting.findOne({ where: { key: ANNOUNCEMENT_KEY } });
    if (!setting) {
      setting = await SiteSetting.create({ key: ANNOUNCEMENT_KEY, value: { text } });
    } else {
      await setting.update({ value: { text } });
    }
    res.json({ success: true, message: 'Announcement updated', data: setting.value });
  } catch (err) {
    next(err);
  }
}

const BRANDING_KEY = 'site_branding';
const DEFAULT_BRANDING = {
  name: 'KATTA',
  logo: '/logo.png',
  tagline: "Premium Men's T-Shirts",
};

async function getOrCreateBrandingSetting() {
  let setting = await SiteSetting.findOne({ where: { key: BRANDING_KEY } });
  if (!setting) {
    setting = await SiteSetting.create({
      key: BRANDING_KEY,
      value: DEFAULT_BRANDING,
    });
  }
  return setting;
}

export async function getBranding(_req, res, next) {
  try {
    const setting = await getOrCreateBrandingSetting();
    res.json({ success: true, data: setting.value });
  } catch (err) {
    next(err);
  }
}

export async function getDeliverySettingsHandler(_req, res, next) {
  try {
    const data = await getDeliverySettings();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function updateDeliverySettings(req, res, next) {
  try {
    const charge = Number(req.body.charge);
    const freeDeliveryMinOrder = Number(req.body.freeDeliveryMinOrder);

    if (Number.isNaN(charge) || charge < 0) {
      throw new AppError('Delivery charge must be 0 or greater', 400);
    }
    if (Number.isNaN(freeDeliveryMinOrder) || freeDeliveryMinOrder < 0) {
      throw new AppError('Free delivery minimum must be 0 or greater', 400);
    }
    if (charge > 9999) throw new AppError('Delivery charge is too high', 400);
    if (freeDeliveryMinOrder > 999999) {
      throw new AppError('Free delivery minimum is too high', 400);
    }

    const value = {
      charge: Math.round(charge * 100) / 100,
      freeDeliveryMinOrder: Math.round(freeDeliveryMinOrder * 100) / 100,
    };

    let setting = await SiteSetting.findOne({ where: { key: DELIVERY_SETTINGS_KEY } });
    if (!setting) {
      setting = await SiteSetting.create({ key: DELIVERY_SETTINGS_KEY, value });
    } else {
      await setting.update({ value });
    }

    res.json({
      success: true,
      message: 'Delivery settings updated',
      data: setting.value,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateBranding(req, res, next) {
  try {
    const { name, logo, tagline } = req.body;
    let setting = await SiteSetting.findOne({ where: { key: BRANDING_KEY } });
    const newValue = {
      name: String(name || 'KATTA').trim(),
      logo: String(logo || '/logo.png').trim(),
      tagline: String(tagline || '').trim(),
    };
    if (!setting) {
      setting = await SiteSetting.create({ key: BRANDING_KEY, value: newValue });
    } else {
      await setting.update({ value: newValue });
    }
    res.json({ success: true, message: 'Branding updated', data: setting.value });
  } catch (err) {
    next(err);
  }
}
