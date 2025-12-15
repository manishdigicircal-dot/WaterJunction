import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const checkDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/water', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB\n');

    // Check for users
    const userCount = await User.countDocuments();
    const adminCount = await User.countDocuments({ role: 'admin' });
    const regularUserCount = await User.countDocuments({ role: 'user' });

    console.log('📊 Database Status:');
    console.log(`   Total Users: ${userCount}`);
    console.log(`   Admin Users: ${adminCount}`);
    console.log(`   Regular Users: ${regularUserCount}\n`);

    if (userCount === 0) {
      console.log('⚠️  WARNING: No users found in database!');
      console.log('   Please run: npm run seed\n');
    } else {
      // Check for admin user
      const adminUser = await User.findOne({ email: 'admin@waterjunction.com' });
      if (adminUser) {
        console.log('✅ Admin user exists: admin@waterjunction.com');
      } else {
        console.log('⚠️  Admin user not found. Run: npm run seed');
      }

      // Check for test user
      const testUser = await User.findOne({ email: 'user@waterjunction.com' });
      if (testUser) {
        console.log('✅ Test user exists: user@waterjunction.com');
      } else {
        console.log('⚠️  Test user not found. Run: npm run seed');
      }
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

checkDatabase();




