import express from 'express';
import { body, validationResult } from 'express-validator';
import FlashSale from '../models/FlashSale.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { uploadImage, uploadToCloudinary } from '../utils/upload.js';

const router = express.Router();

// @route   GET /api/flash-sales
// @desc    Get active flash sales
// @access  Public
router.get('/', async (req, res) => {
  try {
    const now = new Date();
    const flashSales = await FlashSale.find({
      isActive: true,
      startTime: { $lte: now },
      endTime: { $gte: now }
    })
      .populate('products.product', 'name images price mrp')
      .sort({ startTime: 1 });

    res.json({ success: true, flashSales });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/flash-sales/:id
// @desc    Get single flash sale
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const flashSale = await FlashSale.findById(req.params.id)
      .populate('products.product');

    if (!flashSale) {
      return res.status(404).json({ message: 'Flash sale not found' });
    }

    res.json({ success: true, flashSale });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/flash-sales
// @desc    Create flash sale (Admin)
// @access  Private/Admin
router.post('/', protect, admin, uploadImage.single('bannerImage'), async (req, res) => {
  try {
    let bannerImage = '';
    if (req.file) {
      bannerImage = await uploadToCloudinary(req.file.buffer, 'waterjunction/flash-sales', 'image');
    }

    const flashSale = await FlashSale.create({
      ...req.body,
      bannerImage
    });

    res.status(201).json({ success: true, flashSale });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/flash-sales/:id
// @desc    Update flash sale (Admin)
// @access  Private/Admin
router.put('/:id', protect, admin, uploadImage.single('bannerImage'), async (req, res) => {
  try {
    const flashSale = await FlashSale.findById(req.params.id);
    if (!flashSale) {
      return res.status(404).json({ message: 'Flash sale not found' });
    }

    const updateData = { ...req.body };

    if (req.file) {
      updateData.bannerImage = await uploadToCloudinary(
        req.file.buffer, 
        'waterjunction/flash-sales', 
        'image'
      );
    }

    const updatedFlashSale = await FlashSale.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({ success: true, flashSale: updatedFlashSale });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/flash-sales/:id
// @desc    Delete flash sale (Admin)
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const flashSale = await FlashSale.findById(req.params.id);
    if (!flashSale) {
      return res.status(404).json({ message: 'Flash sale not found' });
    }

    await flashSale.deleteOne();
    res.json({ success: true, message: 'Flash sale deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;









import { body, validationResult } from 'express-validator';
import FlashSale from '../models/FlashSale.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { uploadImage, uploadToCloudinary } from '../utils/upload.js';

const router = express.Router();

// @route   GET /api/flash-sales
// @desc    Get active flash sales
// @access  Public
router.get('/', async (req, res) => {
  try {
    const now = new Date();
    const flashSales = await FlashSale.find({
      isActive: true,
      startTime: { $lte: now },
      endTime: { $gte: now }
    })
      .populate('products.product', 'name images price mrp')
      .sort({ startTime: 1 });

    res.json({ success: true, flashSales });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/flash-sales/:id
// @desc    Get single flash sale
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const flashSale = await FlashSale.findById(req.params.id)
      .populate('products.product');

    if (!flashSale) {
      return res.status(404).json({ message: 'Flash sale not found' });
    }

    res.json({ success: true, flashSale });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/flash-sales
// @desc    Create flash sale (Admin)
// @access  Private/Admin
router.post('/', protect, admin, uploadImage.single('bannerImage'), async (req, res) => {
  try {
    let bannerImage = '';
    if (req.file) {
      bannerImage = await uploadToCloudinary(req.file.buffer, 'waterjunction/flash-sales', 'image');
    }

    const flashSale = await FlashSale.create({
      ...req.body,
      bannerImage
    });

    res.status(201).json({ success: true, flashSale });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/flash-sales/:id
// @desc    Update flash sale (Admin)
// @access  Private/Admin
router.put('/:id', protect, admin, uploadImage.single('bannerImage'), async (req, res) => {
  try {
    const flashSale = await FlashSale.findById(req.params.id);
    if (!flashSale) {
      return res.status(404).json({ message: 'Flash sale not found' });
    }

    const updateData = { ...req.body };

    if (req.file) {
      updateData.bannerImage = await uploadToCloudinary(
        req.file.buffer, 
        'waterjunction/flash-sales', 
        'image'
      );
    }

    const updatedFlashSale = await FlashSale.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({ success: true, flashSale: updatedFlashSale });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/flash-sales/:id
// @desc    Delete flash sale (Admin)
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const flashSale = await FlashSale.findById(req.params.id);
    if (!flashSale) {
      return res.status(404).json({ message: 'Flash sale not found' });
    }

    await flashSale.deleteOne();
    res.json({ success: true, message: 'Flash sale deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;












