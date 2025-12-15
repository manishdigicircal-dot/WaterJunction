import express from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/authMiddleware.js';
import { sendTokenResponse, generateToken, generateRefreshToken } from '../utils/generateToken.js';
import { generateOTP, sendOTP } from '../utils/sendOTP.js';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

const router = express.Router();

// Email transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// @route   POST /api/auth/register
// @desc    Register user with email/password
// @access  Public
router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { name, email, password, phone } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        ...(phone ? [{ phone }] : [])
      ]
    });

    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        return res.status(400).json({ message: 'User already exists with this email' });
      }
      if (phone && existingUser.phone === phone) {
        return res.status(400).json({ message: 'User already exists with this phone number' });
      }
    }

    // Create user
    const userData = {
      name,
      email: email.toLowerCase(),
      password,
      authProvider: 'email',
      isEmailVerified: false
    };

    if (phone) {
      userData.phone = phone;
    }

    const user = await User.create(userData);

    sendTokenResponse(user, 201, res);
  } catch (error) {
    console.error('Error in /api/auth/register:', error);
    res.status(500).json({
      message: error.message || 'Registration failed',
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user with email/password
// @access  Public
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    // Check for user
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password. User not found.' });
    }

    // Check if user has a password (might be OAuth-only user)
    if (!user.password) {
      return res.status(401).json({ 
        message: 'This account was created with social login. Please use Google/Facebook to sign in.' 
      });
    }

    const isPasswordValid = await user.matchPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    if (user.isBlocked) {
      return res.status(403).json({ message: 'Account is blocked. Please contact support.' });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/phone/send-otp
// @desc    Send OTP to phone number
// @access  Public
router.post('/phone/send-otp', [
  body('phone').trim().notEmpty().withMessage('Phone number is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { phone } = req.body;
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Find or create user
    let user = await User.findOne({ phone });
    
    if (!user) {
      user = await User.create({
        phone,
        name: `User${phone.slice(-4)}`,
        authProvider: 'phone',
        isPhoneVerified: false
      });
    }

    // Save OTP
    user.otp = {
      code: otp,
      expiresAt
    };
    await user.save({ validateBeforeSave: false });

    // Send OTP
    const sent = await sendOTP(phone, otp);
    
    if (sent) {
      res.json({ message: 'OTP sent successfully', phone });
    } else {
      res.status(500).json({ message: 'Failed to send OTP' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/phone/verify-otp
// @desc    Verify OTP and login/register
// @access  Public
router.post('/phone/verify-otp', [
  body('phone').trim().notEmpty(),
  body('otp').trim().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Phone and OTP are required' });
    }

    const { phone, otp } = req.body;

    const user = await User.findOne({ phone });

    if (!user || !user.otp) {
      return res.status(400).json({ message: 'Invalid phone number or OTP not sent' });
    }

    if (user.otp.code !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (new Date() > user.otp.expiresAt) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    // Verify user
    user.isPhoneVerified = true;
    user.otp = undefined;
    await user.save({ validateBeforeSave: false });

    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/google
// @desc    Google OAuth login
// @access  Public
router.post('/google', [
  body('googleId').notEmpty(),
  body('email').optional().isEmail(),
  body('name').notEmpty()
], async (req, res) => {
  try {
    const { googleId, email, name, profilePhoto } = req.body;

    let user = await User.findOne({ 
      $or: [{ googleId }, { email: email?.toLowerCase() }]
    });

    if (user) {
      // Update googleId if not set
      if (!user.googleId) {
        user.googleId = googleId;
        user.authProvider = 'google';
      }
      if (profilePhoto) user.profilePhoto = profilePhoto;
      await user.save({ validateBeforeSave: false });
    } else {
      // Create new user
      user = await User.create({
        googleId,
        email: email?.toLowerCase(),
        name,
        profilePhoto: profilePhoto || '',
        authProvider: 'google',
        isEmailVerified: true
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({ message: 'Account is blocked' });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/facebook
// @desc    Facebook OAuth login
// @access  Public
router.post('/facebook', [
  body('facebookId').notEmpty(),
  body('email').optional().isEmail(),
  body('name').notEmpty()
], async (req, res) => {
  try {
    const { facebookId, email, name, profilePhoto } = req.body;

    let user = await User.findOne({ 
      $or: [{ facebookId }, { email: email?.toLowerCase() }]
    });

    if (user) {
      if (!user.facebookId) {
        user.facebookId = facebookId;
        user.authProvider = 'facebook';
      }
      if (profilePhoto) user.profilePhoto = profilePhoto;
      await user.save({ validateBeforeSave: false });
    } else {
      user = await User.create({
        facebookId,
        email: email?.toLowerCase(),
        name,
        profilePhoto: profilePhoto || '',
        authProvider: 'facebook',
        isEmailVerified: true
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({ message: 'Account is blocked' });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Forgot password - send reset email
// @access  Public
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail()
], async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user || user.authProvider !== 'email') {
      return res.status(404).json({ message: 'User not found with this email' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save({ validateBeforeSave: false });

    // Send email
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    
    try {
      await transporter.sendMail({
        to: user.email,
        subject: 'Password Reset Request - WaterJunction',
        html: `
          <h2>Password Reset Request</h2>
          <p>You requested a password reset. Click the link below:</p>
          <a href="${resetUrl}">${resetUrl}</a>
          <p>This link will expire in 10 minutes.</p>
        `
      });

      res.json({ message: 'Password reset email sent' });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save({ validateBeforeSave: false });
      res.status(500).json({ message: 'Email could not be sent' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/auth/reset-password/:token
// @desc    Reset password
// @access  Public
router.put('/reset-password/:token', [
  body('password').isLength({ min: 6 })
], async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profilePhoto: user.profilePhoto,
        addresses: user.addresses
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/refresh-token
// @desc    Refresh access token
// @access  Public
router.post('/refresh-token', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token required' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const token = generateToken(user._id);
    res.json({
      success: true,
      token
    });
  } catch (error) {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.refreshToken = undefined;
    await user.save({ validateBeforeSave: false });

    res.cookie('token', 'none', {
      expires: new Date(Date.now()),
      httpOnly: true
    });

    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

