import express from 'express';
import { body, validationResult } from 'express-validator';
import Wishlist from '../models/Wishlist.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   GET /api/wishlist
// @desc    Get user wishlist
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    // PERFORMANCE: Use lean() for read-only query for faster response
    let wishlist = await Wishlist.findOne({ user: req.user.id })
      .lean()
      .maxTimeMS(5000);
    
    if (!wishlist) {
      // Create wishlist if doesn't exist
      const newWishlist = await Wishlist.create({ user: req.user.id, items: [] });
      wishlist = newWishlist.toObject();
    }

    // PERFORMANCE: Populate with lean() and select only needed fields
    const populatedWishlist = await Wishlist.populate(wishlist, {
      path: 'items.product',
      select: '_id name price mrp discountPercent stock images ratings isActive slug', // Only essential fields
      options: { lean: true }
    });

    // PERFORMANCE: Only send first image to reduce payload size dramatically
    if (populatedWishlist.items) {
      populatedWishlist.items = populatedWishlist.items.map(item => {
        if (item.product && item.product.images && item.product.images.length > 0) {
          item.product.images = [item.product.images[0]];
        }
        return item;
      });
    }

    // PERFORMANCE: Set cache headers for better client-side caching
    res.set({
      'Cache-Control': 'private, max-age=60', // Cache for 1 minute (private for user-specific data)
      'ETag': `"wishlist-${populatedWishlist._id}"`
    });

    res.json({ success: true, wishlist: populatedWishlist });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/wishlist
// @desc    Add item to wishlist
// @access  Private
router.post('/', protect, [
  body('productId').isMongoId()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    let wishlist = await Wishlist.findOne({ user: req.user.id });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: req.user.id,
        items: []
      });
    }

    // Check if item already exists
    const exists = wishlist.items.some(
      item => item.product.toString() === req.body.productId
    );

    if (exists) {
      return res.status(400).json({ message: 'Product already in wishlist' });
    }

    wishlist.items.push({
      product: req.body.productId
    });

    await wishlist.save();
    await wishlist.populate('items.product');

    res.json({ success: true, wishlist });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/wishlist/:itemId
// @desc    Remove item from wishlist
// @access  Private
router.delete('/:itemId', protect, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user.id });
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    wishlist.items.pull(req.params.itemId);
    await wishlist.save();

    await wishlist.populate('items.product');
    res.json({ success: true, wishlist });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;








import Wishlist from '../models/Wishlist.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   GET /api/wishlist
// @desc    Get user wishlist
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    // PERFORMANCE: Use lean() for read-only query for faster response
    let wishlist = await Wishlist.findOne({ user: req.user.id })
      .lean()
      .maxTimeMS(5000);
    
    if (!wishlist) {
      // Create wishlist if doesn't exist
      const newWishlist = await Wishlist.create({ user: req.user.id, items: [] });
      wishlist = newWishlist.toObject();
    }

    // PERFORMANCE: Populate with lean() and select only needed fields
    const populatedWishlist = await Wishlist.populate(wishlist, {
      path: 'items.product',
      select: '_id name price mrp discountPercent stock images ratings isActive slug', // Only essential fields
      options: { lean: true }
    });

    // PERFORMANCE: Only send first image to reduce payload size dramatically
    if (populatedWishlist.items) {
      populatedWishlist.items = populatedWishlist.items.map(item => {
        if (item.product && item.product.images && item.product.images.length > 0) {
          item.product.images = [item.product.images[0]];
        }
        return item;
      });
    }

    // PERFORMANCE: Set cache headers for better client-side caching
    res.set({
      'Cache-Control': 'private, max-age=60', // Cache for 1 minute (private for user-specific data)
      'ETag': `"wishlist-${populatedWishlist._id}"`
    });

    res.json({ success: true, wishlist: populatedWishlist });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/wishlist
// @desc    Add item to wishlist
// @access  Private
router.post('/', protect, [
  body('productId').isMongoId()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    let wishlist = await Wishlist.findOne({ user: req.user.id });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: req.user.id,
        items: []
      });
    }

    // Check if item already exists
    const exists = wishlist.items.some(
      item => item.product.toString() === req.body.productId
    );

    if (exists) {
      return res.status(400).json({ message: 'Product already in wishlist' });
    }

    wishlist.items.push({
      product: req.body.productId
    });

    await wishlist.save();
    await wishlist.populate('items.product');

    res.json({ success: true, wishlist });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/wishlist/:itemId
// @desc    Remove item from wishlist
// @access  Private
router.delete('/:itemId', protect, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user.id });
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    wishlist.items.pull(req.params.itemId);
    await wishlist.save();

    await wishlist.populate('items.product');
    res.json({ success: true, wishlist });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;







