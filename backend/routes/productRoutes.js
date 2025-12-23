import express from 'express';
import { body, query, validationResult } from 'express-validator';
import mongoose from 'mongoose';
import Product from '../models/Product.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { uploadImages, uploadVideo, uploadProductFiles, uploadToCloudinary } from '../utils/upload.js';

const router = express.Router();

// @route   GET /api/products
// @desc    Get all products with filters
// @access  Public
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('category').optional().isMongoId().withMessage('Invalid category ID'),
  query('minPrice').optional().isFloat({ min: 0 }),
  query('maxPrice').optional().isFloat({ min: 0 }),
  query('search').optional().trim(),
  query('sort').optional().isIn(['price-asc', 'price-desc', 'rating-desc', 'newest', 'name-asc'])
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        message: 'Validation error',
        errors: errors.array() 
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = { isActive: true };

    if (req.query.category) {
      // Validate and convert to ObjectId
      if (mongoose.Types.ObjectId.isValid(req.query.category)) {
        filter.category = new mongoose.Types.ObjectId(req.query.category);
      } else {
        return res.status(400).json({ 
          success: false,
          message: 'Invalid category ID format' 
        });
      }
    }

    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) filter.price.$gte = parseFloat(req.query.minPrice);
      if (req.query.maxPrice) filter.price.$lte = parseFloat(req.query.maxPrice);
    }

    // Use regex for search instead of text search for better performance
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filter.$or = [
        { name: searchRegex },
        { description: searchRegex }
      ];
    }

    // Build sort
    let sort = {};
    switch (req.query.sort) {
      case 'price-asc':
        sort = { price: 1 };
        break;
      case 'price-desc':
        sort = { price: -1 };
        break;
      case 'rating-desc':
        sort = { 'ratings.average': -1 };
        break;
      case 'newest':
        sort = { createdAt: -1 };
        break;
      case 'name-asc':
        sort = { name: 1 };
        break;
      default:
        sort = { createdAt: -1 };
    }
    
    // Select only needed fields - exclude heavy fields like description, specifications, etc.
    // IMPORTANT: Only send first image to reduce payload size (images can be huge if base64)
    const fieldsToSelect = 'name slug images price mrp discountPercent stock ratings category isFeatured createdAt';
    
    // Build query with optimizations
    const productsQuery = Product.find(filter)
      .select(fieldsToSelect)
      .populate({
        path: 'category',
        select: 'name slug',
        options: { lean: true }
      })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean()
      .maxTimeMS(15000); // 15 seconds for query timeout
    
    // Execute queries in parallel for better performance
    const [productsData, total] = await Promise.all([
      productsQuery,
      Product.countDocuments(filter).maxTimeMS(15000)
    ]);
    
    // Optimize products: Only send first image to reduce payload size dramatically
    // Base64 images can be 100KB+ each, so 8 products with multiple images = huge payload
    const products = productsData.map(product => ({
      ...product,
      images: product.images && product.images.length > 0 ? [product.images[0]] : []
    }));

    // Set cache headers for better performance
    res.set({
      'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
      'ETag': `"${Date.now()}-${total}"` // ETag for cache validation
    });

    res.json({
      success: true,
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/products/:id
// @desc    Get single product
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name slug')
      .populate('relatedProducts', 'name slug images price mrp')
      .populate('questions.askedBy', 'name')
      .populate('questions.answeredBy', 'name');

    if (!product || !product.isActive) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Increment views
    product.views += 1;
    await product.save({ validateBeforeSave: false });

    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/products/slug/:slug
// @desc    Get product by slug
// @access  Public
router.get('/slug/:slug', async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug })
      .populate('category', 'name slug')
      .populate('relatedProducts', 'name slug images price mrp')
      .populate('questions.askedBy', 'name')
      .populate('questions.answeredBy', 'name');

    if (!product || !product.isActive) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.views += 1;
    await product.save({ validateBeforeSave: false });

    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/products
// @desc    Create product (Admin)
// @access  Private/Admin
router.post('/', protect, admin, uploadProductFiles.fields([
  { name: 'images', maxCount: 10 },
  { name: 'video', maxCount: 1 }
]), async (req, res) => {
  try {
    const productData = JSON.parse(req.body.product || '{}');
    console.log('Creating product - received images in productData:', productData.images ? `${productData.images.length} items` : 'none');
    console.log('Files received:', req.files ? Object.keys(req.files) : 'none');

    // Upload images - start with any existing images from productData
    const images = [];
    if (productData.images && Array.isArray(productData.images) && productData.images.length > 0) {
      images.push(...productData.images);
      console.log('Preserving existing images from productData:', productData.images.length);
    }
    
    if (req.files && req.files.images && req.files.images.length > 0) {
      console.log('Processing new image uploads:', req.files.images.length, 'files');
      for (const file of req.files.images) {
        try {
          const url = await uploadToCloudinary(file.buffer, 'waterjunction/products', 'image');
          if (url) {
            images.push(url);
          } else {
            // If Cloudinary not configured, use base64 data URL as fallback
            const base64 = file.buffer.toString('base64');
            const mimeType = file.mimetype || 'image/jpeg';
            images.push(`data:${mimeType};base64,${base64}`);
          }
        } catch (uploadError) {
          console.error('Image upload failed:', uploadError);
          // Cloudinary error (like invalid API key) - fall back to base64 so images still work
          try {
            const base64 = file.buffer.toString('base64');
            const mimeType = file.mimetype || 'image/jpeg';
            images.push(`data:${mimeType};base64,${base64}`);
            console.log('Image saved using base64 fallback after Cloudinary error');
          } catch (fallbackError) {
            console.error('Failed to create base64 fallback image:', fallbackError);
          }
        }
      }
      console.log('Total images after upload:', images.length);
    } else {
      console.log('No new image files uploaded');
    }

    // Upload video if present (file upload) or use video URL from form
    let video = '';
    if (req.files && req.files.video && req.files.video.length > 0) {
      // Video file upload
      const videoFile = req.files.video[0];
      try {
        const videoUrl = await uploadToCloudinary(videoFile.buffer, 'waterjunction/products', 'video');
        if (videoUrl) {
          video = videoUrl;
        } else {
          // If Cloudinary not configured, use base64 data URL as fallback
          const base64 = videoFile.buffer.toString('base64');
          const mimeType = videoFile.mimetype || 'video/mp4';
          video = `data:${mimeType};base64,${base64}`;
        }
      } catch (uploadError) {
        console.error('Video upload failed:', uploadError);
        // Continue without video
      }
    } else if (productData.video) {
      // Video URL from form (YouTube, Vimeo, or direct link)
      video = productData.video;
    }

    // Generate slug from name
    if (!productData.slug && productData.name) {
      let baseSlug = productData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      
      // Ensure slug uniqueness
      let slug = baseSlug;
      let counter = 1;
      while (await Product.findOne({ slug })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      productData.slug = slug;
    }

    // Parse specifications - NO TRUNCATION - all keys and values are unlimited
    if (productData.specifications && typeof productData.specifications === 'object') {
      const specs = {};
      const specSections = ['performanceFeatures', 'warranty', 'general', 'dimensions'];
      // NO LENGTH LIMITS - keys and values are unlimited
      
      for (const section of specSections) {
        if (productData.specifications[section] && 
            typeof productData.specifications[section] === 'object' &&
            !Array.isArray(productData.specifications[section]) &&
            Object.keys(productData.specifications[section]).length > 0) {
          try {
            const sectionMap = new Map();
            const sectionData = productData.specifications[section];
            
            for (const [key, value] of Object.entries(sectionData)) {
              // NO TRUNCATION - keep original key and value as is (unlimited length)
              const originalKey = String(key).trim();
              const originalValue = String(value); // No truncation
              
              if (originalKey.length > 0) {
                sectionMap.set(originalKey, originalValue);
              }
            }
            
            if (sectionMap.size > 0) {
              specs[section] = sectionMap;
            }
          } catch (mapError) {
            console.error(`Failed to create Map for ${section}:`, mapError);
            // Skip this section if Map creation fails
          }
        }
      }
      
      if (Object.keys(specs).length > 0) {
        productData.specifications = specs;
      }
    }

    // Remove images and video from productData to avoid conflicts - we'll set them separately
    const { images: _, video: __, ...cleanProductData } = productData;

    console.log('Creating product with images:', images.length);
    console.log('Images preview:', images.slice(0, 1).map(img => img.substring(0, 80) + '...'));

    const product = await Product.create({
      ...cleanProductData,
      images: images.length > 0 ? images : [], // Ensure images array is always set
      video: video || ''
    });

    console.log('Product created successfully with images:', product.images?.length || 0);

    res.status(201).json({ success: true, product });
  } catch (error) {
    console.error('Product creation error:', error);
    res.status(500).json({ message: error.message || 'Failed to create product' });
  }
});

// @route   PUT /api/products/:id
// @desc    Update product (Admin)
// @access  Private/Admin
router.put('/:id', protect, admin, uploadProductFiles.fields([
  { name: 'images', maxCount: 10 },
  { name: 'video', maxCount: 1 }
]), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    let productData;
    try {
      productData = JSON.parse(req.body.product || '{}');
      console.log('Parsed product data keys:', Object.keys(productData));
      console.log('ProductData images:', productData.images ? `Array with ${productData.images.length} items` : 'undefined');
    } catch (parseError) {
      console.error('Failed to parse product data:', parseError);
      return res.status(400).json({ message: 'Invalid product data format' });
    }

    // Handle image updates
    if (req.files && req.files.images && req.files.images.length > 0) {
      console.log('New images uploaded:', req.files.images.length);
      const newImages = [];
      for (const file of req.files.images) {
        try {
          const url = await uploadToCloudinary(file.buffer, 'waterjunction/products', 'image');
          if (url) {
            newImages.push(url);
          } else {
            // If Cloudinary not configured, use base64 data URL as fallback
            const base64 = file.buffer.toString('base64');
            const mimeType = file.mimetype || 'image/jpeg';
            newImages.push(`data:${mimeType};base64,${base64}`);
          }
        } catch (uploadError) {
          console.error('Image upload failed:', uploadError);
          // Cloudinary error (like invalid API key) - fall back to base64 so images still work
          try {
            const base64 = file.buffer.toString('base64');
            const mimeType = file.mimetype || 'image/jpeg';
            newImages.push(`data:${mimeType};base64,${base64}`);
            console.log('Update image saved using base64 fallback after Cloudinary error');
          } catch (fallbackError) {
            console.error('Failed to create base64 fallback image on update:', fallbackError);
          }
        }
      }
      // Use existing images from productData if provided, otherwise use product.images
      const existingImages = productData.images && Array.isArray(productData.images) 
        ? productData.images 
        : (product.images || []);
      productData.images = [...existingImages, ...newImages];
      console.log('Final images after upload:', productData.images.length, 'items');
    } else {
      // No new images uploaded
      if (productData.images !== undefined) {
        // Images array explicitly provided in request (could be empty array to clear, or existing images to preserve)
        productData.images = Array.isArray(productData.images) ? productData.images : [];
        console.log('Using provided images array:', productData.images.length, 'items');
      } else {
        // Images not in request - preserve existing images
        productData.images = product.images || [];
        console.log('Preserving existing images:', productData.images.length, 'items');
      }
    }

    // Handle video update - can be file upload or URL
    if (req.files && req.files.video && req.files.video.length > 0) {
      // Video file upload takes priority
      const videoFile = req.files.video[0];
      try {
        const videoUrl = await uploadToCloudinary(videoFile.buffer, 'waterjunction/products', 'video');
        if (videoUrl) {
          productData.video = videoUrl;
        } else {
          // If Cloudinary not configured, use base64 data URL as fallback
          const base64 = videoFile.buffer.toString('base64');
          const mimeType = videoFile.mimetype || 'video/mp4';
          productData.video = `data:${mimeType};base64,${base64}`;
        }
      } catch (uploadError) {
        console.error('Video upload failed:', uploadError);
        // Keep existing video if upload fails
        if (!productData.video) {
          productData.video = product.video || '';
        }
      }
    } else if (productData.video !== undefined) {
      // Video URL from form (can be empty string to clear video)
      productData.video = productData.video || '';
    }

    // Parse specifications - NO TRUNCATION - all keys and values are unlimited
    if (productData.specifications && typeof productData.specifications === 'object') {
      const specs = {};
      const specSections = ['performanceFeatures', 'warranty', 'general', 'dimensions'];
      // NO LENGTH LIMITS - keys and values are unlimited
      
      for (const section of specSections) {
        if (productData.specifications[section] && 
            typeof productData.specifications[section] === 'object' &&
            !Array.isArray(productData.specifications[section]) &&
            Object.keys(productData.specifications[section]).length > 0) {
          try {
            const sectionMap = new Map();
            const sectionData = productData.specifications[section];
            
            for (const [key, value] of Object.entries(sectionData)) {
              // NO TRUNCATION - keep original key and value as is (unlimited length)
              const originalKey = String(key).trim();
              const originalValue = String(value); // No truncation
              
              // Only add if key is not empty
              if (originalKey.length > 0) {
                sectionMap.set(originalKey, originalValue);
              }
            }
            
            if (sectionMap.size > 0) {
              specs[section] = sectionMap;
            }
          } catch (mapError) {
            console.error(`Failed to create Map for ${section}:`, mapError);
            // Skip this section if Map creation fails
          }
        }
      }
      
      // Only set specifications if we have at least one valid section
      if (Object.keys(specs).length > 0) {
        productData.specifications = specs;
      } else {
        // If no valid specs, keep existing or set to empty
        delete productData.specifications;
      }
    } else if (productData.specifications === null || productData.specifications === '') {
      // Allow clearing specifications
      delete productData.specifications;
    }

    // NO TRUNCATION for slug - unlimited length
    // Slug will be handled by pre-save hook if needed

    // Remove undefined fields and protected fields
    const fieldsToUpdate = {};
    Object.keys(productData).forEach(key => {
      // Skip undefined, _id, __v, and other protected fields
      if (productData[key] !== undefined && 
          key !== '_id' && 
          key !== '__v' && 
          key !== 'createdAt' && 
          key !== 'updatedAt') {
        fieldsToUpdate[key] = productData[key];
      }
    });

    console.log('Fields to update:', Object.keys(fieldsToUpdate));

    // Use findByIdAndUpdate instead of save() for better reliability
    // This avoids issues with pre-save hooks and Map types
    const updateData = {};
    
    Object.keys(fieldsToUpdate).forEach(key => {
      try {
        // Handle specifications Maps specially - convert to plain object for update
        if (key === 'specifications' && fieldsToUpdate[key]) {
          // Convert Map to plain object for MongoDB update
          let specsObj = {};
          if (fieldsToUpdate[key] instanceof Map) {
            // Already a Map, convert to object
            const specs = fieldsToUpdate[key];
            Object.keys(specs).forEach(section => {
              if (specs[section] instanceof Map) {
                specsObj[section] = Object.fromEntries(specs[section]);
              } else {
                specsObj[section] = specs[section];
              }
            });
          } else {
            // Already an object - check if sections are Maps
            specsObj = {};
            Object.keys(fieldsToUpdate[key]).forEach(section => {
              if (fieldsToUpdate[key][section] instanceof Map) {
                specsObj[section] = Object.fromEntries(fieldsToUpdate[key][section]);
              } else {
                specsObj[section] = fieldsToUpdate[key][section];
              }
            });
          }
          updateData[key] = specsObj;
        } else {
          updateData[key] = fieldsToUpdate[key];
        }
      } catch (assignError) {
        console.error(`Error preparing field ${key} for update:`, assignError);
        console.error(`Field value:`, fieldsToUpdate[key]);
        // Continue with other fields
      }
    });

    console.log('Attempting to update product with data:', Object.keys(updateData));
    console.log('Images in updateData:', updateData.images ? `${updateData.images.length} items` : 'not set');
    if (updateData.images && updateData.images.length > 0) {
      console.log('First image preview:', updateData.images[0].substring(0, 80) + '...');
    }
    
    // Remove fields that might cause index key size issues
    // MongoDB has a 1024 byte limit for index keys
    // Text index fields (name, description) might cause issues if too long
    const safeUpdateData = { ...updateData };
    
    // Ensure images array is explicitly set - don't let it be undefined or null
    if ('images' in updateData) {
      safeUpdateData.images = Array.isArray(updateData.images) ? updateData.images : [];
      console.log('Setting images in safeUpdateData:', safeUpdateData.images.length, 'items');
    }
    
    // If name or description are too long, truncate them for the index
    // But keep full values in the document
    if (safeUpdateData.name && safeUpdateData.name.length > 1000) {
      console.warn('Name is very long, but keeping it as is');
    }
    if (safeUpdateData.description && safeUpdateData.description.length > 10000) {
      console.warn('Description is very long, but keeping it as is');
    }
    
    // Use native MongoDB update to completely bypass Mongoose validations
    // This avoids all "field too long" errors
    const db = mongoose.connection.db;
    const collection = db.collection('products');
    
    // Convert ObjectId
    const ObjectId = mongoose.Types.ObjectId;
    
    // Use MongoDB native updateOne to bypass ALL validations
    const result = await collection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: safeUpdateData },
      { bypassDocumentValidation: true } // Bypass MongoDB document validation
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Fetch the updated product using Mongoose
    const updatedProduct = await Product.findById(req.params.id);
    
    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found after update' });
    }
    
    console.log('Product updated successfully using native MongoDB update');

    res.json({ success: true, product: updatedProduct });
  } catch (error) {
    console.error('Product update error:', error);
    console.error('Error stack:', error.stack);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      errors: error.errors,
      keyPattern: error.keyPattern,
      keyValue: error.keyValue
    });
    
    // Log the product data that caused the error
    if (req.body.product) {
      try {
        const errorData = JSON.parse(req.body.product);
        console.error('Product data that caused error:', {
          keys: Object.keys(errorData),
          hasSpecifications: !!errorData.specifications,
          hasImages: !!errorData.images,
          hasVideo: !!errorData.video
        });
      } catch (e) {
        console.error('Could not parse product data for error logging');
      }
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = {};
      if (error.errors) {
        Object.keys(error.errors).forEach(key => {
          errors[key] = error.errors[key].message;
        });
      }
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors,
        details: error.message
      });
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || 'field';
      return res.status(400).json({ 
        message: `${field} already exists`,
        details: error.message
      });
    }
    
    // Handle string length errors - check various error message formats
    if (error.message && (
      error.message.includes('too long') || 
      error.message.includes('maximum length') ||
      error.message.includes('exceeds maximum') ||
      error.message.includes('String length') ||
      error.message.includes('index key') ||
      error.message.includes('index size')
    )) {
      // Try to extract field name from error message
      const fieldMatch = error.message.match(/`?(\w+)`?/);
      const fieldName = fieldMatch ? fieldMatch[1] : 'field';
      
      return res.status(400).json({ 
        message: `Field "${fieldName}" value is too long. This might be due to MongoDB index limits. Please try updating without that field or contact support.`,
        field: fieldName,
        details: error.message,
        suggestion: 'Try updating the product in smaller parts or remove very long text fields temporarily.'
      });
    }
    
    res.status(500).json({ 
      message: error.message || 'Failed to update product',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      details: process.env.NODE_ENV === 'development' ? {
        name: error.name,
        code: error.code,
        errors: error.errors,
        message: error.message
      } : {
        message: error.message
      }
    });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete product (Admin)
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await product.deleteOne();
    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/products/:id/questions
// @desc    Add question to product
// @access  Private
router.post('/:id/questions', protect, [
  body('question').trim().notEmpty()
], async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.questions.push({
      question: req.body.question,
      askedBy: req.user.id
    });

    await product.save();
    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/products/:id/questions/:qId
// @desc    Answer question (Admin)
// @access  Private/Admin
router.put('/:id/questions/:qId', protect, admin, [
  body('answer').trim().notEmpty()
], async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const question = product.questions.id(req.params.qId);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    question.answer = req.body.answer;
    question.answeredBy = req.user.id;
    question.answeredAt = new Date();
    question.isApproved = true;

    await product.save();
    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

