import { connectDB } from '../config/db.js';
import { User, Product, Cart, CartItem } from '../models/index.js';

async function run() {
  try {
    await connectDB();
    const user = await User.findOne();
    const product = await Product.findOne();
    if (!user || !product) {
      console.log('No user or product found to test');
      process.exit(0);
    }
    console.log(`Using User ID: ${user.id}, Product ID: ${product.id}`);
    
    // Find or create cart
    let cart = await Cart.findOne({ where: { userId: user.id } });
    if (!cart) cart = await Cart.create({ userId: user.id });
    console.log(`Cart ID: ${cart.id}`);

    // Simulate payment clearing
    console.log('Clearing cart items...');
    await CartItem.destroy({ where: { cartId: cart.id } });

    // Try creating a new cart item
    console.log('Creating cart item...');
    const item = await CartItem.create({
      cartId: cart.id,
      productId: product.id,
      size: product.sizes[0] || 'M',
      quantity: 1,
      price: product.price,
    });
    console.log('Cart item created successfully:', item.toJSON());
  } catch (err) {
    console.error('Error in test:', err);
  }
  process.exit(0);
}

run();
