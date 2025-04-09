const mongoose = require('mongoose');

const WhaleSchema = new mongoose.Schema({
  address: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  label: {
    type: String,
    default: null,
  },
  category: {
    type: String,
    enum: ['institution', 'project', 'individual', 'exchange', 'unknown'],
    default: 'unknown',
  },
  tags: [String],
  totalValue: {
    type: Number,
    default: 0,
  },
  lastActivity: {
    type: Date,
    default: Date.now,
  },
  activityScore: {
    type: Number,
    default: 0,
  },
  holdingTokens: [{
    token: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      default: 0,
    },
    valueUSD: {
      type: Number,
      default: 0,
    },
    percentage: {
      type: Number,
      default: 0,
    },
  }],
  recentTransactions: [{
    txHash: String,
    timestamp: Date,
    tokenSymbol: String,
    amount: Number,
    valueUSD: Number,
    type: {
      type: String,
      enum: ['buy', 'sell', 'transfer_in', 'transfer_out', 'other'],
    },
  }],
  riskScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 50,
  },
  influenceRank: {
    type: Number,
    default: 0,
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
WhaleSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual field: Activity status
WhaleSchema.virtual('activityStatus').get(function() {
  const daysSinceLastActivity = (Date.now() - this.lastActivity) / (1000 * 60 * 60 * 24);
  
  if (daysSinceLastActivity < 1) return 'very_active';
  if (daysSinceLastActivity < 7) return 'active';
  if (daysSinceLastActivity < 30) return 'semi_active';
  return 'inactive';
});

// Index for optimizing activity-based queries
WhaleSchema.index({ lastActivity: -1 });

const Whale = mongoose.model('Whale', WhaleSchema);

module.exports = Whale; 