import express from 'express';
import { body, validationResult } from 'express-validator';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Helper function to populate cart with optimized product fields
const populateCartProducts = async (cart) => {
  return await cart.populate({
    path: 'items.product',
    select: '_id name price mrp discountPercent stock images ratings isActive slug',
    transform: (doc) => {
      if (!doc) return null;
      const productObj = doc.toObject ? doc.toObject() : doc;
      // Only include first image to reduce payload size
      if (productObj.images && productObj.images.length > 0) {
        productObj.images = [productObj.images[0]];
      }
      return productObj;
    }
  });
};

// @route   GET /api/cart
// @desc    Get user cart
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    // PERFORMANCE: Use lean() for read-only query and select only needed fields
    let cart = await Cart.findOne({ user: req.user.id })
      .lean()
      .maxTimeMS(5000);
    
    if (!cart) {
      // Create cart if doesn't exist (use regular save, not lean)
      const newCart = await Cart.create({ user: req.user.id, items: [] });
      cart = newCart.toObject();
    }

    // PERFORMANCE: Populate with lean() for faster query and only first image
    const populatedCart = await Cart.populate(cart, {
      path: 'items.product',
      select: '_id name price mrp discountPercent stock images ratings isActive slug',
      options: { lean: true }
    });

    // PERFORMANCE: Only send first image to reduce payload size
    if (populatedCart.items) {
      populatedCart.items = populatedCart.items.map(item => {
        if (item.product && item.product.images && item.product.images.length > 0) {
          item.product.images = [item.product.images[0]];
        }
        return item;
      });
    }

    // PERFORMANCE: Set cache headers for better client-side caching
    res.set({
      'Cache-Control': 'private, max-age=60', // Cache for 1 minute (private for user-specific data)
      'ETag': `"cart-${populatedCart._id}-${populatedCart.lastUpdated}"`
    });

    res.json({ success: true, cart: populatedCart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/cart
// @desc    Add item to cart
// @access  Private
router.post('/', protect, [
  body('productId').isMongoId(),
  body('quantity').optional().isInt({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { productId, quantity = 1, variant } = req.body;

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      cart = await Cart.create({
        user: req.user.id,
        items: []
      });
    }

    // Check if item already exists
    const existingItemIndex = cart.items.findIndex(
      item => item.product.toString() === productId && 
      JSON.stringify(item.variant) === JSON.stringify(variant || {})
    );

    if (existingItemIndex > -1) {
      // Update quantity
      cart.items[existingItemIndex].quantity += quantity;
      if (cart.items[existingItemIndex].quantity > product.stock) {
        return res.status(400).json({ message: 'Insufficient stock' });
      }
    } else {
      // Add new item
      cart.items.push({
        product: productId,
        quantity,
        variant: variant || {}
      });
    }

    cart.lastUpdated = new Date();
    await cart.save();

    await populateCartProducts(cart);
    res.json({ success: true, cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/cart/:itemId
// @desc    Update cart item quantity
// @access  Private
router.put('/:itemId', protect, [
  body('quantity').isInt({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const item = cart.items.id(req.params.itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    const product = await Product.findById(item.product);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (req.body.quantity > product.stock) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    item.quantity = req.body.quantity;
    cart.lastUpdated = new Date();
    await cart.save();

    await populateCartProducts(cart);
    res.json({ success: true, cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/cart/:itemId
// @desc    Remove item from cart
// @access  Private
router.delete('/:itemId', protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items.pull(req.params.itemId);
    cart.lastUpdated = new Date();
    await cart.save();

    await populateCartProducts(cart);
    res.json({ success: true, cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/cart
// @desc    Clear cart
// @access  Private
router.delete('/', protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = [];
    cart.coupon = undefined;
    cart.lastUpdated = new Date();
    await cart.save();

    res.json({ success: true, cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/cart/apply-coupon
// @desc    Apply coupon to cart
// @access  Private
router.post('/apply-coupon', protect, [
  body('couponCode').trim().notEmpty()
], async (req, res) => {
  try {
    const Coupon = (await import('../models/Coupon.js')).default;
    const coupon = await Coupon.findOne({ code: req.body.couponCode.toUpperCase() });

    if (!coupon || !coupon.isValid()) {
      return res.status(400).json({ message: 'Invalid or expired coupon' });
    }

    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }
    
    // Populate products first to access prices
    await populateCartProducts(cart);

    // Calculate cart total
    const subtotal = cart.items.reduce((sum, item) => {
      if (item.product && typeof item.product.price === 'number') {
        return sum + (item.product.price * item.quantity);
      }
      return sum;
    }, 0);

    if (subtotal < coupon.minOrderValue) {
      return res.status(400).json({ 
        message: `Minimum order value of ₹${coupon.minOrderValue} required` 
      });
    }

    cart.coupon = coupon._id;
    await cart.save();

    await cart.populate('coupon');
    res.json({ success: true, cart, coupon });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/cart/remove-coupon
// @desc    Remove coupon from cart
// @access  Private
router.delete('/remove-coupon', protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.coupon = undefined;
    await cart.save();

    await populateCartProducts(cart);
    res.json({ success: true, cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;




import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Helper function to populate cart with optimized product fields
const populateCartProducts = async (cart) => {
  return await cart.populate({
    path: 'items.product',
    select: '_id name price mrp discountPercent stock images ratings isActive slug',
    transform: (doc) => {
      if (!doc) return null;
      const productObj = doc.toObject ? doc.toObject() : doc;
      // Only include first image to reduce payload size
      if (productObj.images && productObj.images.length > 0) {
        productObj.images = [productObj.images[0]];
      }
      return productObj;
    }
  });
};

// @route   GET /api/cart
// @desc    Get user cart
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    // PERFORMANCE: Use lean() for read-only query and select only needed fields
    let cart = await Cart.findOne({ user: req.user.id })
      .lean()
      .maxTimeMS(5000);
    
    if (!cart) {
      // Create cart if doesn't exist (use regular save, not lean)
      const newCart = await Cart.create({ user: req.user.id, items: [] });
      cart = newCart.toObject();
    }

    // PERFORMANCE: Populate with lean() for faster query and only first image
    const populatedCart = await Cart.populate(cart, {
      path: 'items.product',
      select: '_id name price mrp discountPercent stock images ratings isActive slug',
      options: { lean: true }
    });

    // PERFORMANCE: Only send first image to reduce payload size
    if (populatedCart.items) {
      populatedCart.items = populatedCart.items.map(item => {
        if (item.product && item.product.images && item.product.images.length > 0) {
          item.product.images = [item.product.images[0]];
        }
        return item;
      });
    }

    // PERFORMANCE: Set cache headers for better client-side caching
    res.set({
      'Cache-Control': 'private, max-age=60', // Cache for 1 minute (private for user-specific data)
      'ETag': `"cart-${populatedCart._id}-${populatedCart.lastUpdated}"`
    });

    res.json({ success: true, cart: populatedCart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/cart
// @desc    Add item to cart
// @access  Private
router.post('/', protect, [
  body('productId').isMongoId(),
  body('quantity').optional().isInt({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { productId, quantity = 1, variant } = req.body;

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      cart = await Cart.create({
        user: req.user.id,
        items: []
      });
    }

    // Check if item already exists
    const existingItemIndex = cart.items.findIndex(
      item => item.product.toString() === productId && 
      JSON.stringify(item.variant) === JSON.stringify(variant || {})
    );

    if (existingItemIndex > -1) {
      // Update quantity
      cart.items[existingItemIndex].quantity += quantity;
      if (cart.items[existingItemIndex].quantity > product.stock) {
        return res.status(400).json({ message: 'Insufficient stock' });
      }
    } else {
      // Add new item
      cart.items.push({
        product: productId,
        quantity,
        variant: variant || {}
      });
    }

    cart.lastUpdated = new Date();
    await cart.save();

    await populateCartProducts(cart);
    res.json({ success: true, cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/cart/:itemId
// @desc    Update cart item quantity
// @access  Private
router.put('/:itemId', protect, [
  body('quantity').isInt({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const item = cart.items.id(req.params.itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    const product = await Product.findById(item.product);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (req.body.quantity > product.stock) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    item.quantity = req.body.quantity;
    cart.lastUpdated = new Date();
    await cart.save();

    await populateCartProducts(cart);
    res.json({ success: true, cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/cart/:itemId
// @desc    Remove item from cart
// @access  Private
router.delete('/:itemId', protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items.pull(req.params.itemId);
    cart.lastUpdated = new Date();
    await cart.save();

    await populateCartProducts(cart);
    res.json({ success: true, cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/cart
// @desc    Clear cart
// @access  Private
router.delete('/', protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = [];
    cart.coupon = undefined;
    cart.lastUpdated = new Date();
    await cart.save();

    res.json({ success: true, cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/cart/apply-coupon
// @desc    Apply coupon to cart
// @access  Private
router.post('/apply-coupon', protect, [
  body('couponCode').trim().notEmpty()
], async (req, res) => {
  try {
    const Coupon = (await import('../models/Coupon.js')).default;
    const coupon = await Coupon.findOne({ code: req.body.couponCode.toUpperCase() });

    if (!coupon || !coupon.isValid()) {
      return res.status(400).json({ message: 'Invalid or expired coupon' });
    }

    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }
    
    // Populate products first to access prices
    await populateCartProducts(cart);

    // Calculate cart total
    const subtotal = cart.items.reduce((sum, item) => {
      if (item.product && typeof item.product.price === 'number') {
        return sum + (item.product.price * item.quantity);
      }
      return sum;
    }, 0);

    if (subtotal < coupon.minOrderValue) {
      return res.status(400).json({ 
        message: `Minimum order value of ₹${coupon.minOrderValue} required` 
      });
    }

    cart.coupon = coupon._id;
    await cart.save();

    await cart.populate('coupon');
    res.json({ success: true, cart, coupon });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/cart/remove-coupon
// @desc    Remove coupon from cart
// @access  Private
router.delete('/remove-coupon', protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.coupon = undefined;
    await cart.save();

    await populateCartProducts(cart);
    res.json({ success: true, cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;



