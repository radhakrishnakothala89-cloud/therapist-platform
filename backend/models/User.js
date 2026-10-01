const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ['therapist', 'client', 'admin'],
      default: 'therapist',
    },
    // Day 6: Subscription Tier for Centralized Entitlement
    subscriptionTier: {
      type: String,
      enum: ['FREE', 'BASIC', 'PRO'],
      default: 'FREE',
    },
    // Day 5: Session packages / credits for clients
    sessionBalance: {
      type: Number,
      default: 0,
    },
    // Optional therapist details
    specialization: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

// Prevent overwriting the model if it is already compiled
module.exports = mongoose.models.User || mongoose.model('User', userSchema);