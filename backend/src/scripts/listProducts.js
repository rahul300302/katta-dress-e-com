import { connectDB } from '../config/db.js';
import { Product } from '../models/index.js';

async function run() {
  try {
    await connectDB();
    const products = await Product.findAll();
    console.log(JSON.stringify(products.map(p => ({
      id: p.id,
      name: p.name,
      images: p.images
    })), null, 2));
  } catch (err) {
    console.error(err);
  }
  process.exit(0);
}

run();
