const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  tier: {
    type: String,
    enum: ['free', 'basic', 'premium'],
    default: 'free',
  },
  walletAddress: {
    type: String,
    unique: true,
    sparse: true, // Allow multiple documents to not have this field
  },
  avatarUrl: {
    type: String,
    default: null,
  },
  sonarBalance: {
    type: Number,
    default: 0,
  },
  watchlist: [{
    token: {
      type: String,
      required: true,
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
    alertSettings: {
      priceChange: {
        enabled: { type: Boolean, default: false },
        threshold: { type: Number, default: 5 }, // Percentage
      },
      whaleMovement: {
        enabled: { type: Boolean, default: false },
        threshold: { type: Number, default: 1000000 }, // Value threshold
      },
      fundFlow: {
        enabled: { type: Boolean, default: false },
      },
    },
  }],
  alertPreferences: {
    email: {
      enabled: { type: Boolean, default: true },
      frequency: { type: String, enum: ['instant', 'hourly', 'daily'], default: 'instant' },
    },
    push: {
      enabled: { type: Boolean, default: true },
    },
    minSeverity: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
  },
  lastLogin: {
    type: Date,
    default: null,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  userRole: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Automatically update updatedAt field when saving
UserSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Only hash password when it's modified or for new users
  if (this.isModified('password')) {
    this.password = bcrypt.hashSync(this.password, 10);
  }
  
  next();
});

// Compare password method
UserSchema.methods.comparePassword = function(candidatePassword) {
  return bcrypt.compareSync(candidatePassword, this.password);
};

// Virtual field: Service permissions
UserSchema.virtual('permissions').get(function() {
  switch (this.tier) {
    case 'premium':
      return {
        maxWatchlistTokens: 50,
        maxCustomAlerts: 20,
        accessToAiPredictions: true,
        accessToWhaleTracking: true,
        accessToHistoricalData: true,
        accessToAdvancedAnalytics: true,
      };
    case 'basic':
      return {
        maxWatchlistTokens: 20,
        maxCustomAlerts: 10,
        accessToAiPredictions: false,
        accessToWhaleTracking: true,
        accessToHistoricalData: true,
        accessToAdvancedAnalytics: false,
      };
    default: // free
      return {
        maxWatchlistTokens: 5,
        maxCustomAlerts: 3,
        accessToAiPredictions: false,
        accessToWhaleTracking: false,
        accessToHistoricalData: false,
        accessToAdvancedAnalytics: false,
      };
  }
});

// Indexes for query optimization
UserSchema.index({ username: 1 });
UserSchema.index({ email: 1 });
UserSchema.index({ tier: 1 });
UserSchema.index({ walletAddress: 1 });

const User = mongoose.model('User', UserSchema);

module.exports = User; 