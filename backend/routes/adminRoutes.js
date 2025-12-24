import express from 'express';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Category from '../models/Category.js';
import Coupon from '../models/Coupon.js';
import Review from '../models/Review.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { getCachedAdminStats, setCachedAdminStats, clearAdminStatsCache } from '../utils/cache.js';
import csvParser from 'csv-parser';
import csvWriter from 'csv-writer';
import { Readable } from 'stream';

const router = express.Router();

// All routes require admin access
router.use(protect);
router.use(admin);

// @route   GET /api/admin/stats
// @desc    Get dashboard statistics (CACHED for 5 minutes - stats don't need to be real-time)
// @access  Private/Admin
router.get('/stats', async (req, res) => {
  try {
    // PERFORMANCE: Check cache first - admin stats don't need real-time updates
    const cachedStats = getCachedAdminStats();
    if (cachedStats) {
      res.set({
        'Cache-Control': 'private, max-age=300', // 5 minutes
        'X-Cache': 'HIT'
      });
      return res.json({ success: true, stats: cachedStats });
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    // Use aggregation for revenue calculations - MUCH faster than loading all orders
    // Execute all revenue aggregations in parallel
    const [totalRevenueResult, monthlyRevenueResult, todayRevenueResult] = await Promise.all([
      Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ], { maxTimeMS: 10000 }),
      Order.aggregate([
        {
          $match: {
            paymentStatus: 'paid',
            createdAt: { $gte: startOfMonth }
          }
        },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ], { maxTimeMS: 10000 }),
      Order.aggregate([
        {
          $match: {
            paymentStatus: 'paid',
            createdAt: { $gte: startOfDay }
          }
        },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ], { maxTimeMS: 10000 })
    ]);

    const totalRevenue = totalRevenueResult?.total || 0;
    const monthlyRevenue = monthlyRevenueResult?.total || 0;
    const todayRevenue = todayRevenueResult?.total || 0;

    // PERFORMANCE: Use single aggregation for order status counts instead of multiple count queries
    const orderStatusCounts = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ], { maxTimeMS: 5000 }).catch(() => []); // Return empty array if fails

    // Convert aggregation result to object format
    const orderStats = {
      pending: 0,
      paid: 0,
      packed: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0
    };
    
    // Ensure orderStatusCounts is an array before iterating
    if (Array.isArray(orderStatusCounts)) {
      orderStatusCounts.forEach(item => {
        if (item && item._id && orderStats.hasOwnProperty(item._id)) {
          orderStats[item._id] = item.count || 0;
        }
      });
    }

    // PERFORMANCE: Execute remaining queries in parallel with optimized timeouts
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      totalCategories,
      topProducts,
      recentOrders
    ] = await Promise.all([
      User.countDocuments().maxTimeMS(3000).catch(() => 0),
      Product.countDocuments().maxTimeMS(3000).catch(() => 0),
      Order.countDocuments().maxTimeMS(3000).catch(() => 0),
      Category.countDocuments().maxTimeMS(3000).catch(() => 0),
      Product.find()
        .sort({ sales: -1 })
        .limit(10)
        .select('name price sales')
        .lean()
        .maxTimeMS(3000)
        .catch(() => []),
      Order.find()
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .limit(10)
        .select('orderNumber total status user')
        .lean()
        .maxTimeMS(3000)
        .catch(() => [])
    ]);

    // Generate monthly revenue chart data (last 12 months)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    twelveMonthsAgo.setDate(1);
    twelveMonthsAgo.setHours(0, 0, 0, 0);
    
    // Initialize chart data structure for last 12 months
    const chartDataMap = {};
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      chartDataMap[monthKey] = {
        month: monthNames[date.getMonth()],
        revenue: 0,
        orders: 0
      };
    }
    
    // Aggregate revenue data (paid orders only) - execute in parallel with orders aggregation
    const [revenueAggregation, ordersAggregation] = await Promise.all([
      Order.aggregate([
        {
          $match: {
            paymentStatus: 'paid',
            createdAt: { $gte: twelveMonthsAgo }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            revenue: { $sum: '$total' }
          }
        }
      ], { maxTimeMS: 10000 }),
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: twelveMonthsAgo }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            orders: { $sum: 1 }
          }
        }
      ], { maxTimeMS: 10000 })
    ]);
    
    // Populate revenue data
    revenueAggregation.forEach(item => {
      const monthKey = `${item._id.year}-${String(item._id.month).padStart(2, '0')}`;
      if (chartDataMap[monthKey]) {
        chartDataMap[monthKey].revenue = item.revenue;
      }
    });
    
    // Populate orders data
    ordersAggregation.forEach(item => {
      const monthKey = `${item._id.year}-${String(item._id.month).padStart(2, '0')}`;
      if (chartDataMap[monthKey]) {
        chartDataMap[monthKey].orders = item.orders;
      }
    });
    
    // Convert to arrays
    const revenueChart = Object.values(chartDataMap).map(item => ({
      month: item.month,
      revenue: item.revenue
    }));
    
    const orderChart = Object.values(chartDataMap).map(item => ({
      month: item.month,
      orders: item.orders
    }));

    const statsData = {
      users: totalUsers,
      products: totalProducts,
      orders: totalOrders,
      categories: totalCategories,
      revenue: {
        total: totalRevenue,
        monthly: monthlyRevenue,
        today: todayRevenue
      },
      orderStats,
      topProducts,
      recentOrders,
      revenueChart,
      orderChart
    };

    // PERFORMANCE: Cache the result for 5 minutes to avoid expensive recalculations
    setCachedAdminStats(statsData);

    res.set({
      'Cache-Control': 'private, max-age=300', // 5 minutes
      'X-Cache': 'MISS'
    });

    res.json({ success: true, stats: statsData });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Failed to fetch stats',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private/Admin
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter)
      .select('-password -refreshToken')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/admin/users/:id/block
// @desc    Block/Unblock user
// @access  Private/Admin
router.put('/users/:id/block', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/admin/products/import
// @desc    Import products from CSV
// @access  Private/Admin
router.post('/products/import', async (req, res) => {
  try {
    // This would require file upload middleware
    // For now, we'll return a placeholder
    res.json({ message: 'CSV import endpoint - implement file upload middleware' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/admin/products/export
// @desc    Export products to CSV
// @access  Private/Admin
router.get('/products/export', async (req, res) => {
  try {
    const products = await Product.find().populate('category', 'name');

    const csvData = products.map(product => ({
      name: product.name,
      category: product.category?.name || '',
      price: product.price,
      mrp: product.mrp,
      stock: product.stock,
      description: product.description,
      images: product.images.join('|'),
      isActive: product.isActive
    }));

    const writer = csvWriter.createObjectCsvStringifier({
      header: [
        { id: 'name', title: 'Name' },
        { id: 'category', title: 'Category' },
        { id: 'price', title: 'Price' },
        { id: 'mrp', title: 'MRP' },
        { id: 'stock', title: 'Stock' },
        { id: 'description', title: 'Description' },
        { id: 'images', title: 'Images' },
        { id: 'isActive', title: 'Is Active' }
      ]
    });

    const csv = writer.getHeaderString() + writer.stringifyRecords(csvData);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=products.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;






    user.isBlocked = !user.isBlocked;
    await user.save();

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/admin/products/import
// @desc    Import products from CSV
// @access  Private/Admin
router.post('/products/import', async (req, res) => {
  try {
    // This would require file upload middleware
    // For now, we'll return a placeholder
    res.json({ message: 'CSV import endpoint - implement file upload middleware' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/admin/products/export
// @desc    Export products to CSV
// @access  Private/Admin
router.get('/products/export', async (req, res) => {
  try {
    const products = await Product.find().populate('category', 'name');

    const csvData = products.map(product => ({
      name: product.name,
      category: product.category?.name || '',
      price: product.price,
      mrp: product.mrp,
      stock: product.stock,
      description: product.description,
      images: product.images.join('|'),
      isActive: product.isActive
    }));

    const writer = csvWriter.createObjectCsvStringifier({
      header: [
        { id: 'name', title: 'Name' },
        { id: 'category', title: 'Category' },
        { id: 'price', title: 'Price' },
        { id: 'mrp', title: 'MRP' },
        { id: 'stock', title: 'Stock' },
        { id: 'description', title: 'Description' },
        { id: 'images', title: 'Images' },
        { id: 'isActive', title: 'Is Active' }
      ]
    });

    const csv = writer.getHeaderString() + writer.stringifyRecords(csvData);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=products.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;




