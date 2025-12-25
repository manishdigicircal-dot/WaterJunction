import express from 'express';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import { body, validationResult } from 'express-validator';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import User from '../models/User.js';
import Product from '../models/Product.js';

const router = express.Router();

// Get auth user ID from token
const getUserId = (req) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.id;
  } catch (error) {
    return null;
  }
};

// Shipmozo Shipping Integration
const calculateShipping = async (orderData) => {
  try {
    const shipmozoResponse = await axios.post(
      `${process.env.SHIPMOZO_BASE_URL}/calculate`,
      {
        pickup_pincode: '400001', // Your warehouse pincode
        delivery_pincode: orderData.shippingAddress.pincode,
        weight: orderData.totalWeight || 1,
        dimensions: {
          length: 10,
          width: 10,
          height: 10
        },
        payment_mode: orderData.paymentMethod
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.SHIPMOZO_PRIVATE_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return shipmozoResponse.data;
  } catch (error) {
    console.error('Shipmozo shipping calculation error:', error);
    // Return default shipping if Shipmozo fails
    return {
      shipping_cost: 50,
      estimated_delivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    };
  }
};

// @route   POST /api/orders
// @desc    Create new order
// @access  Private
router.post('/', [
  body('shippingAddress').exists(),
  body('paymentMethod').isIn(['COD', 'ONLINE']),
  body('items').isArray({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const { shippingAddress, paymentMethod, items, couponCode } = req.body;

    // Calculate totals
    let subtotal = 0;
    let totalWeight = 0;

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product || !product.isActive) {
        return res.status(400).json({
          success: false,
          message: `Product ${item.product} not found`
        });
      }

      if (item.quantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}`
        });
      }

      subtotal += product.price * item.quantity;
      totalWeight += (product.weight || 0.5) * item.quantity;

      // Reduce stock
      product.stock -= item.quantity;
      await product.save();
    }

    // Calculate shipping
    const shippingInfo = await calculateShipping({
      shippingAddress,
      paymentMethod,
      totalWeight
    });

    // Apply coupon discount (simplified)
    let discount = 0;
    if (couponCode) {
      // Implement coupon logic here
      discount = 0; // Placeholder
    }

    const total = subtotal + shippingInfo.shipping_cost - discount;

    // Create order
    const order = await Order.create({
      user: userId,
      items,
      shippingAddress,
      paymentMethod,
      subtotal,
      shippingCost: shippingInfo.shipping_cost,
      discount,
      total,
      status: paymentMethod === 'COD' ? 'confirmed' : 'pending',
      estimatedDelivery: shippingInfo.estimated_delivery
    });

    // Clear user's cart
    await Cart.findOneAndUpdate(
      { user: userId },
      { items: [] }
    );

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/orders
// @desc    Get user orders
// @access  Private
router.get('/', async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const orders = await Order.find({ user: userId })
      .populate('items.product', 'name images price')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      orders
    });

  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/orders/:id
// @desc    Get single order
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const order = await Order.findOne({
      _id: req.params.id,
      user: userId
    }).populate('items.product', 'name images price');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      order
    });

  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/orders/:id/cancel
// @desc    Cancel order
// @access  Private
router.put('/:id/cancel', async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const order = await Order.findOne({
      _id: req.params.id,
      user: userId
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Only allow cancellation within 24 hours
    const orderAge = Date.now() - new Date(order.createdAt).getTime();
    const hours24 = 24 * 60 * 60 * 1000;

    if (orderAge > hours24 || order.status !== 'confirmed') {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled'
      });
    }

    // Restore stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: item.quantity } }
      );
    }

    order.status = 'cancelled';
    await order.save();

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      order
    });

  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;
