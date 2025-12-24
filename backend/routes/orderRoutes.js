import express from 'express';
import { body, validationResult } from 'express-validator';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import User from '../models/User.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import shipmozoService from '../services/shipmozoService.js';

const router = express.Router();

// Lazy Razorpay initialization
let razorpay = null;
const getRazorpayInstance = () => {
  if (!razorpay) {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error('❌ Razorpay keys missing:', {
        hasKeyId: !!process.env.RAZORPAY_KEY_ID,
        hasKeySecret: !!process.env.RAZORPAY_KEY_SECRET
      });
      throw new Error('Razorpay keys are not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your .env file');
    }
    try {
      console.log('🔧 Initializing Razorpay with key:', process.env.RAZORPAY_KEY_ID.substring(0, 10) + '...');
      razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
      });
      console.log('✅ Razorpay instance created successfully');
    } catch (error) {
      console.error('❌ Razorpay initialization error:', error);
      throw new Error(`Failed to initialize Razorpay: ${error.message}`);
    }
  }
  return razorpay;
};

// @route   POST /api/orders
// @desc    Create new order
// @access  Private
router.post('/', protect, [
  body('shippingAddress').custom((value) => {
    if (!value || typeof value !== 'object') {
      throw new Error('Shipping address is required');
    }
    if (!value.name || !value.phone || !value.addressLine1 || !value.city || !value.state || !value.pincode) {
      throw new Error('Shipping address must include name, phone, addressLine1, city, state, and pincode');
    }
    return true;
  }),
  body('paymentMethod').isIn(['razorpay']).withMessage('Payment method must be razorpay')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product').populate('coupon');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Calculate totals
    let subtotal = 0;
    const items = [];

    for (const item of cart.items) {
      const product = item.product;
      if (!product || !product.isActive || product.stock < item.quantity) {
        return res.status(400).json({
          message: `${product?.name || 'Product'} is out of stock or unavailable`
        });
      }

      const itemPrice = product.price * item.quantity;
      subtotal += itemPrice;

      items.push({
        product: product._id,
        name: product.name,
        image: product.images[0] || '',
        price: product.price,
        quantity: item.quantity,
        variant: item.variant || {}
      });
    }

    // Apply coupon discount
    let discount = 0;
    let couponId = null;
    if (cart.coupon) {
      const coupon = await Coupon.findById(cart.coupon);
      if (coupon && coupon.isValid(req.user.id)) {
        discount = coupon.calculateDiscount(subtotal);
        couponId = coupon._id;
      }
    }

    const shipping = 0; // Free shipping for all orders
    const tax = Math.round((subtotal - discount) * 0.18); // 18% GST
    const total = subtotal - discount + shipping + tax;

    // Create order
    const order = await Order.create({
      user: req.user.id,
      items,
      shippingAddress: req.body.shippingAddress,
      paymentMethod: req.body.paymentMethod,
      subtotal,
      shipping,
      tax,
      discount,
      coupon: couponId,
      total
    });

    // Create Razorpay order if payment method is razorpay
    if (req.body.paymentMethod === 'razorpay') {
      try {
        // Check if Razorpay keys are configured
        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
          return res.status(500).json({
            message: 'Razorpay keys are not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your .env file',
            error: 'Missing Razorpay configuration'
          });
        }

        const razorpayInstance = getRazorpayInstance();
        const razorpayOrder = await razorpayInstance.orders.create({
          amount: Math.round(total * 100), // Amount in paise
          currency: 'INR',
          receipt: order.orderNumber,
          notes: {
            orderId: order._id.toString(),
            userId: req.user.id.toString()
          }
        });

        order.razorpayOrderId = razorpayOrder.id;
        await order.save();
      } catch (error) {
        console.error('Razorpay order creation error:', error);
        // Check if it's a configuration error
        if (error.message && error.message.includes('not configured')) {
          return res.status(500).json({
            message: 'Razorpay keys are not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your .env file',
            error: error.message
          });
        }
        // Check if it's an API error from Razorpay
        if (error.error) {
          return res.status(500).json({
            message: `Razorpay API error: ${error.error.description || error.error.message || 'Unknown error'}`,
            error: error.error
          });
        }
        return res.status(500).json({
          message: 'Razorpay payment initialization failed. Please check your Razorpay configuration.',
          error: error.message || 'Unknown error'
        });
      }
    }

    // Clear cart
    cart.items = [];
    cart.coupon = undefined;
    await cart.save();

    res.status(201).json({
      success: true,
      order,
      razorpayOrder: req.body.paymentMethod === 'razorpay' ? {
        id: order.razorpayOrderId,
        amount: total * 100,
        currency: 'INR'
      } : null
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/orders/verify-payment
// @desc    Verify Razorpay payment
// @access  Private
router.post('/verify-payment', protect, [
  body('razorpay_order_id').notEmpty(),
  body('razorpay_payment_id').notEmpty(),
  body('razorpay_signature').notEmpty(),
  body('orderId').isMongoId()
], async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order || order.user.toString() !== req.user.id.toString()) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Verify signature
    if (!process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ message: 'Razorpay key secret not configured' });
    }

    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      order.paymentStatus = 'failed';
      order.status = 'cancelled';
      await order.save();
      return res.status(400).json({ message: 'Payment verification failed' });
    }

    // Update order
    order.paymentStatus = 'paid';
    order.status = 'paid';
    order.razorpayOrderId = razorpay_order_id;
    order.razorpayPaymentId = razorpay_payment_id;
    order.razorpaySignature = razorpay_signature;
    await order.save();

    // Update product stock and sales
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity, sales: item.quantity }
      });
    }

    // Update coupon usage
    if (order.coupon) {
      await Coupon.findByIdAndUpdate(order.coupon, {
        $inc: { usedCount: 1 }
      });
    }

    // Create Shipmozo shipment after payment verification
    try {
      // Populate order with user data for Shipmozo
      const user = await User.findById(req.user.id);
      const orderWithItems = await Order.findById(order._id).populate('items.product');

      const shipmozoResult = await shipmozoService.createShipment({
        order: orderWithItems,
        user: user
      });

      if (shipmozoResult.success) {
        // Update order with Shipmozo details
        order.shipmozoAwb = shipmozoResult.awb;
        order.courierName = shipmozoResult.courier_name;
        order.trackingUrl = shipmozoResult.tracking_url;
        order.shipmentStatus = shipmozoResult.status || 'created';
        order.shippingPending = false;
        order.status = 'packed'; // Update status to packed when shipment is created
        await order.save();

        console.log(`✅ Shipmozo shipment created for order ${order.orderNumber}, AWB: ${shipmozoResult.awb}`);
      } else {
        // If Shipmozo fails, mark shipping as pending but don't fail the order
        order.shippingPending = true;
        await order.save();
        console.error(`⚠️ Shipmozo shipment creation failed for order ${order.orderNumber}:`, shipmozoResult.error);
      }
    } catch (shipmozoError) {
      // If Shipmozo service fails, mark shipping as pending but don't fail the order
      order.shippingPending = true;
      await order.save();
      console.error(`⚠️ Shipmozo shipment creation error for order ${order.orderNumber}:`, shipmozoError.message);
      // Don't throw error - order should still be saved successfully
    }

    // Reload order to get updated Shipmozo fields
    const updatedOrder = await Order.findById(order._id).populate('items.product');

    console.log(`✅ Payment verified successfully for order ${order.orderNumber}. Status: ${updatedOrder.status}, PaymentStatus: ${updatedOrder.paymentStatus}`);

    res.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Payment verification failed'
    });
  }
});

// @route   GET /api/orders
// @desc    Get user orders
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('items.product', 'name images')
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/orders/:id
// @desc    Get single order
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product')
      .populate('user', 'name email phone');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user owns the order or is admin
    if (order.user._id.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/orders/:id/cancel
// @desc    Cancel order
// @access  Private
router.put('/:id/cancel', protect, [
  body('reason').optional().trim()
], async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (!['pending', 'paid'].includes(order.status)) {
      return res.status(400).json({ message: 'Order cannot be cancelled at this stage' });
    }

    order.status = 'cancelled';
    order.cancelledAt = new Date();
    order.cancellationReason = req.body.reason || 'Cancelled by user';

    if (order.paymentStatus === 'paid') {
      order.paymentStatus = 'refunded';
      // TODO: Initiate refund through Razorpay
    }

    // Restore stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity }
      });
    }

    await order.save();
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status (Admin)
// @access  Private/Admin
router.put('/:id/status', protect, admin, [
  body('status').isIn(['pending', 'paid', 'packed', 'shipped', 'delivered', 'returned', 'cancelled']),
  body('trackingNumber').optional().trim()
], async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = req.body.status;
    if (req.body.trackingNumber) {
      order.trackingNumber = req.body.trackingNumber;
    }

    if (req.body.status === 'delivered') {
      order.deliveredAt = new Date();
    }

    await order.save();
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/orders/admin/all
// @desc    Get all orders (Admin)
// @access  Private/Admin
router.get('/admin/all', protect, admin, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};
    if (status) filter.status = status;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('user', 'name email phone')
        .populate('items.product', 'name images')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean()
        .maxTimeMS(10000),
      Order.countDocuments(filter).maxTimeMS(5000)
    ]);

    res.json({
      success: true,
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/orders/:id/track
// @desc    Track shipment using AWB number
// @access  Private
router.get('/:id/track', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user owns the order or is admin
    if (order.user.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Check if AWB exists
    if (!order.shipmozoAwb) {
      return res.status(400).json({
        message: 'Tracking not available. Shipment not created yet.',
        shippingPending: order.shippingPending
      });
    }

    // Track shipment using Shipmozo
    const trackingResult = await shipmozoService.trackShipment(order.shipmozoAwb);

    if (trackingResult.success) {
      // Update order with latest tracking status
      order.shipmentStatus = trackingResult.status;
      if (trackingResult.tracking_url) {
        order.trackingUrl = trackingResult.tracking_url;
      }

      // Update order status based on shipment status
      if (trackingResult.status === 'delivered' && order.status !== 'delivered') {
        order.status = 'delivered';
        order.deliveredAt = new Date();
      } else if (trackingResult.status === 'in_transit' && order.status === 'packed') {
        order.status = 'shipped';
      }

      await order.save();

      return res.json({
        success: true,
        tracking: {
          awb: trackingResult.awb,
          status: trackingResult.status,
          courier_name: trackingResult.courier_name || order.courierName,
          tracking_url: trackingResult.tracking_url || order.trackingUrl,
          events: trackingResult.events || [],
          estimated_delivery: trackingResult.estimated_delivery,
          current_location: trackingResult.current_location
        },
        order: {
          status: order.status,
          shipmentStatus: order.shipmentStatus
        }
      });
    } else {
      // Return current tracking info even if API call fails
      return res.status(200).json({
        success: false,
        message: trackingResult.error || 'Failed to fetch tracking information',
        tracking: {
          awb: order.shipmozoAwb,
          status: order.shipmentStatus,
          courier_name: order.courierName,
          tracking_url: order.trackingUrl
        }
      });
    }
  } catch (error) {
    console.error('Track shipment error:', error);
    res.status(500).json({ message: error.message || 'Failed to track shipment' });
  }
});

// @route   POST /api/orders/:id/create-shipment
// @desc    Manually create shipment for order (Admin)
// @access  Private/Admin
router.post('/:id/create-shipment', protect, admin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.shipmozoAwb) {
      return res.status(400).json({ message: 'Shipment already created for this order' });
    }

    if (order.paymentStatus !== 'paid') {
      return res.status(400).json({ message: 'Cannot create shipment for unpaid order' });
    }

    // Get user details
    const user = await User.findById(order.user);

    // Create shipment
    const shipmozoResult = await shipmozoService.createShipment({
      order: order,
      user: user
    });

    if (shipmozoResult.success) {
      order.shipmozoAwb = shipmozoResult.awb;
      order.courierName = shipmozoResult.courier_name;
      order.trackingUrl = shipmozoResult.tracking_url;
      order.shipmentStatus = shipmozoResult.status || 'created';
      order.shippingPending = false;
      order.status = 'packed';
      await order.save();

      return res.json({
        success: true,
        message: 'Shipment created successfully',
        order
      });
    } else {
      order.shippingPending = true;
      await order.save();

      return res.status(500).json({
        success: false,
        message: shipmozoResult.error || 'Failed to create shipment',
        shippingPending: true
      });
    }
  } catch (error) {
    console.error('Create shipment error:', error);
    res.status(500).json({ message: error.message || 'Failed to create shipment' });
  }
});

export default router;