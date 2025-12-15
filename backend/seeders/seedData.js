import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';

dotenv.config();

const categories = [
  { name: 'Water Purifiers', description: 'Advanced water purifiers for clean drinking water' },
  { name: 'Water Dispensers', description: 'Hot and cold water dispensers' },
  { name: 'Water Filters', description: 'Water filtration systems and cartridges' },
  { name: 'Water Softeners', description: 'Water softening solutions' },
  { name: 'Water Storage Tanks', description: 'Water storage solutions' },
  { name: 'Pumps', description: 'Water pumps and motors' },
  { name: 'Accessories', description: 'Water treatment accessories' }
];

const products = [
  {
    name: 'RO+UV+UF Water Purifier 10L',
    description: 'Advanced 7-stage purification with RO, UV, and UF technology. Perfect for families.',
    price: 14999,
    mrp: 19999,
    stock: 50,
    category: 'Water Purifiers',
    images: [],
    specifications: {
      performanceFeatures: {
        'Purification Technology': 'RO + UV + UF',
        'Capacity': '10 Liters',
        'Stages': '7 Stage',
        'Purification Rate': '15 L/hour'
      },
      warranty: {
        'Manufacturer Warranty': '1 Year',
        'Service Warranty': '2 Years'
      },
      general: {
        'Installation': 'Free',
        'Color': 'White',
        'Material': 'Plastic & Steel'
      },
      dimensions: {
        'Height': '45 cm',
        'Width': '30 cm',
        'Depth': '25 cm',
        'Weight': '12 kg'
      }
    }
  },
  {
    name: 'RO Water Purifier 8L',
    description: '6-stage RO purification system with mineralizer. Ideal for medium families.',
    price: 11999,
    mrp: 15999,
    stock: 40,
    category: 'Water Purifiers',
    specifications: {
      performanceFeatures: {
        'Purification Technology': 'RO',
        'Capacity': '8 Liters',
        'Stages': '6 Stage'
      },
      warranty: {
        'Manufacturer Warranty': '1 Year'
      }
    }
  },
  {
    name: 'UV Water Purifier 12L',
    description: 'UV purification with carbon filter. Perfect for municipal water supply.',
    price: 8999,
    mrp: 12999,
    stock: 35,
    category: 'Water Purifiers'
  },
  {
    name: 'Hot & Cold Water Dispenser',
    description: 'Instant hot and cold water with child lock safety feature.',
    price: 8999,
    mrp: 11999,
    stock: 25,
    category: 'Water Dispensers',
    specifications: {
      general: {
        'Hot Water Temperature': '90°C',
        'Cold Water Temperature': '5°C',
        'Capacity': '3 Liters'
      }
    }
  },
  {
    name: 'UV Water Filter Cartridge',
    description: 'Replacement UV filter cartridge compatible with all major brands.',
    price: 1999,
    mrp: 2499,
    stock: 100,
    category: 'Water Filters'
  },
  {
    name: 'RO Membrane Filter',
    description: 'High-quality RO membrane for maximum water purification.',
    price: 1499,
    mrp: 1999,
    stock: 150,
    category: 'Water Filters'
  },
  {
    name: 'Water Softener System',
    description: 'Ion exchange water softener for hard water treatment.',
    price: 24999,
    mrp: 29999,
    stock: 15,
    category: 'Water Softeners'
  },
  {
    name: 'Stainless Steel Water Tank 500L',
    description: 'Food-grade stainless steel water storage tank.',
    price: 8999,
    mrp: 11999,
    stock: 20,
    category: 'Water Storage Tanks',
    specifications: {
      dimensions: {
        'Capacity': '500 Liters',
        'Material': 'Food Grade SS 304'
      }
    }
  },
  {
    name: 'Submersible Water Pump 1HP',
    description: 'Automatic submersible pump with overload protection.',
    price: 5999,
    mrp: 7999,
    stock: 30,
    category: 'Pumps'
  },
  {
    name: 'Water Testing Kit',
    description: 'Complete water quality testing kit with TDS meter.',
    price: 499,
    mrp: 799,
    stock: 200,
    category: 'Accessories'
  }
];

const coupons = [
  {
    code: 'WELCOME10',
    description: '10% off on first order',
    type: 'percentage',
    value: 10,
    minOrderValue: 1000,
    maxDiscount: 500,
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
    usageLimit: 1000
  },
  {
    code: 'FLAT500',
    description: 'Flat ₹500 off on orders above ₹3000',
    type: 'fixed',
    value: 500,
    minOrderValue: 3000,
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 months
    usageLimit: 500
  },
  {
    code: 'SAVE20',
    description: '20% off on water purifiers',
    type: 'percentage',
    value: 20,
    minOrderValue: 5000,
    maxDiscount: 2000,
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 3 months
    usageLimit: null
  }
];

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/water', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Coupon.deleteMany({});

    // Create Admin User
    console.log('👤 Creating admin user...');
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@waterjunction.com',
      password: 'admin123', // Will be hashed by pre-save hook
      role: 'admin',
      isEmailVerified: true,
      authProvider: 'email'
    });
    console.log('✅ Admin created:', adminUser.email, '/ Password: admin123');

    // Create Test User
    console.log('👤 Creating test user...');
    const testUser = await User.create({
      name: 'Test User',
      email: 'user@waterjunction.com',
      password: 'user123', // Will be hashed by pre-save hook
      role: 'user',
      isEmailVerified: true,
      authProvider: 'email',
      phone: '+919876543210',
      isPhoneVerified: true,
      addresses: [{
        name: 'Test User',
        phone: '+919876543210',
        addressLine1: '123 Test Street',
        addressLine2: 'Near Test Park',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        country: 'India',
        isDefault: true
      }]
    });
    console.log('✅ Test user created:', testUser.email, '/ Password: user123');

    // Create Categories
    console.log('📁 Creating categories...');
    const createdCategories = {};
    for (const cat of categories) {
      // Generate slug
      const slug = cat.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      
      const category = await Category.create({
        name: cat.name,
        slug: slug,
        description: cat.description,
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

      // Convert specifications maps
      let specs = {};
      if (prod.specifications) {
        specs = {
          performanceFeatures: new Map(Object.entries(prod.specifications.performanceFeatures || {})),
          warranty: new Map(Object.entries(prod.specifications.warranty || {})),
          general: new Map(Object.entries(prod.specifications.general || {})),
          dimensions: new Map(Object.entries(prod.specifications.dimensions || {}))
        };
      }

      // Generate slug
      const slug = prod.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const product = await Product.create({
        ...prod,
        slug: slug,
        category: category._id,
        specifications: specs,
        images: prod.images || [],
        isActive: true,
        isFeatured: Math.random() > 0.5
      });
      console.log(`✅ Product created: ${product.name}`);
    }

    // Create Coupons
    console.log('🎫 Creating coupons...');
    for (const coupon of coupons) {
      const createdCoupon = await Coupon.create(coupon);
      console.log(`✅ Coupon created: ${createdCoupon.code}`);
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

