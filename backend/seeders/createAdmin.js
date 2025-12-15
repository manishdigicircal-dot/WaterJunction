import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/water';

const ADMIN_EMAIL = 'admin@waterjunction.com';
const ADMIN_PASSWORD = 'admin123';
const ADMIN_NAME = 'Admin User';

const createAdmin = async () => {
  try {
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ MongoDB connected');

    let admin = await User.findOne({ email: ADMIN_EMAIL });

    if (admin) {
      console.log('ℹ️  Admin already exists:', ADMIN_EMAIL);
      if (admin.role !== 'admin') {
        admin.role = 'admin';
        await admin.save({ validateBeforeSave: false });
        console.log('✅ Existing user upgraded to admin role');
      }
    } else {
      console.log('👤 Creating new admin user...');
      admin = await User.create({
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        role: 'admin',
        isEmailVerified: true,
        authProvider: 'email'
      });
      console.log('✅ Admin created:', admin.email, '/ Password:', ADMIN_PASSWORD);
    }

    console.log('\n📝 Admin Login:');
    console.log(`Email: ${ADMIN_EMAIL}`);
    console.log(`Password: ${ADMIN_PASSWORD}`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Error creating admin:', err);
    process.exit(1);
  }
};

createAdmin();