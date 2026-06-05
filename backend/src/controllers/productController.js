import { Op } from 'sequelize';
import { sequelize, Product, CartItem, OrderItem, Favorite } from '../models/index.js';
import { AppError } from '../middleware/errorHandler.js';
import { toApi, toApiList } from '../utils/serialize.js';
import {
  normalizeProductRecord,
  parseSizeStockInput,
  productOffersSize,
  stockForSize,
} from '../utils/productStock.js';

function isTruthyQuery(value) {
  return value === true || value === 'true' || value === '1' || value === 1;
}

function buildWhere(query) {
  const where = {};
  if (query.collection) where.collection = { [Op.iLike]: `%${query.collection}%` };
  if (query.category) where.category = { [Op.iLike]: `%${query.category}%` };
  if (isTruthyQuery(query.isHotSale)) where.isHotSale = true;
  if (isTruthyQuery(query.isOffer)) where.isOffer = true;
  if (isTruthyQuery(query.isNewArrival)) where.isNewArrival = true;
  if (isTruthyQuery(query.isBestSeller)) where.isBestSeller = true;
  if (query.q) {
    where[Op.or] = [
      { name: { [Op.iLike]: `%${query.q}%` } },
      { description: { [Op.iLike]: `%${query.q}%` } },
      { collection: { [Op.iLike]: `%${query.q}%` } },
    ];
  }
  if (query.size) {
    where.sizes = { [Op.contains]: [query.size] };
  }
  if (query.color) {
    where.colors = { [Op.contains]: [query.color] };
  }
  if (query.inStock === 'true') {
    where.stock = { [Op.gt]: 0 };
  }

  const priceConditions = [];
  if (query.minPrice) {
    const min = Number(query.minPrice);
    if (!Number.isNaN(min)) {
      priceConditions.push(
        sequelize.where(
          sequelize.literal('COALESCE("offerPrice", "price")'),
          { [Op.gte]: min }
        )
      );
    }
  }
  if (query.maxPrice) {
    const max = Number(query.maxPrice);
    if (!Number.isNaN(max)) {
      priceConditions.push(
        sequelize.where(
          sequelize.literal('COALESCE("offerPrice", "price")'),
          { [Op.lte]: max }
        )
      );
    }
  }
  if (priceConditions.length) {
    where[Op.and] = [...(where[Op.and] || []), ...priceConditions];
  }

  return where;
}

function buildOrder(sort) {
  switch (sort) {
    case 'price_asc':
      return [[sequelize.literal('COALESCE("offerPrice", "price")'), 'ASC']];
    case 'price_desc':
      return [[sequelize.literal('COALESCE("offerPrice", "price")'), 'DESC']];
    default:
      return [['createdAt', 'DESC']];
  }
}

function normalizeColorVariants(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((v) => ({
      name: String(v?.name || '').trim(),
      image: String(v?.image || '').trim(),
    }))
    .filter((v) => v.name && v.image);
}

function parseProductBody(body) {
  const sizeStock = parseSizeStockInput(body.sizeStock, body.sizes, body.stock);
  const sizes = Object.keys(sizeStock);
  const stock = Object.values(sizeStock).reduce((sum, n) => sum + n, 0);

  const productUploadImages = Array.isArray(body.productUploadImages)
    ? body.productUploadImages
    : Array.isArray(body.images)
      ? body.images
      : [];
  const colorBasedImages = Array.isArray(body.colorBasedImages) ? body.colorBasedImages : [];
  let colorVariants = normalizeColorVariants(body.colorVariants);
  let colors = Array.isArray(body.colors) ? body.colors : [];

  if (!colorVariants.length && colorBasedImages.length && colors.length) {
    colorVariants = colors
      .map((name, i) => ({
        name: String(name).trim(),
        image: String(colorBasedImages[i] || colorBasedImages[0] || '').trim(),
      }))
      .filter((v) => v.name && v.image);
  } else if (!colorVariants.length && colorBasedImages.length) {
    colorVariants = colorBasedImages
      .map((image, i) => ({
        name: `Color ${i + 1}`,
        image: String(image).trim(),
      }))
      .filter((v) => v.image);
  }

  if (colorVariants.length && !colors.length) {
    colors = colorVariants.map((v) => v.name);
  }

  return {
    ...body,
    price: Number(body.price),
    offerPrice: body.offerPrice != null ? Number(body.offerPrice) : null,
    sizeStock,
    sizes,
    stock,
    images: productUploadImages,
    colors,
    colorVariants,
    isHotSale: Boolean(body.isHotSale),
    isOffer: Boolean(body.isOffer),
    isNewArrival: Boolean(body.isNewArrival),
    isBestSeller: Boolean(body.isBestSeller),
  };
}

function numericFields(p) {
  const row = normalizeProductRecord(toApi(p));
  row.price = Number(row.price);
  if (row.offerPrice != null) row.offerPrice = Number(row.offerPrice);
  row.productUploadImages = Array.isArray(row.images) ? row.images : [];
  row.colorBasedImages = Array.isArray(row.colorVariants)
    ? row.colorVariants.map((v) => v?.image).filter(Boolean)
    : [];
  return row;
}

export async function listProducts(req, res, next) {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(48, Math.max(1, Number(req.query.limit) || 12));
    const where = buildWhere(req.query);
    const offset = (page - 1) * limit;

    const { count, rows } = await Product.findAndCountAll({
      where,
      order: buildOrder(req.query.sort),
      limit,
      offset,
    });

    res.set('Cache-Control', 'public, max-age=60, s-maxage=120, stale-while-revalidate=60');
    res.json({
      success: true,
      data: {
        products: (rows || []).map(numericFields),
        pagination: { page, limit, total: Number(count || 0), pages: Math.ceil(Number(count || 0) / limit) || 1 },
      },
    });
  } catch (err) {
    next(err);
  }
}

function getEffective(p) {
  const price = Number(p.price);
  const offer = p.offerPrice != null ? Number(p.offerPrice) : null;
  return offer != null && offer < price ? offer : price;
}

export async function getProduct(req, res, next) {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) throw new AppError('Product not found', 404);
    res.set('Cache-Control', 'public, max-age=60, s-maxage=120, stale-while-revalidate=60');
    res.json({ success: true, data: numericFields(product) });
  } catch (err) {
    next(err);
  }
}

export async function createProduct(req, res, next) {
  try {
    const body = parseProductBody(req.body);
    
    // Validate that product has at least one image source
    const hasImages = Array.isArray(body.images) && body.images.length > 0;
    const hasColorVariants = Array.isArray(body.colorVariants) && body.colorVariants.some(v => v?.image);
    
    if (!hasImages && !hasColorVariants) {
      throw new AppError('Product must have at least one image or color variant with image', 400);
    }
    
    const product = await Product.create(body);
    res.status(201).json({ success: true, message: 'Product created', data: numericFields(product) });
  } catch (err) {
    next(err);
  }
}

export async function updateProduct(req, res, next) {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) throw new AppError('Product not found', 404);
    
    const body = parseProductBody({ ...product.toJSON(), ...req.body });
    
    // Validate that product has at least one image source
    const hasImages = Array.isArray(body.images) && body.images.length > 0;
    const hasColorVariants = Array.isArray(body.colorVariants) && body.colorVariants.some(v => v?.image);
    
    if (!hasImages && !hasColorVariants) {
      throw new AppError('Product must have at least one image or color variant with image', 400);
    }
    
    await product.update(body);
    await product.reload();
    res.json({ success: true, message: 'Product updated', data: numericFields(product) });
  } catch (err) {
    next(err);
  }
}

export async function deleteProduct(req, res, next) {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) throw new AppError('Product not found', 404);
    
    // Delete related records to avoid foreign key constraint errors
    await CartItem.destroy({ where: { productId: req.params.id } });
    await OrderItem.destroy({ where: { productId: req.params.id } });
    await Favorite.destroy({ where: { productId: req.params.id } });
    
    // Now delete the product
    await product.destroy();
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    next(err);
  }
}

export async function getHomeSections(_req, res, next) {
  try {
    const [hotSales, offers, newArrivals, bestSellers, collection] = await Promise.all([
      Product.findAll({ where: { isHotSale: true }, order: [['createdAt', 'DESC']], limit: 8 }),
      Product.findAll({ where: { isOffer: true }, order: [['createdAt', 'DESC']], limit: 8 }),
      Product.findAll({ where: { isNewArrival: true }, order: [['createdAt', 'DESC']], limit: 8 }),
      Product.findAll({ where: { isBestSeller: true }, order: [['createdAt', 'DESC']], limit: 8 }),
      Product.findAll({ order: [['createdAt', 'DESC']], limit: 12 }),
    ]);
    res.set('Cache-Control', 'public, max-age=60, s-maxage=120, stale-while-revalidate=60');
    res.json({
      success: true,
      data: {
        hotSales: toApiList(hotSales).map(numericFields),
        offers: toApiList(offers).map(numericFields),
        newArrivals: toApiList(newArrivals).map(numericFields),
        bestSellers: toApiList(bestSellers).map(numericFields),
        collection: toApiList(collection).map(numericFields),
      },
    });
  } catch (err) {
    next(err);
  }
}
