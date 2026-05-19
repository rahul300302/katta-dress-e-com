import { User, Product, Order, OrderItem, sequelize } from '../models/index.js';
import { formatOrder } from '../utils/cartHelpers.js';
import { AppError } from '../middleware/errorHandler.js';

function formatUser(user) {
  return {
    _id: String(user.id),
    name: user.name,
    email: user.email,
    avatar: user.avatar || '',
    role: user.role,
    createdAt: user.createdAt,
  };
}

export async function getDashboard(_req, res, next) {
  try {
    const [users, products, orders, revenueRow] = await Promise.all([
      User.count(),
      Product.count(),
      Order.count(),
      Order.findOne({
        attributes: [[sequelize.fn('SUM', sequelize.col('totalAmount')), 'total']],
        where: { paymentStatus: 'paid' },
        raw: true,
      }),
    ]);

    const recentOrdersRaw = await Order.findAll({
      order: [['createdAt', 'DESC']],
      limit: 10,
      include: [{ model: User, attributes: ['id', 'name', 'email'], required: false }],
    });

    const recentOrders = await Promise.all(
      recentOrdersRaw.map(async (order) => {
        const items = await OrderItem.findAll({ where: { orderId: order.id } });
        const formatted = formatOrder(order, items);
        if (order.User) {
          formatted.userId = {
            _id: String(order.User.id),
            name: order.User.name,
            email: order.User.email,
          };
        }
        return formatted;
      })
    );

    res.json({
      success: true,
      data: {
        stats: {
          users,
          products,
          orders,
          revenue: Number(revenueRow?.total || 0),
        },
        recentOrders,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getAllUsers(_req, res, next) {
  try {
    const users = await User.findAll({
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'name', 'email', 'avatar', 'role', 'createdAt'],
    });
    res.json({ success: true, data: users.map(formatUser) });
  } catch (err) {
    next(err);
  }
}

export async function updateUserRole(req, res, next) {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      throw new AppError('Invalid role', 400);
    }
    const user = await User.findByPk(req.params.id);
    if (!user) throw new AppError('User not found', 404);
    await user.update({ role });
    res.json({ success: true, data: formatUser(user) });
  } catch (err) {
    next(err);
  }
}
