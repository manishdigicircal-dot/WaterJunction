import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';
import Category from './models/Category.js';

dotenv.config();

// Test Cloudinary image URL
const TEST_IMAGE_URL = 'https://res.cloudinary.com/djv8wkhlz/image/upload/v1234567890/waterjunction/test-product.jpg';

async function testProductImage() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Get first category
    const category = await Category.findOne();
    if (!category) {
      console.error('❌ No category found. Please create a category first.');
      process.exit(1);
    }
    console.log('📂 Using category:', category.name);

    // Create test product with image
    console.log('\n📦 Creating test product with image...');
    const testProduct = await Product.create({
      name: 'Test Product with Image - ' + new Date().getTime(),
      slug: 'test-product-image-' + new Date().getTime(),
      category: category._id,
      description: 'This is a test product to verify image display',
      images: [TEST_IMAGE_URL],
      price: 999,
      mrp: 1499,
      stock: 10,
      isActive: true,
      isFeatured: false
    });

    console.log('✅ Test product created:', testProduct._id);
    console.log('📸 Product images:', testProduct.images);
    console.log('📸 First image URL:', testProduct.images[0]);

    // Now fetch it back with withImages=true query
    console.log('\n🔍 Testing fetch with withImages=true...');
    const pipeline = [
      { $match: { _id: testProduct._id } },
      {
        $project: {
          name: 1,
          slug: 1,
          images: { $slice: ['$images', 1] },
          price: 1,
          mrp: 1,
          category: 1
        }
      }
    ];

    const fetchedProducts = await Product.aggregate(pipeline);
    console.log('📦 Fetched products:', fetchedProducts.length);
    if (fetchedProducts.length > 0) {
      console.log('📸 Fetched product images:', fetchedProducts[0].images);
      console.log('📸 First fetched image:', fetchedProducts[0].images?.[0]);
    }

    // Also test regular find
    console.log('\n🔍 Testing regular find...');
    const regularFind = await Product.findById(testProduct._id).lean();
    console.log('📸 Regular find images:', regularFind.images);
    console.log('📸 First regular image:', regularFind.images?.[0]);

    console.log('\n✅ Test completed!');
    console.log('🧹 Cleaning up test product...');
    await Product.findByIdAndDelete(testProduct._id);
    console.log('✅ Test product deleted');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Test error:', error);
    process.exit(1);
  }
}

testProductImage();

import dotenv from 'dotenv';
import Product from './models/Product.js';
import Category from './models/Category.js';

dotenv.config();

// Test Cloudinary image URL
const TEST_IMAGE_URL = 'https://res.cloudinary.com/djv8wkhlz/image/upload/v1234567890/waterjunction/test-product.jpg';

async function testProductImage() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Get first category
    const category = await Category.findOne();
    if (!category) {
      console.error('❌ No category found. Please create a category first.');
      process.exit(1);
    }
    console.log('📂 Using category:', category.name);

    // Create test product with image
    console.log('\n📦 Creating test product with image...');
    const testProduct = await Product.create({
      name: 'Test Product with Image - ' + new Date().getTime(),
      slug: 'test-product-image-' + new Date().getTime(),
      category: category._id,
      description: 'This is a test product to verify image display',
      images: [TEST_IMAGE_URL],
      price: 999,
      mrp: 1499,
      stock: 10,
      isActive: true,
      isFeatured: false
    });

    console.log('✅ Test product created:', testProduct._id);
    console.log('📸 Product images:', testProduct.images);
    console.log('📸 First image URL:', testProduct.images[0]);

    // Now fetch it back with withImages=true query
    console.log('\n🔍 Testing fetch with withImages=true...');
    const pipeline = [
      { $match: { _id: testProduct._id } },
      {
        $project: {
          name: 1,
          slug: 1,
          images: { $slice: ['$images', 1] },
          price: 1,
          mrp: 1,
          category: 1
        }
      }
    ];

    const fetchedProducts = await Product.aggregate(pipeline);
    console.log('📦 Fetched products:', fetchedProducts.length);
    if (fetchedProducts.length > 0) {
      console.log('📸 Fetched product images:', fetchedProducts[0].images);
      console.log('📸 First fetched image:', fetchedProducts[0].images?.[0]);
    }

    // Also test regular find
    console.log('\n🔍 Testing regular find...');
    const regularFind = await Product.findById(testProduct._id).lean();
    console.log('📸 Regular find images:', regularFind.images);
    console.log('📸 First regular image:', regularFind.images?.[0]);

    console.log('\n✅ Test completed!');
    console.log('🧹 Cleaning up test product...');
    await Product.findByIdAndDelete(testProduct._id);
    console.log('✅ Test product deleted');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Test error:', error);
    process.exit(1);
  }
}

testProductImage();




