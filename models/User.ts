import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  // Allow string IDs from Firebase
  _id: {
    type: String,
    required: true,
  },
  uid: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    sparse: true, // Allow null values for mobile-only users
  },
  mobile: {
    type: String,
    sparse: true, // Allow null values for email-only users
  },
  password: {
    type: String,
    select: false, // Don't include in queries by default
  },
  googleId: {
    type: String,
    sparse: true, // Allow null values
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  shippingAddress: {
    fullName: String,
    address: String,
    city: String,
    state: String,
    zipCode: String,
    country: {
      type: String,
      default: 'India',
    },
    phone: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  lastLogin: {
    type: Date,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  otp: {
    type: String,
    select: false,
  },
  otpExpires: {
    type: Date,
    select: false,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
}, {
  // Disable automatic _id generation since we're setting it manually
  _id: false,
  // Disable auto indexing to prevent conflicts
  autoIndex: false,
});

// Pre-save hook to hash password
userSchema.pre('save', async function (next) {
  const user = this as any;

  if (!user.isModified('password')) {
    return next();
  }

  // Check if it's already hashed (starts with $2a$ or $2b$) 
  // to avoid double hashing from manual hashing in routes
  if (typeof user.password === 'string' && user.password.startsWith('$2')) {
    console.log('Password already hashed, skipping hook');
    return next();
  }

  try {
    console.log('Hashing password for user...', user.email);
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    console.log('Password hashed successfully');
    next();
  } catch (error: any) {
    console.error('Password hashing error:', error);
    next(error);
  }
});

// Add comparePassword method
userSchema.methods.comparePassword = async function (candidatePassword: string) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Create the model
// In development, we may want to delete the model from cache to apply schema changes
if (process.env.NODE_ENV === 'development') {
  delete (mongoose as any).models.User;
}

const UserModel = mongoose.models.User || mongoose.model('User', userSchema);

export default UserModel;