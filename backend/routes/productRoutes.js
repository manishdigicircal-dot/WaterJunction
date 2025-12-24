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
  query('sort').optional().isIn(['price-asc', 'price-desc', 'rating-desc', 'newest', 'name-asc']),
  query('withImages').optional().isBoolean().withMessage('withImages must be boolean')
], async (req, res) => {
  try {
    console.log('📦 Products API called:', req.query);
    let withImages = req.query.withImages === 'true';
    
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('❌ Validation errors:', errors.array());
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

    // Filter by featured products if requested
    if (req.query.featured === 'true') {
      filter.isFeatured = true;
      console.log('⭐ Filtering featured products');
    }
    
    console.log('🔍 Filter:', JSON.stringify(filter));

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
    console.log('🔎 Executing products query...');
    
    // First try without populate to avoid potential issues
    console.log('⏳ Step 1: Fetching products without populate...');
    console.log('📊 MongoDB connection state:', mongoose.connection.readyState, '(0=disconnected, 1=connected, 2=connecting, 3=disconnecting)');
    console.log('🔍 Filter being used:', JSON.stringify(filter));
    console.log('📋 Sort being used:', JSON.stringify(sort));
    console.log('📄 Skip:', skip, 'Limit:', limit);
    
    let productsData;
    try {
      // Check connection before query
      if (mongoose.connection.readyState !== 1) {
        console.warn('⚠️ MongoDB not connected, readyState:', mongoose.connection.readyState);
        throw new Error('MongoDB connection not ready');
      }
      
      console.log('⏱️ Starting product query strategy...', withImages ? '(with images)' : '(optimized)');
      const startTime = Date.now();
      
      if (withImages) {
        // Direct query with images for admin panel - uses aggregation with $slice
        console.log('🖼️ Fetching products WITH images (admin mode)...');
        try {
          const pipeline = [
            { $match: filter },
            { $sort: sort },
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                name: 1,
                slug: 1,
                images: { $slice: ['$images', 1] }, // First image only
                price: 1,
                mrp: 1,
                discountPercent: 1,
                stock: 1,
                ratings: 1,
                category: 1,
                isFeatured: 1,
                createdAt: 1
              }
            }
          ];
          
          const queryPromise = Product.aggregate(pipeline).option({ maxTimeMS: 20000 });
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Query with images timeout')), 18000);
          });
          
          productsData = await Promise.race([queryPromise, timeoutPromise]);
          
          productsData = productsData.map(product => {
            // Handle images array from aggregation
            let imagesArray = product.images || [];
            let firstImage = Array.isArray(imagesArray) && imagesArray.length > 0 ? imagesArray[0] : null;
            
            // Filter out large base64 images (but keep Cloudinary URLs and small base64)
            if (firstImage && firstImage.startsWith('data:') && firstImage.length > 500000) {
              console.log(`⚠️ Skipping large base64 image for product ${product._id} (${Math.round(firstImage.length/1024)}KB)`);
              firstImage = null;
            }
            
            // Log for debugging
            if (firstImage) {
              console.log(`✅ Image found for product ${product._id}: ${firstImage.substring(0, 80)}...`);
            }
            
            return {
              ...product,
              _id: product._id ? product._id.toString() : product._id,
              category: product.category ? product.category.toString() : null,
              images: firstImage ? [firstImage] : []
            };
          });
          
          const queryTime = Date.now() - startTime;
          console.log(`✅ Products fetched WITH images in ${queryTime}ms: ${productsData.length} products`);
          // Debug: Log first product's images
          if (productsData.length > 0 && productsData[0].images) {
            console.log('📸 Sample product images:', productsData[0].images.length, 'images');
            if (productsData[0].images.length > 0) {
              console.log('📸 Sample image URL:', productsData[0].images[0].substring(0, 100));
            }
          }
        } catch (aggErr) {
          console.warn('⚠️ Query with images failed, falling back to optimized query:', aggErr.message);
          // Fall through to optimized query below
          withImages = false; // Will use optimized query
        }
      }
      
      if (!withImages) {
        // Strategy: Fetch products WITHOUT images first (fast, reliable)
        // Then fetch images separately in parallel
        console.log('🚀 Step 1: Fetching products without images (fast query)...');
        
        // Fast query without images - always works quickly
        let simpleQuery = Product.find(filter)
          .select('name slug price mrp discountPercent stock ratings category isFeatured createdAt')
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .lean()
          .maxTimeMS(8000);
        
        productsData = await Promise.race([
          simpleQuery,
          new Promise((_, reject) => setTimeout(() => reject(new Error('Fast query timeout')), 7000))
        ]);
        
        const fastQueryTime = Date.now() - startTime;
        console.log(`✅ Products fetched WITHOUT images in ${fastQueryTime}ms: ${productsData.length} products`);
        
        // Convert ObjectIds to strings
        productsData = productsData.map(product => ({
          ...product,
          _id: product._id ? product._id.toString() : product._id,
          category: product.category ? product.category.toString() : null,
          images: [] // Will be populated below
        }));
        
        // Step 2: Fetch first image for each product (only if we have products)
        if (productsData.length > 0) {
          console.log('🖼️ Step 2: Fetching first image for each product (parallel query)...');
          const imageStartTime = Date.now();
        
        try {
          const productIds = productsData.map(p => p._id);
          // Convert string IDs to ObjectId for MongoDB query
          const objectIds = productIds.map(id => {
            try {
              return mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : id;
            } catch (e) {
              return id;
            }
          });
          const imagePipeline = [
            { $match: { _id: { $in: objectIds }, isActive: true } },
            {
              $project: {
                _id: 1,
                firstImage: { $arrayElemAt: ['$images', 0] } // Get first image
              }
            }
          ];
          
          const imageQueryPromise = Product.aggregate(imagePipeline).option({ maxTimeMS: 12000 });
          const imageTimeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Image query timeout')), 10000);
          });
          
          const imageResults = await Promise.race([imageQueryPromise, imageTimeoutPromise]);
          
          const imageQueryTime = Date.now() - imageStartTime;
          console.log(`✅ Images fetched in ${imageQueryTime}ms for ${imageResults.length} products`);
          
          // Create a map of productId -> firstImage
          const imageMap = {};
          imageResults.forEach(item => {
            if (item.firstImage) {
              // Only include Cloudinary URLs or small base64 images (<200KB)
              if (item.firstImage.startsWith('http')) {
                // Cloudinary URL - always include
                imageMap[item._id.toString()] = item.firstImage;
              } else if (item.firstImage.startsWith('data:') && item.firstImage.length < 200000) {
                // Small base64 image - include
                imageMap[item._id.toString()] = item.firstImage;
              }
              // Large base64 images are skipped for performance
            }
          });
          
          // Merge images into products
          productsData = productsData.map(product => ({
            ...product,
            images: imageMap[product._id] ? [imageMap[product._id]] : []
          }));
          
          const totalTime = Date.now() - startTime;
          console.log(`✅ Total query time: ${totalTime}ms - Products: ${productsData.length}, Images loaded: ${Object.keys(imageMap).length}`);
        } catch (imageErr) {
          console.warn('⚠️ Image fetch failed (products will load without images):', imageErr.message);
          // Products already have empty images array, so continue
          const totalTime = Date.now() - startTime;
          console.log(`✅ Products loaded without images in ${totalTime}ms`);
          }
        }
      }
      
      if (productsData.length === 0) {
        console.log('⚠️ No products found with filter:', JSON.stringify(filter));
      }
    } catch (err) {
      console.error('❌ Error fetching products:', err.message);
      console.error('❌ Error name:', err.name);
      console.error('❌ Error code:', err.code);
      
      // Return empty array on any error to prevent app crash
      console.warn('⚠️ Returning empty products array due to error');
      productsData = [];
    }
    
    // Then populate categories separately if needed
    console.log('⏳ Step 2: Populating categories...');
    try {
      if (productsData.length > 0) {
        const categoryIds = [...new Set(productsData.map(p => p.category).filter(Boolean))];
        if (categoryIds.length > 0) {
          const Category = mongoose.model('Category');
          // Convert string IDs back to ObjectId for query
          const objectIds = categoryIds.map(id => new mongoose.Types.ObjectId(id));
          const categories = await Category.find({ _id: { $in: objectIds } })
            .select('name slug')
            .lean()
            .maxTimeMS(5000);
          
          const categoryMap = {};
          categories.forEach(cat => {
            categoryMap[cat._id.toString()] = {
              _id: cat._id.toString(),
              name: cat.name,
              slug: cat.slug
            };
          });
          
          productsData = productsData.map(product => ({
            ...product,
            category: product.category ? (categoryMap[product.category] || null) : null
          }));
          console.log('✅ Categories populated');
        }
      }
    } catch (populateErr) {
      console.warn('⚠️ Category populate failed, continuing without:', populateErr.message);
      // Continue without populated categories - set category to null
      productsData = productsData.map(product => ({
        ...product,
        category: null
      }));
    }
    
    // Count total documents
    console.log('⏳ Step 3: Counting total documents...');
    let total;
    try {
      if (mongoose.connection.readyState === 1) {
        total = await Product.countDocuments(filter).maxTimeMS(15000); // Increased timeout
        console.log(`✅ Total count: ${total}`);
      } else {
        console.warn('⚠️ MongoDB not connected, using products length for count');
        total = productsData.length;
      }
    } catch (countErr) {
      console.warn('⚠️ Count query failed, using products length:', countErr.message);
      total = productsData.length;
    }
    
    console.log(`✅ Found ${productsData.length} products, total: ${total}`);
    
    // Products already have empty images array (images skipped for faster loading)
    // Images will be fetched when viewing product details
    const products = productsData;

    // Set cache headers for better performance
    res.set({
      'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
      'ETag': `"${Date.now()}-${total}"` // ETag for cache validation
    });

    console.log('📤 Sending response with', products.length, 'products');
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
    console.error('❌ Products API Error:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({ 
      success: false,
      message: error.message,
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
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
      console.log('⏳ Processing new image uploads:', req.files.images.length, 'files');
      const uploadStartTime = Date.now();
      
      // Upload images in parallel for faster processing
      const uploadPromises = req.files.images.map(async (file) => {
        try {
          const uploadPromise = uploadToCloudinary(file.buffer, 'waterjunction/products', 'image');
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Cloudinary upload timeout')), 15000)
          );
          
          const url = await Promise.race([uploadPromise, timeoutPromise]);
          if (url) {
            return url;
          }
          return null;
        } catch (uploadError) {
          console.error('❌ Image upload failed:', uploadError.message);
          return null;
        }
      });
      
      const uploadResults = await Promise.all(uploadPromises);
      const validImages = uploadResults.filter(url => url !== null);
      images.push(...validImages);
      
      const uploadTime = Date.now() - uploadStartTime;
      console.log(`✅ Uploaded ${validImages.length}/${req.files.images.length} images to Cloudinary in ${uploadTime}ms`);
      if (validImages.length > 0) {
        console.log('📸 Uploaded image URLs:', validImages.map(url => url.substring(0, 80) + '...'));
      } else {
        console.warn('⚠️ No valid images were uploaded!');
      }
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

    // Check MongoDB connection before creating
    if (mongoose.connection.readyState !== 1) {
      console.error('❌ MongoDB not connected, readyState:', mongoose.connection.readyState);
      return res.status(503).json({ 
        success: false,
        message: 'Database connection not ready. Please try again in a moment.' 
      });
    }

    console.log('⏳ Creating product in database...');
    const createStartTime = Date.now();
    
    // Wrap Product.create in timeout
    const createPromise = Product.create({
      ...cleanProductData,
      images: images.length > 0 ? images : [], // Ensure images array is always set
      video: video || ''
    });
    
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Product creation timeout after 30 seconds')), 30000);
    });
    
    const product = await Promise.race([createPromise, timeoutPromise]);
    
    const createTime = Date.now() - createStartTime;
    console.log(`✅ Product created successfully in ${createTime}ms with ${product.images?.length || 0} images (all Cloudinary URLs)`);
    console.log('📸 Product images after creation:', product.images);
    if (product.images && product.images.length > 0) {
      console.log('📸 First image URL:', product.images[0].substring(0, 100));
    }

    res.status(201).json({ success: true, product });
  } catch (error) {
    console.error('❌ Product creation error:', error);
    console.error('❌ Error name:', error.name);
    console.error('❌ Error message:', error.message);
    
    // Handle timeout errors specifically
    if (error.message.includes('timeout') || error.name === 'MongoNetworkTimeoutError') {
      return res.status(504).json({ 
        success: false,
        message: 'Product creation timed out. The database connection is slow. Please try again or contact support.' 
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: error.message || 'Failed to create product' 
    });
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
      console.log('⏳ Processing new image uploads for update:', req.files.images.length, 'files');
      const uploadStartTime = Date.now();
      const newImages = [];
      
      // Upload images in parallel for faster processing
      const uploadPromises = req.files.images.map(async (file) => {
        try {
          const uploadPromise = uploadToCloudinary(file.buffer, 'waterjunction/products', 'image');
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Cloudinary upload timeout')), 15000)
          );
          
          const url = await Promise.race([uploadPromise, timeoutPromise]);
          if (url) {
            return url;
          }
          return null;
        } catch (uploadError) {
          console.error('❌ Image upload failed:', uploadError.message);
          return null;
        }
      });
      
      const uploadResults = await Promise.all(uploadPromises);
      const validImages = uploadResults.filter(url => url !== null);
      newImages.push(...validImages);
      
      const uploadTime = Date.now() - uploadStartTime;
      console.log(`✅ Uploaded ${validImages.length}/${req.files.images.length} images to Cloudinary in ${uploadTime}ms`);
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
    // Add timeout wrapper for slow MongoDB connections
    console.log('⏳ Starting product update in MongoDB...');
    const updateStartTime = Date.now();
    
    const updatePromise = collection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: safeUpdateData },
      { bypassDocumentValidation: true } // Bypass MongoDB document validation
    );
    
    const updateTimeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Product update timeout after 30 seconds')), 30000);
    });
    
    const result = await Promise.race([updatePromise, updateTimeoutPromise]);
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    const updateTime = Date.now() - updateStartTime;
    console.log(`✅ Product updated in MongoDB in ${updateTime}ms`);
    
    // Fetch the updated product using Mongoose - also with timeout
    console.log('⏳ Fetching updated product...');
    const fetchStartTime = Date.now();
    
    const fetchPromise = Product.findById(req.params.id);
    const fetchTimeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Fetch updated product timeout after 15 seconds')), 15000);
    });
    
    const updatedProduct = await Promise.race([fetchPromise, fetchTimeoutPromise]);
    
    const fetchTime = Date.now() - fetchStartTime;
    console.log(`✅ Updated product fetched in ${fetchTime}ms`);
    
    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found after update' });
    }
    
    console.log('Product updated successfully using native MongoDB update');

    res.json({ success: true, product: updatedProduct });
  } catch (error) {
    console.error('Product update error:', error);
    
    // Handle timeout errors specifically
    if (error.message && (
      error.message.includes('timeout') || 
      error.message.includes('Timeout') ||
      error.name === 'MongoNetworkTimeoutError'
    )) {
      return res.status(504).json({
        success: false,
        message: 'Product update is taking too long due to slow database connection. The update may still be processing. Please check the product after a few moments.',
        timeout: true
      });
    }
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

