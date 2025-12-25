import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    sparse: true,
    index: true
  },
  phone: {
    type: String,
    trim: true,
    sparse: true,
    index: true
  },
  password: {
    type: String,
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  isPhoneVerified: {
    type: Boolean,
    default: false
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  otp: {
    code: String,
    expiresAt: Date
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  profilePhoto: {
    type: String,
    default: ''
  },
  addresses: [{
    name: String,
    phone: String,
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
    pincode: String,
    country: {
      type: String,
      default: 'India'
    },
    isDefault: {
      type: Boolean,
      default: false
    }
  }],
  authProvider: {
    type: String,
    enum: ['email', 'phone', 'google', 'facebook'],
    default: 'email'
  },
  googleId: String,
  facebookId: String,
  refreshToken: String
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Ensure email/phone cannot be changed after creation
userSchema.pre('save', function(next) {
  if (this.isModified('email') && this.email && this._originalEmail) {
    return next(new Error('Email cannot be changed'));
  }
  if (this.isModified('phone') && this.phone && this._originalPhone) {
    return next(new Error('Phone cannot be changed'));
  }
  next();
});

// Store original values on creation
userSchema.pre('save', function(next) {
  if (this.isNew) {
    this._originalEmail = this.email;
    this._originalPhone = this.phone;
  }
  next();
});

const User = mongoose.model('User', userSchema);

export default User;









import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    sparse: true,
    index: true
  },
  phone: {
    type: String,
    trim: true,
    sparse: true,
    index: true
  },
  password: {
    type: String,
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  isPhoneVerified: {
    type: Boolean,
    default: false
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  otp: {
    code: String,
    expiresAt: Date
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  profilePhoto: {
    type: String,
    default: ''
  },
  addresses: [{
    name: String,
    phone: String,
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
    pincode: String,
    country: {
      type: String,
      default: 'India'
    },
    isDefault: {
      type: Boolean,
      default: false
    }
  }],
  authProvider: {
    type: String,
    enum: ['email', 'phone', 'google', 'facebook'],
    default: 'email'
  },
  googleId: String,
  facebookId: String,
  refreshToken: String
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Ensure email/phone cannot be changed after creation
userSchema.pre('save', function(next) {
  if (this.isModified('email') && this.email && this._originalEmail) {
    return next(new Error('Email cannot be changed'));
  }
  if (this.isModified('phone') && this.phone && this._originalPhone) {
    return next(new Error('Phone cannot be changed'));
  }
  next();
});

// Store original values on creation
userSchema.pre('save', function(next) {
  if (this.isNew) {
    this._originalEmail = this.email;
    this._originalPhone = this.phone;
  }
  next();
});

const User = mongoose.model('User', userSchema);

export default User;












