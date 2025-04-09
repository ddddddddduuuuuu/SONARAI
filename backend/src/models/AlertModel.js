const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: [
      'whale_movement',      // Whale fund movement
      'price_change',        // Price change
      'whale_accumulation',  // Whale accumulation
      'whale_distribution',  // Whale distribution
      'fund_flow',           // Fund flow
      'liquidity_change',    // Liquidity change
      'trading_volume_spike', // Trading volume spike
      'whale_new_token',     // Whale interest in new token
      'custom',              // Custom alert
    ],
    required: true,
  },
  token: {
    type: String,
    required: true,
    index: true,
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  source: {
    type: String, // Alert source: system, user, algorithm
    enum: ['system', 'user', 'algorithm'],
    default: 'system',
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
  expiration: {
    type: Date,
    default: function() {
      // Default expiration: 24 hours
      const date = new Date();
      date.setHours(date.getHours() + 24);
      return date;
    },
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  relatedWhales: [{
    type: String, // Related whale wallet addresses
  }],
  relatedTxs: [{
    type: String, // Related transaction hashes
  }],
  // Fields for user-defined alerts
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
  },
  isBroadcast: {
    type: Boolean, // Whether to broadcast to all users
    default: true,
  },
  viewCount: {
    type: Number, // View count
    default: 0,
  },
  actionCount: {
    type: Number, // Action count
    default: 0,
  },
  feedback: {
    useful: {
      type: Number,
      default: 0,
    },
    notUseful: {
      type: Number,
      default: 0,
    },
  },
});

// Indexes for query optimization
AlertSchema.index({ timestamp: -1 });
AlertSchema.index({ severity: 1 });
AlertSchema.index({ isActive: 1 });
AlertSchema.index({ type: 1, token: 1 });

// Mark alert as read, increment view count
AlertSchema.methods.markAsRead = async function() {
  this.viewCount += 1;
  return this.save();
};

// Virtual field: Is the alert expired
AlertSchema.virtual('isExpired').get(function() {
  return this.expiration < new Date();
});

// Virtual field: Alert effectiveness score
AlertSchema.virtual('effectivenessScore').get(function() {
  if (this.viewCount === 0) return 0;
  
  // Calculate effectiveness score based on feedback (0-100)
  const totalFeedback = this.feedback.useful + this.feedback.notUseful;
  if (totalFeedback === 0) return 50; // Default medium score
  
  // Positive feedback ratio * 100
  return Math.round((this.feedback.useful / totalFeedback) * 100);
});

// Static method: Count today's alerts by type
AlertSchema.statics.countTodayAlertsByType = async function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return this.aggregate([
    {
      $match: {
        timestamp: { $gte: today },
        isActive: true
      }
    },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 }
      }
    }
  ]);
};

const Alert = mongoose.model('Alert', AlertSchema);

module.exports = Alert; 