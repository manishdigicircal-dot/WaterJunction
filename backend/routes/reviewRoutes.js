import express from 'express';
import { body, validationResult } from 'express-validator';
import Review from '../models/Review.js';
import Order from '../models/Order.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { uploadImages, uploadToCloudinary } from '../utils/upload.js';

const router = express.Router();

// @route   GET /api/reviews/product/:productId
// @desc    Get reviews for a product
// @access  Public
router.get('/product/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ 
      product: req.params.productId,
      isApproved: true 
    })
      .populate('user', 'name profilePhoto')
      .sort({ createdAt: -1 });

    res.json({ success: true, reviews });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/reviews
// @desc    Create review
// @access  Private
router.post('/', protect, uploadImages.array('images', 5), [
  body('productId').isMongoId(),
  body('orderId').isMongoId(),
  body('rating').isInt({ min: 1, max: 5 }),
  body('comment').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    // Check if order exists and belongs to user
    const order = await Order.findById(req.body.orderId);
    if (!order || order.user.toString() !== req.user.id.toString()) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if order contains the product
    const orderItem = order.items.find(
      item => item.product.toString() === req.body.productId
    );
    if (!orderItem) {
      return res.status(400).json({ message: 'Product not in this order' });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({
      order: req.body.orderId,
      product: req.body.productId
    });
    if (existingReview) {
      return res.status(400).json({ message: 'Review already exists for this order' });
    }

    // Upload images if any
    const images = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const url = await uploadToCloudinary(file.buffer, 'waterjunction/reviews', 'image');
        images.push(url);
      }
    }

    const review = await Review.create({
      user: req.user.id,
      product: req.body.productId,
      order: req.body.orderId,
      rating: req.body.rating,
      title: req.body.title || '',
      comment: req.body.comment || '',
      images,
      isApproved: false // Admin approval required
    });

    res.status(201).json({ success: true, review });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/reviews/:id/approve
// @desc    Approve review (Admin)
// @access  Private/Admin
router.put('/:id/approve', protect, admin, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    review.isApproved = true;
    await review.save();

    res.json({ success: true, review });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/reviews/:id/report
// @desc    Report review
// @access  Private
router.post('/:id/report', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (!review.reportedBy.includes(req.user.id)) {
      review.reportedBy.push(req.user.id);
      review.isReported = true;
      await review.save();
    }

    res.json({ success: true, message: 'Review reported' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/reviews/:id/helpful
// @desc    Mark review as helpful
// @access  Private
router.post('/:id/helpful', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (!review.helpfulUsers.includes(req.user.id)) {
      review.helpfulUsers.push(req.user.id);
      review.helpfulCount += 1;
      await review.save();
    }

    res.json({ success: true, helpfulCount: review.helpfulCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/reviews/admin/pending
// @desc    Get pending reviews (Admin)
// @access  Private/Admin
router.get('/admin/pending', protect, admin, async (req, res) => {
  try {
    const reviews = await Review.find({ isApproved: false })
      .populate('user', 'name email')
      .populate('product', 'name images')
      .populate('order', 'orderNumber')
      .sort({ createdAt: -1 });

    res.json({ success: true, reviews });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;









import { body, validationResult } from 'express-validator';
import Review from '../models/Review.js';
import Order from '../models/Order.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { uploadImages, uploadToCloudinary } from '../utils/upload.js';

const router = express.Router();

// @route   GET /api/reviews/product/:productId
// @desc    Get reviews for a product
// @access  Public
router.get('/product/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ 
      product: req.params.productId,
      isApproved: true 
    })
      .populate('user', 'name profilePhoto')
      .sort({ createdAt: -1 });

    res.json({ success: true, reviews });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/reviews
// @desc    Create review
// @access  Private
router.post('/', protect, uploadImages.array('images', 5), [
  body('productId').isMongoId(),
  body('orderId').isMongoId(),
  body('rating').isInt({ min: 1, max: 5 }),
  body('comment').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    // Check if order exists and belongs to user
    const order = await Order.findById(req.body.orderId);
    if (!order || order.user.toString() !== req.user.id.toString()) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if order contains the product
    const orderItem = order.items.find(
      item => item.product.toString() === req.body.productId
    );
    if (!orderItem) {
      return res.status(400).json({ message: 'Product not in this order' });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({
      order: req.body.orderId,
      product: req.body.productId
    });
    if (existingReview) {
      return res.status(400).json({ message: 'Review already exists for this order' });
    }

    // Upload images if any
    const images = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const url = await uploadToCloudinary(file.buffer, 'waterjunction/reviews', 'image');
        images.push(url);
      }
    }

    const review = await Review.create({
      user: req.user.id,
      product: req.body.productId,
      order: req.body.orderId,
      rating: req.body.rating,
      title: req.body.title || '',
      comment: req.body.comment || '',
      images,
      isApproved: false // Admin approval required
    });

    res.status(201).json({ success: true, review });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/reviews/:id/approve
// @desc    Approve review (Admin)
// @access  Private/Admin
router.put('/:id/approve', protect, admin, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    review.isApproved = true;
    await review.save();

    res.json({ success: true, review });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/reviews/:id/report
// @desc    Report review
// @access  Private
router.post('/:id/report', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (!review.reportedBy.includes(req.user.id)) {
      review.reportedBy.push(req.user.id);
      review.isReported = true;
      await review.save();
    }

    res.json({ success: true, message: 'Review reported' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/reviews/:id/helpful
// @desc    Mark review as helpful
// @access  Private
router.post('/:id/helpful', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (!review.helpfulUsers.includes(req.user.id)) {
      review.helpfulUsers.push(req.user.id);
      review.helpfulCount += 1;
      await review.save();
    }

    res.json({ success: true, helpfulCount: review.helpfulCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/reviews/admin/pending
// @desc    Get pending reviews (Admin)
// @access  Private/Admin
router.get('/admin/pending', protect, admin, async (req, res) => {
  try {
    const reviews = await Review.find({ isApproved: false })
      .populate('user', 'name email')
      .populate('product', 'name images')
      .populate('order', 'orderNumber')
      .sort({ createdAt: -1 });

    res.json({ success: true, reviews });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;














