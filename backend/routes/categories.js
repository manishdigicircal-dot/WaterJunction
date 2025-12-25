import express from 'express';
import Category from '../models/Category.js';

const router = express.Router();

// @route   GET /api/categories
// @desc    Get all categories
// @access  Public
router.get('/', async (req, res) => {
  try {
    console.log('Simple categories route called');

    const categories = await Category.find({ isActive: true })
      .select('name slug description image order')
      .sort({ order: 1, name: 1 })
      .lean();

    res.json({
      success: true,
      count: categories.length,
      categories
    });

  } catch (error) {
    console.error('Categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/categories/:id
// @desc    Get category by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id).lean();

    if (!category || !category.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      category
    });

  } catch (error) {
    console.error('Category fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;
