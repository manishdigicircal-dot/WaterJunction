import express from 'express';
import { body, validationResult } from 'express-validator';
import Coupon from '../models/Coupon.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   GET /api/coupons
// @desc    Get all active coupons
// @access  Public
router.get('/', async (req, res) => {
  try {
    const coupons = await Coupon.find({ 
      isActive: true,
      validFrom: { $lte: new Date() },
      validUntil: { $gte: new Date() }
    }).sort({ createdAt: -1 });

    res.json({ success: true, coupons });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/coupons/:code
// @desc    Validate coupon code
// @access  Private
router.get('/:code', protect, async (req, res) => {
  try {
    const coupon = await Coupon.findOne({ 
      code: req.params.code.toUpperCase() 
    });

    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    if (!coupon.isValid(req.user.id)) {
      return res.status(400).json({ message: 'Coupon is invalid or expired' });
    }

    res.json({ success: true, coupon });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/coupons
// @desc    Create coupon (Admin)
// @access  Private/Admin
router.post('/', protect, admin, [
  body('code').trim().notEmpty(),
  body('type').isIn(['percentage', 'fixed']),
  body('value').isFloat({ min: 0 }),
  body('validFrom').isISO8601(),
  body('validUntil').isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const coupon = await Coupon.create({
      ...req.body,
      code: req.body.code.toUpperCase()
    });

    res.status(201).json({ success: true, coupon });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/coupons/:id
// @desc    Update coupon (Admin)
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    if (req.body.code) {
      req.body.code = req.body.code.toUpperCase();
    }

    const updatedCoupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({ success: true, coupon: updatedCoupon });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/coupons/:id
// @desc    Delete coupon (Admin)
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    await coupon.deleteOne();
    res.json({ success: true, message: 'Coupon deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;







