import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const User = sequelize.define(
  'User',
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    googleId: { type: DataTypes.STRING, allowNull: false, unique: true },
    avatar: { type: DataTypes.STRING, defaultValue: '' },
    role: { type: DataTypes.ENUM('user', 'admin'), defaultValue: 'user' },
  },
  { tableName: 'users', timestamps: true }
);

const Product = sequelize.define(
  'Product',
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, defaultValue: '' },
    images: { type: DataTypes.JSONB, defaultValue: [] },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    offerPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    category: { type: DataTypes.STRING, defaultValue: 'T-Shirt' },
    collection: { type: DataTypes.STRING, defaultValue: 'Essentials' },
    sizes: { type: DataTypes.JSONB, defaultValue: [] },
    sizeStock: { type: DataTypes.JSONB, defaultValue: {} },
    colors: { type: DataTypes.JSONB, defaultValue: [] },
    stock: { type: DataTypes.INTEGER, defaultValue: 0 },
    isHotSale: { type: DataTypes.BOOLEAN, defaultValue: false },
    isOffer: { type: DataTypes.BOOLEAN, defaultValue: false },
    isNewArrival: { type: DataTypes.BOOLEAN, defaultValue: false },
    isBestSeller: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  { tableName: 'products', timestamps: true }
);

const Cart = sequelize.define(
  'Cart',
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false, unique: true },
  },
  { tableName: 'carts', timestamps: true }
);

const CartItem = sequelize.define(
  'CartItem',
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    cartId: { type: DataTypes.INTEGER, allowNull: false },
    productId: { type: DataTypes.INTEGER, allowNull: false },
    size: { type: DataTypes.STRING, allowNull: false },
    quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  },
  { tableName: 'cart_items', timestamps: true }
);

const Order = sequelize.define(
  'Order',
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    deliveryAddress: { type: DataTypes.JSONB, allowNull: false },
    subtotal: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    discount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    deliveryCharge: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    totalAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    paymentMethod: { type: DataTypes.STRING, defaultValue: 'razorpay' },
    razorpayOrderId: { type: DataTypes.STRING },
    razorpayPaymentId: { type: DataTypes.STRING },
    paymentStatus: {
      type: DataTypes.ENUM('pending', 'paid', 'failed'),
      defaultValue: 'pending',
    },
    orderStatus: {
      type: DataTypes.ENUM('placed', 'confirmed', 'shipped', 'delivered', 'cancelled'),
      defaultValue: 'placed',
    },
  },
  { tableName: 'orders', timestamps: true }
);

const OrderItem = sequelize.define(
  'OrderItem',
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    orderId: { type: DataTypes.INTEGER, allowNull: false },
    productId: { type: DataTypes.INTEGER, allowNull: false },
    name: { type: DataTypes.STRING },
    image: { type: DataTypes.STRING },
    size: { type: DataTypes.STRING },
    quantity: { type: DataTypes.INTEGER },
    price: { type: DataTypes.DECIMAL(10, 2) },
  },
  { tableName: 'order_items', timestamps: false }
);

User.hasMany(Cart, { foreignKey: 'userId' });
Cart.belongsTo(User, { foreignKey: 'userId' });
Cart.hasMany(CartItem, { foreignKey: 'cartId', as: 'items', onDelete: 'CASCADE' });
CartItem.belongsTo(Cart, { foreignKey: 'cartId' });
CartItem.belongsTo(Product, { foreignKey: 'productId' });

User.hasMany(Order, { foreignKey: 'userId' });
Order.belongsTo(User, { foreignKey: 'userId' });
Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items', onDelete: 'CASCADE' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });

export { User, Product, Cart, CartItem, Order, OrderItem, sequelize };

export async function syncDatabase() {
  await sequelize.sync({ alter: true });
  console.log('Database tables synced');
}
