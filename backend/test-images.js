// Test script to verify images in API response
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';

dotenv.config();

const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

if (!mongoUri) {
  console.error('❌ MONGO_URI or MONGODB_URI not found');
  process.exit(1);
}

async function testImages() {
  try {
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Get a sample product
    const product = await Product.findOne().lean();
    
    if (!product) {
      console.log('❌ No products found in database');
      process.exit(0);
    }

    console.log('📦 Product:', product.name);
    console.log('📸 Images Array Length:', product.images?.length || 0);
    console.log('\n--- Image Details ---');
    
    if (product.images && product.images.length > 0) {
      product.images.forEach((img, idx) => {
        console.log(`\nImage ${idx + 1}:`);
        console.log('  First 100 chars:', img.substring(0, 100));
        console.log('  Format:', img.startsWith('data:image/svg+xml;base64') ? '✅ Base64 SVG' : 
                              img.startsWith('data:image/svg+xml,') ? '⚠️  URL-encoded SVG (old format)' :
                              img.startsWith('data:image') ? '✅ Data URL' : '❌ Unknown format');
        console.log('  Length:', img.length, 'characters');
      });
    } else {
      console.log('❌ No images in product');
    }

    // Test if it's a valid data URL that browsers can display
    if (product.images?.[0]) {
      const firstImage = product.images[0];
      const isValidDataURL = firstImage.match(/^data:image\/[^;]+;(base64,|charset=utf-8;base64,).+/);
      console.log('\n✅ Valid data URL format:', isValidDataURL ? 'YES' : 'NO');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testImages();


import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';

dotenv.config();

const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

if (!mongoUri) {
  console.error('❌ MONGO_URI or MONGODB_URI not found');
  process.exit(1);
}

async function testImages() {
  try {
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Get a sample product
    const product = await Product.findOne().lean();
    
    if (!product) {
      console.log('❌ No products found in database');
      process.exit(0);
    }

    console.log('📦 Product:', product.name);
    console.log('📸 Images Array Length:', product.images?.length || 0);
    console.log('\n--- Image Details ---');
    
    if (product.images && product.images.length > 0) {
      product.images.forEach((img, idx) => {
        console.log(`\nImage ${idx + 1}:`);
        console.log('  First 100 chars:', img.substring(0, 100));
        console.log('  Format:', img.startsWith('data:image/svg+xml;base64') ? '✅ Base64 SVG' : 
                              img.startsWith('data:image/svg+xml,') ? '⚠️  URL-encoded SVG (old format)' :
                              img.startsWith('data:image') ? '✅ Data URL' : '❌ Unknown format');
        console.log('  Length:', img.length, 'characters');
      });
    } else {
      console.log('❌ No images in product');
    }

    // Test if it's a valid data URL that browsers can display
    if (product.images?.[0]) {
      const firstImage = product.images[0];
      const isValidDataURL = firstImage.match(/^data:image\/[^;]+;(base64,|charset=utf-8;base64,).+/);
      console.log('\n✅ Valid data URL format:', isValidDataURL ? 'YES' : 'NO');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testImages();



