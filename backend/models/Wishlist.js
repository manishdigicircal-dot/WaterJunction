import mongoose from 'mongoose';

const wishlistSchema = new mongoose.Schema({
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
    addedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// PERFORMANCE: Add index on user field for faster queries
wishlistSchema.index({ user: 1 });
wishlistSchema.index({ 'items.product': 1 }); // For product lookups

const Wishlist = mongoose.model('Wishlist', wishlistSchema);

export default Wishlist;







