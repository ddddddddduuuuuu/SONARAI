const mongoose = require('mongoose');

const TokenSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
  },
  contractAddress: {
    type: String,
    required: true,
    unique: true,
  },
  decimals: {
    type: Number,
    required: true,
  },
  currentPrice: {
    type: Number,
    default: 0,
  },
  priceChangePercentage24h: {
    type: Number,
    default: 0,
  },
  marketCap: {
    type: Number,
    default: 0,
  },
  volume24h: {
    type: Number,
    default: 0,
  },
  circulatingSupply: {
    type: Number,
    default: 0,
  },
  totalSupply: {
    type: Number,
    default: 0,
  },
  maxSupply: {
    type: Number,
    default: null,
  },
  totalHolders: {
    type: Number,
    default: 0,
  },
  whalePercentage: {
    type: Number, // Percentage of supply held by whales
    default: 0,
  },
  whaleHoldingValue: {
    type: Number, // Value of whale holdings in USD
    default: 0,
  },
  whaleInterest: {
    type: String, // Whale interest level
    enum: ['Low', 'Medium', 'High', 'Very High'],
    default: 'Low',
  },
  movementTrend: {
    type: String, // Whale behavior trend
    enum: ['Accumulating', 'Distributing', 'Holding', 'Mixed', 'Unknown'],
    default: 'Unknown',
  },
  liquidityScore: {
    type: Number, // Liquidity score (0-100)
    min: 0,
    max: 100,
    default: 50,
  },
  riskScore: {
    type: Number, // Risk score (0-100)
    min: 0,
    max: 100,
    default: 50,
  },
  priceHistory: [{ 
    timestamp: Date,
    price: Number,
    volume: Number,
  }],
  tags: [String],
  website: String,
  twitter: String,
  telegram: String,
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
TokenSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Calculate token price trend
TokenSchema.virtual('priceTrend').get(function() {
  if (this.priceChangePercentage24h > 10) return 'strong_up';
  if (this.priceChangePercentage24h > 5) return 'up';
  if (this.priceChangePercentage24h > 0) return 'slight_up';
  if (this.priceChangePercentage24h > -5) return 'slight_down';
  if (this.priceChangePercentage24h > -10) return 'down';
  return 'strong_down';
});

// Indexes for query optimization
TokenSchema.index({ currentPrice: -1 });
TokenSchema.index({ marketCap: -1 });
TokenSchema.index({ volume24h: -1 });
TokenSchema.index({ whaleInterest: 1 });
TokenSchema.index({ movementTrend: 1 });

const Token = mongoose.model('Token', TokenSchema);

module.exports = Token; 