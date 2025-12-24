import express from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import Category from '../models/Category.js';
import User from '../models/User.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { uploadCategoryFiles, uploadToCloudinary } from '../utils/upload.js';
import { getCachedCategories, setCachedCategories, clearCategoriesCache } from '../utils/cache.js';

const router = express.Router();

// @route   GET /api/categories
// @desc    Get all categories (all categories if authenticated admin, only active for public)
// @access  Public
router.get('/', async (req, res) => {
  try {
    // For public access, only show active categories
    // Admin panel should access via /api/admin/categories or we check token here
    let filter = { isActive: true };
    let isAdmin = false;
    
    // If authorization header exists, try to verify if it's an admin
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).lean();
        
        if (user && user.role === 'admin') {
          // Admin can see all categories (including inactive)
          filter = {};
          isAdmin = true;
        }
      } catch (err) {
        // If token verification fails, treat as public access
        // Continue with active categories only
      }
    }
    
    // Use cache for public (non-admin) requests
    let categories;
    if (!isAdmin) {
      categories = getCachedCategories();
      if (categories) {
        return res.json({ success: true, categories });
      }
    }
    
    // Use lean() for better performance on read-only queries
    categories = await Category.find(filter)
      .select('name slug image description order isActive parentCategory')
      .sort({ order: 1, name: 1 })
      .populate({
        path: 'parentCategory',
        select: 'name slug',
        options: { lean: true }
      })
      .lean()
      .maxTimeMS(3000); // Timeout after 3 seconds
    
    // Cache for public requests
    if (!isAdmin) {
      setCachedCategories(categories);
    }
    
    // Set cache headers for better performance
    res.set({
      'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
      'ETag': `"categories-${categories.length}"`
    });
    
    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/categories/:id
// @desc    Get single category
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)
      .populate('parentCategory', 'name slug');
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json({ success: true, category });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/categories
// @desc    Create category (Admin)
// @access  Private/Admin
router.post('/', protect, admin, uploadCategoryFiles.single('image'), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    let image = '';
    if (req.file) {
      try {
        const uploadedImage = await uploadToCloudinary(req.file.buffer, 'waterjunction/categories', 'image');
        if (uploadedImage) {
          image = uploadedImage;
          console.log('Category image uploaded to Cloudinary successfully');
        } else {
          // If Cloudinary not configured, use base64 data URL as fallback
          const base64 = req.file.buffer.toString('base64');
          const mimeType = req.file.mimetype || 'image/jpeg';
          image = `data:${mimeType};base64,${base64}`;
          console.log('Category image saved using base64 fallback (Cloudinary not configured)');
        }
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        // If Cloudinary fails (invalid key, network error, etc.), fallback to base64
        try {
          const base64 = req.file.buffer.toString('base64');
          const mimeType = req.file.mimetype || 'image/jpeg';
          image = `data:${mimeType};base64,${base64}`;
          console.log('Category image saved using base64 fallback after Cloudinary error');
        } catch (base64Error) {
          console.error('Failed to convert image to base64:', base64Error);
          // Continue without image if base64 conversion also fails
        }
      }
    }

    // Generate slug from name
    const slug = req.body.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const category = await Category.create({
      name: req.body.name,
      slug: slug,
      description: req.body.description || '',
      image,
      parentCategory: req.body.parentCategory || null,
      order: req.body.order || 0
    });

    // Clear cache when category is created
    clearCategoriesCache();

    res.status(201).json({ success: true, category });
  } catch (error) {
    console.error('Category creation error:', error);
    res.status(500).json({ message: error.message || 'Failed to create category' });
  }
});

// @route   PUT /api/categories/:id
// @desc    Update category (Admin)
// @access  Private/Admin
router.put('/:id', protect, admin, uploadCategoryFiles.single('image'), async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const updateData = {
      name: req.body.name,
      description: req.body.description,
      parentCategory: req.body.parentCategory,
      order: req.body.order,
      isActive: req.body.isActive !== undefined ? req.body.isActive : category.isActive
    };

    // Handle image update
    if (req.file) {
      try {
        const uploadedImage = await uploadToCloudinary(req.file.buffer, 'waterjunction/categories', 'image');
        if (uploadedImage) {
          updateData.image = uploadedImage;
          console.log('Category image updated via Cloudinary successfully');
        } else {
          // If Cloudinary not configured, use base64 data URL as fallback
          const base64 = req.file.buffer.toString('base64');
          const mimeType = req.file.mimetype || 'image/jpeg';
          updateData.image = `data:${mimeType};base64,${base64}`;
          console.log('Category image updated using base64 fallback (Cloudinary not configured)');
        }
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        // If Cloudinary fails (invalid key, network error, etc.), fallback to base64
        try {
          const base64 = req.file.buffer.toString('base64');
          const mimeType = req.file.mimetype || 'image/jpeg';
          updateData.image = `data:${mimeType};base64,${base64}`;
          console.log('Category image updated using base64 fallback after Cloudinary error');
        } catch (base64Error) {
          console.error('Failed to convert image to base64:', base64Error);
          // Keep existing image if base64 conversion also fails
          updateData.image = category.image || '';
        }
      }
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    // Clear cache when category is updated
    clearCategoriesCache();

    res.json({ success: true, category: updatedCategory });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/categories/:id
// @desc    Delete category (Admin)
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    await category.deleteOne();
    
    // Clear cache when category is deleted
    clearCategoriesCache();
    
    res.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;


import jwt from 'jsonwebtoken';
import Category from '../models/Category.js';
import User from '../models/User.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { uploadCategoryFiles, uploadToCloudinary } from '../utils/upload.js';
import { getCachedCategories, setCachedCategories, clearCategoriesCache } from '../utils/cache.js';

const router = express.Router();

// @route   GET /api/categories
// @desc    Get all categories (all categories if authenticated admin, only active for public)
// @access  Public
router.get('/', async (req, res) => {
  try {
    // For public access, only show active categories
    // Admin panel should access via /api/admin/categories or we check token here
    let filter = { isActive: true };
    let isAdmin = false;
    
    // If authorization header exists, try to verify if it's an admin
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).lean();
        
        if (user && user.role === 'admin') {
          // Admin can see all categories (including inactive)
          filter = {};
          isAdmin = true;
        }
      } catch (err) {
        // If token verification fails, treat as public access
        // Continue with active categories only
      }
    }
    
    // Use cache for public (non-admin) requests
    let categories;
    if (!isAdmin) {
      categories = getCachedCategories();
      if (categories) {
        return res.json({ success: true, categories });
      }
    }
    
    // Use lean() for better performance on read-only queries
    categories = await Category.find(filter)
      .select('name slug image description order isActive parentCategory')
      .sort({ order: 1, name: 1 })
      .populate({
        path: 'parentCategory',
        select: 'name slug',
        options: { lean: true }
      })
      .lean()
      .maxTimeMS(3000); // Timeout after 3 seconds
    
    // Cache for public requests
    if (!isAdmin) {
      setCachedCategories(categories);
    }
    
    // Set cache headers for better performance
    res.set({
      'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
      'ETag': `"categories-${categories.length}"`
    });
    
    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/categories/:id
// @desc    Get single category
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)
      .populate('parentCategory', 'name slug');
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json({ success: true, category });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/categories
// @desc    Create category (Admin)
// @access  Private/Admin
router.post('/', protect, admin, uploadCategoryFiles.single('image'), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    let image = '';
    if (req.file) {
      try {
        const uploadedImage = await uploadToCloudinary(req.file.buffer, 'waterjunction/categories', 'image');
        if (uploadedImage) {
          image = uploadedImage;
          console.log('Category image uploaded to Cloudinary successfully');
        } else {
          // If Cloudinary not configured, use base64 data URL as fallback
          const base64 = req.file.buffer.toString('base64');
          const mimeType = req.file.mimetype || 'image/jpeg';
          image = `data:${mimeType};base64,${base64}`;
          console.log('Category image saved using base64 fallback (Cloudinary not configured)');
        }
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        // If Cloudinary fails (invalid key, network error, etc.), fallback to base64
        try {
          const base64 = req.file.buffer.toString('base64');
          const mimeType = req.file.mimetype || 'image/jpeg';
          image = `data:${mimeType};base64,${base64}`;
          console.log('Category image saved using base64 fallback after Cloudinary error');
        } catch (base64Error) {
          console.error('Failed to convert image to base64:', base64Error);
          // Continue without image if base64 conversion also fails
        }
      }
    }

    // Generate slug from name
    const slug = req.body.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const category = await Category.create({
      name: req.body.name,
      slug: slug,
      description: req.body.description || '',
      image,
      parentCategory: req.body.parentCategory || null,
      order: req.body.order || 0
    });

    // Clear cache when category is created
    clearCategoriesCache();

    res.status(201).json({ success: true, category });
  } catch (error) {
    console.error('Category creation error:', error);
    res.status(500).json({ message: error.message || 'Failed to create category' });
  }
});

// @route   PUT /api/categories/:id
// @desc    Update category (Admin)
// @access  Private/Admin
router.put('/:id', protect, admin, uploadCategoryFiles.single('image'), async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const updateData = {
      name: req.body.name,
      description: req.body.description,
      parentCategory: req.body.parentCategory,
      order: req.body.order,
      isActive: req.body.isActive !== undefined ? req.body.isActive : category.isActive
    };

    // Handle image update
    if (req.file) {
      try {
        const uploadedImage = await uploadToCloudinary(req.file.buffer, 'waterjunction/categories', 'image');
        if (uploadedImage) {
          updateData.image = uploadedImage;
          console.log('Category image updated via Cloudinary successfully');
        } else {
          // If Cloudinary not configured, use base64 data URL as fallback
          const base64 = req.file.buffer.toString('base64');
          const mimeType = req.file.mimetype || 'image/jpeg';
          updateData.image = `data:${mimeType};base64,${base64}`;
          console.log('Category image updated using base64 fallback (Cloudinary not configured)');
        }
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        // If Cloudinary fails (invalid key, network error, etc.), fallback to base64
        try {
          const base64 = req.file.buffer.toString('base64');
          const mimeType = req.file.mimetype || 'image/jpeg';
          updateData.image = `data:${mimeType};base64,${base64}`;
          console.log('Category image updated using base64 fallback after Cloudinary error');
        } catch (base64Error) {
          console.error('Failed to convert image to base64:', base64Error);
          // Keep existing image if base64 conversion also fails
          updateData.image = category.image || '';
        }
      }
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    // Clear cache when category is updated
    clearCategoriesCache();

    res.json({ success: true, category: updatedCategory });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/categories/:id
// @desc    Delete category (Admin)
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    await category.deleteOne();
    
    // Clear cache when category is deleted
    clearCategoriesCache();
    
    res.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

