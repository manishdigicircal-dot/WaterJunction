import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1
    },
    variant: {
      name: String,
      value: String
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  coupon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coupon'
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Calculate cart totals (virtual)
cartSchema.virtual('totalItems').get(function() {
  return this.items.reduce((sum, item) => sum + item.quantity, 0);
});

// PERFORMANCE: Add indexes for faster queries
// Note: user field already has index due to unique: true
cartSchema.index({ 'items.product': 1 }); // For product lookups
cartSchema.index({ lastUpdated: -1 }); // For sorting

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;
