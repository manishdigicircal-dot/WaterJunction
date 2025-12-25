import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';

dotenv.config();

// Helper function to create SVG placeholder image
const createPlaceholderImage = (text, bgColor = '0EA5E9') => {
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><rect width="600" height="400" fill="#${bgColor}"/><text x="50%" y="50%" font-size="32" fill="white" text-anchor="middle" dominant-baseline="middle" font-weight="bold">${text}</text></svg>`;
  const base64 = Buffer.from(svgContent).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
};

const categories = [
  { name: 'Water Purifiers', description: 'Advanced water purifiers for clean drinking water', image: createPlaceholderImage('Water Purifiers', '0EA5E9') },
  { name: 'Water Dispensers', description: 'Hot and cold water dispensers', image: createPlaceholderImage('Water Dispensers', '10B981') },
  { name: 'Water Filters', description: 'Water filtration systems and cartridges', image: createPlaceholderImage('Water Filters', 'F59E0B') },
  { name: 'Water Softeners', description: 'Water softening solutions', image: createPlaceholderImage('Water Softeners', '8B5CF6') },
  { name: 'Water Storage Tanks', description: 'Water storage solutions', image: createPlaceholderImage('Storage Tanks', '64748B') }
];

const products = [
  {
    name: 'RO+UV+UF Water Purifier 10L',
    description: 'Advanced 7-stage purification with RO, UV, and UF technology. Perfect for families.',
    price: 14999,
    mrp: 19999,
    stock: 50,
    category: 'Water Purifiers',
    images: [createPlaceholderImage('Water Purifier', '0EA5E9')],
    weight: 8.5,
    brand: 'WaterJunction'
  },
  {
    name: 'RO Water Purifier 8L',
    description: '6-stage RO purification system with mineralizer. Ideal for medium families.',
    price: 11999,
    mrp: 15999,
    stock: 40,
    category: 'Water Purifiers',
    images: [createPlaceholderImage('RO Purifier', '0EA5E9')],
    weight: 6.2,
    brand: 'WaterJunction'
  },
  {
    name: 'Hot & Cold Water Dispenser',
    description: 'Instant hot and cold water with child lock safety feature.',
    price: 8999,
    mrp: 11999,
    stock: 25,
    category: 'Water Dispensers',
    images: [createPlaceholderImage('Water Dispenser', '10B981')],
    weight: 12.0,
    brand: 'WaterJunction'
  },
  {
    name: 'UV Water Filter Cartridge',
    description: 'Replacement UV filter cartridge compatible with all major brands.',
    price: 1999,
    mrp: 2499,
    stock: 100,
    category: 'Water Filters',
    images: [createPlaceholderImage('Filter Cartridge', 'F59E0B')],
    weight: 0.5,
    brand: 'Generic'
  },
  {
    name: 'Water Softener System',
    description: 'Ion exchange water softener for hard water treatment.',
    price: 24999,
    mrp: 29999,
    stock: 15,
    category: 'Water Softeners',
    images: [createPlaceholderImage('Water Softener', '8B5CF6')],
    weight: 25.0,
    brand: 'WaterJunction'
  }
];

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB Connected');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});

    // Create Admin User
    console.log('👤 Creating admin user...');
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@waterjunction.com',
      password: 'admin123',
      role: 'admin',
      isEmailVerified: true,
      authProvider: 'email'
    });
    console.log('✅ Admin created:', adminUser.email);

    // Create Test User
    console.log('👤 Creating test user...');
    const testUser = await User.create({
      name: 'Test User',
      email: 'user@waterjunction.com',
      password: 'user123',
      role: 'user',
      isEmailVerified: true,
      authProvider: 'email'
    });
    console.log('✅ Test user created:', testUser.email);

    // Create Categories
    console.log('📁 Creating categories...');
    const createdCategories = {};
    for (const cat of categories) {
      const slug = cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      const category = await Category.create({
        name: cat.name,
        slug: slug,
        description: cat.description,
        image: cat.image,
        order: categories.indexOf(cat)
      });
      createdCategories[cat.name] = category;
      console.log(`✅ Category created: ${category.name}`);
    }

    // Create Products
    console.log('📦 Creating products...');
    for (const prod of products) {
      const category = createdCategories[prod.category];
      if (!category) {
        console.log(`⚠️  Category not found for product: ${prod.name}`);
        continue;
      }

      const slug = prod.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      const product = await Product.create({
        ...prod,
        slug: slug,
        category: category._id,
        isActive: true,
        isFeatured: Math.random() > 0.5
      });
      console.log(`✅ Product created: ${product.name}`);
    }

    console.log('\n🎉 Seeding completed successfully!');
    console.log('\n📝 Login Credentials:');
    console.log('Admin: admin@waterjunction.com / admin123');
    console.log('User: user@waterjunction.com / user123');
    console.log('\n✨ Database seeded with sample data!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedData();