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
    let wishlist = await Wishlist.findOne({ user: req.user.id }).populate('items.product');
    
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user.id, items: [] });
    }

    res.json({ success: true, wishlist });
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







