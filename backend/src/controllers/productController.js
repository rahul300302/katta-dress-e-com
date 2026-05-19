import { Op } from 'sequelize';
import { sequelize, Product } from '../models/index.js';
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

function parseProductBody(body) {
  const sizeStock = parseSizeStockInput(body.sizeStock, body.sizes, body.stock);
  const sizes = Object.keys(sizeStock);
  const stock = Object.values(sizeStock).reduce((sum, n) => sum + n, 0);
  return {
    ...body,
    price: Number(body.price),
    offerPrice: body.offerPrice != null ? Number(body.offerPrice) : null,
    sizeStock,
    sizes,
    stock,
    images: body.images || [],
    colors: body.colors || [],
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
  return row;
}

export async function listProducts(req, res, next) {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(48, Math.max(1, Number(req.query.limit) || 12));
    const where = buildWhere(req.query);

    let products = await Product.findAll({
      where,
      order: buildOrder(req.query.sort),
    });

    if (req.query.size) {
      const size = req.query.size;
      products = products.filter((p) => productOffersSize(p, size));
      if (req.query.inStock === 'true') {
        products = products.filter((p) => stockForSize(p, size) > 0);
      }
    }
    if (req.query.color) {
      products = products.filter((p) => (p.colors || []).includes(req.query.color));
    }
    if (req.query.minPrice) {
      const min = Number(req.query.minPrice);
      products = products.filter((p) => getEffective(p) >= min);
    }
    if (req.query.maxPrice) {
      const max = Number(req.query.maxPrice);
      products = products.filter((p) => getEffective(p) <= max);
    }

    const total = products.length;
    const start = (page - 1) * limit;
    const pageRows = products.slice(start, start + limit).map(numericFields);

    res.json({
      success: true,
      data: {
        products: pageRows,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
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
    res.json({ success: true, data: numericFields(product) });
  } catch (err) {
    next(err);
  }
}

export async function createProduct(req, res, next) {
  try {
    const product = await Product.create(parseProductBody(req.body));
    res.status(201).json({ success: true, message: 'Product created', data: numericFields(product) });
  } catch (err) {
    next(err);
  }
}

export async function updateProduct(req, res, next) {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) throw new AppError('Product not found', 404);
    await product.update(parseProductBody({ ...product.toJSON(), ...req.body }));
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
