import mongoose from 'mongoose';

const flashSaleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  products: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    salePrice: {
      type: Number,
      required: true
    },
    stock: {
      type: Number,
      required: true
    },
    sold: {
      type: Number,
      default: 0
    }
  }],
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  bannerImage: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Check if flash sale is currently active
flashSaleSchema.methods.isCurrentlyActive = function() {
  const now = new Date();
  return this.isActive && now >= this.startTime && now <= this.endTime;
};

const FlashSale = mongoose.model('FlashSale', flashSaleSchema);

export default FlashSale;


