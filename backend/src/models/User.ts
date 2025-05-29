import mongoose, { Document, Schema, Model, Types, Query } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

declare global {
  namespace Express {
    interface User extends IUser {}
  }
}

// Interface for User document
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'user' | 'owner' | 'admin';
  photo?: string;
  bio?: string;
  location?: string;
  website?: string;
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    youtube?: string;
  };
  favorites: Types.ObjectId[];
  recipes: Types.ObjectId[];
  following: Types.ObjectId[];
  followers: Types.ObjectId[];
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  passwordChangedAt?: Date;
  emailVerified: boolean;
  verificationToken?: string;
  verificationTokenExpires?: Date;
  active: boolean;
  loginAttempts: number;
  lockUntil?: number;
  lastLogin?: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  matchPassword(candidatePassword: string): Promise<boolean>; // Alias for comparePassword
  changedPasswordAfter(JWTTimestamp: number): boolean;
  createPasswordResetToken(): string;
  createVerificationToken(): string;
  getSignedJwtToken(): string;
  isAccountLocked(): boolean;
  incrementLoginAttempts(): Promise<void>;
}

// User schema
const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: [50, 'Name cannot be more than 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        'Please provide a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [8, 'Password must be at least 8 characters long'],
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'owner', 'admin'],
      default: 'user',
    },
    photo: {
      type: String,
      default: 'default.jpg',
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot be more than 500 characters'],
    },
    location: {
      type: String,
      maxlength: [100, 'Location cannot be more than 100 characters'],
    },
    website: {
      type: String,
      match: [
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
        'Please provide a valid URL with HTTP or HTTPS',
      ],
    },
    socialMedia: {
      facebook: String,
      twitter: String,
      instagram: String,
      youtube: String,
    },
    favorites: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Recipe',
      },
    ],
    recipes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Recipe',
      },
    ],
    following: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    followers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    passwordResetToken: String,
    passwordResetExpires: Date,
    passwordChangedAt: Date,
    emailVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: String,
    verificationTokenExpires: Date,
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
    loginAttempts: {
      type: Number,
      default: 0,
      select: false,
    },
    lockUntil: {
      type: Number,
      select: false,
    },
    lastLogin: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ 'socialMedia.facebook': 1 });
userSchema.index({ 'socialMedia.twitter': 1 });
userSchema.index({ 'socialMedia.instagram': 1 });
userSchema.index({ 'socialMedia.youtube': 1 });

// Encrypt password using bcrypt before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Update passwordChangedAt when password is modified
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = new Date(Date.now() - 1000); // Ensure token is created after password change
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Alias for comparePassword (for compatibility with some auth libraries)
userSchema.methods.matchPassword = userSchema.methods.comparePassword;

// Method to check if password was changed after JWT was issued
userSchema.methods.changedPasswordAfter = function (JWTTimestamp: number) {
  if (this.passwordChangedAt) {
    const changedTimestamp = Math.floor(this.passwordChangedAt.getTime() / 1000);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Method to create password reset token
userSchema.methods.createPasswordResetToken = function (): string {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  return resetToken;
};

// Method to create email verification token
userSchema.methods.createVerificationToken = function (): string {
  const verificationToken = crypto.randomBytes(32).toString('hex');
  this.verificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');
  this.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  return verificationToken;
};

// Method to sign JWT token
userSchema.methods.getSignedJwtToken = function (): string {
  const payload = { id: this._id, role: this.role };
  const secret = process.env.JWT_SECRET || 'default-secret';
  const expiresIn = process.env.JWT_EXPIRE || '30d';
  
  // Using type assertion to handle the JWT sign return type
  try {
    // @ts-ignore - The JWT sign function has complex overloads that TypeScript struggles with
    return jwt.sign(payload, secret, { expiresIn });
  } catch (error) {
    console.error('Error signing JWT token:', error);
    throw new Error('Failed to generate authentication token');
  }
};

// Method to check if account is locked
userSchema.methods.isAccountLocked = function (): boolean {
  return this.lockUntil && this.lockUntil > Date.now();
};

// Method to increment login attempts and lock account if necessary
userSchema.methods.incrementLoginAttempts = async function () {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 },
    });
  }

  const updates: Record<string, any> = { $inc: { loginAttempts: 1 } };
  if (this.loginAttempts + 1 >= 5) {
    updates.$set = { lockUntil: Date.now() + 60 * 60 * 1000 }; // 1 hour
  }

  return this.updateOne(updates);
};

// Query middleware to filter out inactive users
userSchema.pre<Query<any, IUser>>(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

// Virtual for user's recipe count
userSchema.virtual('recipeCount').get(function (this: IUser) {
  return this.recipes?.length || 0;
});

// Virtual for user's follower count
userSchema.virtual('followerCount').get(function (this: IUser) {
  return this.followers?.length || 0;
});

// Virtual for user's following count
userSchema.virtual('followingCount').get(function (this: IUser) {
  return this.following?.length || 0;
});

const User = mongoose.model<IUser>('User', userSchema);

export default User;