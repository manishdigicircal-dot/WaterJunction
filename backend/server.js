import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import Routes
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import flashSaleRoutes from './routes/flashSaleRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import contactRoutes from './routes/contactRoutes.js';

// Import Error Handlers
import { errorHandler, notFound } from './middleware/errorMiddleware.js';

dotenv.config();

const app = express();
app.set('trust proxy', 1);
// Middleware
app.use(compression()); // Enable gzip compression for all responses

// Configure Helmet with appropriate CSP for Razorpay and API access
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'", // Needed for inline scripts
        "'unsafe-eval'", // Needed for some React/Vite scripts
        "https://checkout.razorpay.com", // Razorpay checkout script
        "https://js.stripe.com" // In case Stripe is used later
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'", // Needed for inline styles
        "https://fonts.googleapis.com"
      ],
      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com",
        "data:"
      ],
      imgSrc: [
        "'self'",
        "data:",
        "blob:",
        "https:", // Allow all HTTPS images (for Cloudinary, CDNs, etc.)
        "http://localhost:*" // Allow localhost images in development
      ],
      connectSrc: [
        "'self'", // Same origin (frontend and backend on same domain)
        "https://waterjunction.onrender.com", // Render backend domain
        "https://water-junction.vercel.app", // Vercel frontend domain
        "https://*.vercel.app", // All Vercel deployments
        "http://localhost:5000", // Development backend
        "http://localhost:5173", // Development frontend
        "https://api.razorpay.com", // Razorpay API
        "https://checkout.razorpay.com",
        "ws://localhost:*", // WebSocket for dev
        "wss://*" // WebSocket secure for production
      ],
      frameSrc: [
        "'self'",
        "https://checkout.razorpay.com", // Razorpay checkout iframe
        "https://js.stripe.com"
      ],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null
    }
  },
  crossOriginEmbedderPolicy: false // Allow embedding Razorpay checkout
}));

app.use(morgan('dev'));
// app.use(cors({
//   origin: process.env.FRONTEND_URL || 'http://localhost:5173',
//   credentials: true
// }));mn



app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps, curl)
    if (!origin) return callback(null, true);

    return callback(null, true); // allow all trusted origins
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Cache-Control'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400 // 24 hours
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Rate Limiting - More permissive for better UX
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Increased from 100 to 300 requests per 15 minutes
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/api/health';
  }
});

// Apply rate limiting to all API routes
app.use('/api/', limiter);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'WaterJunction API is running' });
});

// ============================================
// API ROUTES - MUST BE BEFORE STATIC SERVING
// ============================================
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/flash-sales', flashSaleRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contact', contactRoutes);

// ============================================
// 404 HANDLER for unmatched API routes - BEFORE static serving
// ============================================
app.use((req, res, next) => {
  // If it's an API route and hasn't been handled, send 404 JSON
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ 
      success: false,
      message: `API route not found: ${req.method} ${req.path}` 
    });
  }
  next(); // Continue to next middleware (static serving or catch-all)
});

// ============================================
// REACT FRONTEND SERVING - MUST BE AFTER ALL API ROUTES
// ============================================
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  });
}

// ============================================
// ERROR HANDLERS - MUST BE ABSOLUTELY LAST
// ============================================
app.use(notFound);
app.use(errorHandler);




// Support both MONGO_URI and MONGODB_URI for compatibility
const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

if (!mongoUri) {
  console.error('❌ MONGO_URI or MONGODB_URI is missing in environment variables');
  console.error('💡 Please set MONGO_URI or MONGODB_URI in your .env file');
  console.error('💡 For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/database');
  console.error('💡 For local MongoDB: mongodb://localhost:27017/database');
  process.exit(1);
}

mongoose
  .connect(mongoUri, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  })
  .then(() => {
    console.log('✅ MongoDB Connected Successfully');

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  })
  .catch((error) => {
    console.error('❌ MongoDB Connection Error:', error);
    process.exit(1);
  });


export default app;



