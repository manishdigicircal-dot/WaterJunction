import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';

dotenv.config();

async function checkProducts() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all products
    const products = await Product.find({}).select('name images').lean().limit(10);
    
    console.log(`📦 Found ${products.length} products:\n`);
    
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   Images: ${product.images?.length || 0}`);
      if (product.images && product.images.length > 0) {
        console.log(`   First image: ${product.images[0].substring(0, 80)}...`);
      } else {
        console.log(`   ❌ NO IMAGES`);
      }
      console.log('');
    });
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkProducts();

