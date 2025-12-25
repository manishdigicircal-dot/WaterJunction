import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  images: [{
    type: String
  }],
  video: {
    type: String,
    default: ''
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  mrp: {
    type: Number,
    required: true,
    min: 0
  },
  discountPercent: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  stock: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  // Specifications
  specifications: {
    performanceFeatures: {
      type: Map,
      of: String,
      default: {}
    },
    warranty: {
      type: Map,
      of: String,
      default: {}
    },
    general: {
      type: Map,
      of: String,
      default: {}
    },
    dimensions: {
      type: Map,
      of: String,
      default: {}
    }
  },
  // Variants (colors, sizes, etc.)
  variants: [{
    name: String,
    value: String,
    price: Number,
    stock: Number,
    image: String
  }],
  // Q&A Section
  questions: [{
    question: String,
    answer: String,
    askedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    answeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    answeredAt: Date,
    isApproved: {
      type: Boolean,
      default: false
    }
  }],
  // Related Products
  relatedProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  },
  sales: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Auto-calculate discount percent
productSchema.pre('save', function(next) {
  if (this.mrp && this.price) {
    this.discountPercent = Math.round(((this.mrp - this.price) / this.mrp) * 100);
  }
  next();
});

// Auto-generate slug only if name is modified and slug is not explicitly set
// No length limit - unlimited slug length
productSchema.pre('save', function(next) {
  if ((this.isModified('name') || this.isNew) && !this.isModified('slug')) {
    if (this.name) {
      this.slug = this.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      // No truncation - unlimited length
    }
  }
  // No truncation for slug - unlimited
  next();
});

// No truncation for specifications - keys and values are unlimited
productSchema.pre('save', function(next) {
  // No truncation - all specifications keys and values are unlimited
  // Just ensure they are valid Maps
  if (this.specifications) {
    const specSections = ['performanceFeatures', 'warranty', 'general', 'dimensions'];
    
    for (const section of specSections) {
      if (this.specifications[section] && this.specifications[section] instanceof Map) {
        // Keep as is - no truncation
        // Maps are already valid, no need to recreate
      }
    }
  }
  next();
});

// Performance indexes for common queries
// Compound index for category + isActive (most common filter)
productSchema.index({ category: 1, isActive: 1 });

// Index for sorting by price
productSchema.index({ price: 1 });

// Index for sorting by ratings
productSchema.index({ 'ratings.average': -1 });

// Index for sorting by date
productSchema.index({ createdAt: -1 });

// Index for name search (regex queries)
productSchema.index({ name: 1 });

// Index for isActive filter
productSchema.index({ isActive: 1 });

const Product = mongoose.model('Product', productSchema);

export default Product;
