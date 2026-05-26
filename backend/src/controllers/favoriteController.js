import { Favorite, Product } from '../models/index.js';
import { AppError } from '../middleware/errorHandler.js';
import { toApiList } from '../utils/serialize.js';

export async function getUserFavorites(req, res, next) {
  try {
    const userId = req.user.id;
    
    const favorites = await Favorite.findAll({
      where: { userId },
      include: [
        {
          model: Product,
          required: true,
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    const products = favorites.map((fav) => {
      const product = fav.Product.toJSON();
      return {
        ...product,
        _id: product.id,
      };
    });

    res.json({
      success: true,
      data: products,
    });
  } catch (error) {
    next(error);
  }
}

export async function toggleFavorite(req, res, next) {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    // Check if product exists
    const product = await Product.findByPk(productId);
    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    // Check if already favorited
    const existing = await Favorite.findOne({
      where: { userId, productId: parseInt(productId) },
    });

    if (existing) {
      // Remove favorite
      await existing.destroy();
      res.json({
        success: true,
        message: 'Removed from favorites',
        isFavorite: false,
      });
    } else {
      // Add favorite
      await Favorite.create({
        userId,
        productId: parseInt(productId),
      });
      res.json({
        success: true,
        message: 'Added to favorites',
        isFavorite: true,
      });
    }
  } catch (error) {
    next(error);
  }
}

export async function checkFavorites(req, res, next) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.json({ success: true, data: {} });
    }

    const { productIds } = req.body;
    if (!Array.isArray(productIds)) {
      return next(new AppError('productIds must be an array', 400));
    }

    const favorites = await Favorite.findAll({
      where: {
        userId,
        productId: productIds,
      },
      attributes: ['productId'],
    });

    const favoriteMap = {};
    favorites.forEach((fav) => {
      favoriteMap[fav.productId] = true;
    });

    res.json({
      success: true,
      data: favoriteMap,
    });
  } catch (error) {
    next(error);
  }
}

export async function removeFavorite(req, res, next) {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    const favorite = await Favorite.findOne({
      where: { userId, productId: parseInt(productId) },
    });

    if (!favorite) {
      return next(new AppError('Favorite not found', 404));
    }

    await favorite.destroy();
    res.json({
      success: true,
      message: 'Removed from favorites',
    });
  } catch (error) {
    next(error);
  }
}
