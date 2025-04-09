/**
 * Analytics Service
 * Provides data analysis and prediction functions
 */

const Whale = require('../models/WhaleModel');
const Token = require('../models/TokenModel');
const Alert = require('../models/AlertModel');
const mongoose = require('mongoose');
require('dotenv').config();

/**
 * Get market overview data
 * @returns {Promise<Object>} Market overview data
 */
const getMarketOverview = async () => {
  try {
    // Get active token count
    const activeTokensCount = await Token.countDocuments({ isActive: true });
    
    // Get tracked whale count
    const whalesCount = await Whale.countDocuments({ isActive: true });
    
    // Get today's generated alert count
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const alertsToday = await Alert.countDocuments({
      createdAt: { $gte: today },
      isActive: true
    });
    
    // Get alert trend for the last 7 days
    const last7Days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date();
      day.setDate(day.getDate() - i);
      day.setHours(0, 0, 0, 0);
      
      const nextDay = new Date(day);
      nextDay.setDate(nextDay.getDate() + 1);
      
      const count = await Alert.countDocuments({
        createdAt: { $gte: day, $lt: nextDay },
        isActive: true
      });
      
      last7Days.unshift({
        date: day.toISOString().split('T')[0],
        count
      });
    }
    
    return {
      activeTokensCount,
      whalesCount,
      alertsToday,
      alertsTrend: last7Days
    };
  } catch (error) {
    console.error('Failed to get market overview:', error);
    throw new Error('Failed to get market overview');
  }
};

/**
 * Analyze whale behavior pattern
 * @param {string} address Whale address
 * @returns {Promise<Object>} Behavior analysis results
 */
const analyzeWhalePattern = async (address) => {
  try {
    // Get whale data
    const whale = await Whale.findOne({ address });
    if (!whale) {
      throw new Error('Whale address does not exist');
    }
    
    // Get this whale's transaction records
    // Note: This assumes there is a transaction record collection, in a real project might need to get from other services
    const transactions = []; // Example, should be fetched from transaction records
    
    // Analyze transaction patterns
    const buyCount = transactions.filter(tx => tx.type === 'buy').length;
    const sellCount = transactions.filter(tx => tx.type === 'sell').length;
    const transferCount = transactions.filter(tx => tx.type === 'transfer').length;
    
    // Calculate buy/sell ratio
    const buySellRatio = sellCount > 0 ? buyCount / sellCount : buyCount;
    
    // Analyze transaction time distribution
    const timeDistribution = {
      morning: 0,   // 6-12
      afternoon: 0, // 12-18
      evening: 0,   // 18-24
      night: 0      // 0-6
    };
    
    transactions.forEach(tx => {
      const hour = new Date(tx.timestamp).getHours();
      if (hour >= 6 && hour < 12) timeDistribution.morning++;
      else if (hour >= 12 && hour < 18) timeDistribution.afternoon++;
      else if (hour >= 18 && hour < 24) timeDistribution.evening++;
      else timeDistribution.night++;
    });
    
    // Calculate transaction success rate
    const successCount = transactions.filter(tx => tx.status === 'success').length;
    const successRate = transactions.length > 0 ? successCount / transactions.length : 1;
    
    return {
      address: whale.address,
      transactionCount: transactions.length,
      buyCount,
      sellCount,
      transferCount,
      buySellRatio,
      timeDistribution,
      successRate,
      lastActive: whale.lastActivity
    };
  } catch (error) {
    console.error('Failed to analyze whale behavior pattern:', error);
    throw new Error('Failed to analyze whale behavior pattern');
  }
};

/**
 * Predict token price trend
 * @param {string} tokenSymbol Token symbol
 * @returns {Promise<Object>} Prediction results
 */
const predictTokenTrend = async (tokenSymbol) => {
  try {
    // Get token data
    const token = await Token.findOne({ symbol: tokenSymbol });
    if (!token) {
      throw new Error('Token does not exist');
    }
    
    // Get token price history
    // Note: This assumes there is price history data, in a real project might need to get from external API
    const priceHistory = []; // Example, should be fetched from price history
    
    // Simple linear trend prediction (in a real project might use more complex algorithms)
    const recentPrices = priceHistory.slice(-30); // Last 30 days of data
    
    if (recentPrices.length < 2) {
      return {
        token: tokenSymbol,
        trend: 'neutral',
        confidence: 0,
        message: 'Insufficient data for prediction'
      };
    }
    
    // Calculate simple moving averages
    const ma7 = calculateMA(recentPrices, 7);
    const ma21 = calculateMA(recentPrices, 21);
    
    // Determine trend
    let trend = 'neutral';
    let confidence = 0.5;
    
    if (ma7 > ma21) {
      trend = 'bullish';
      confidence = Math.min(0.95, 0.5 + (ma7 - ma21) / ma21);
    } else if (ma7 < ma21) {
      trend = 'bearish';
      confidence = Math.min(0.95, 0.5 + (ma21 - ma7) / ma21);
    }
    
    // Whale activity's impact on the trend
    const recentWhaleActivity = []; // Example, should be fetched from whale activity
    const buyVolume = recentWhaleActivity.filter(a => a.type === 'buy').reduce((sum, a) => sum + a.amount, 0);
    const sellVolume = recentWhaleActivity.filter(a => a.type === 'sell').reduce((sum, a) => sum + a.amount, 0);
    
    // Adjust prediction based on whale buying/selling behavior
    if (buyVolume > sellVolume * 1.5) {
      trend = 'bullish';
      confidence = Math.min(0.95, confidence + 0.1);
    } else if (sellVolume > buyVolume * 1.5) {
      trend = 'bearish';
      confidence = Math.min(0.95, confidence + 0.1);
    }
    
    return {
      token: tokenSymbol,
      trend,
      confidence,
      lastPrice: recentPrices[recentPrices.length - 1],
      ma7,
      ma21,
      whaleActivity: {
        buyVolume,
        sellVolume
      }
    };
  } catch (error) {
    console.error('Failed to predict token trend:', error);
    throw new Error('Failed to predict token trend');
  }
};

/**
 * Calculate moving average
 * @param {Array} prices Price array
 * @param {number} period Period
 * @returns {number} Moving average value
 */
const calculateMA = (prices, period) => {
  if (prices.length < period) return 0;
  const sum = prices.slice(-period).reduce((acc, price) => acc + price, 0);
  return sum / period;
};

/**
 * Get hot token rankings
 * @param {number} limit Limit the number of results
 * @returns {Promise<Array>} Hot token list
 */
const getHotTokens = async (limit = 10) => {
  try {
    // Rank based on alert count, price changes, and whale activity
    // A real project might need more complex algorithms and more data sources
    
    // Example implementation: Sort by the token's heat index (custom field)
    const hotTokens = await Token.find({ isActive: true })
      .sort({ heatIndex: -1 })
      .limit(limit);
    
    return hotTokens.map(token => ({
      symbol: token.symbol,
      name: token.name,
      currentPrice: token.currentPrice,
      priceChange24h: token.priceChange24h,
      volume24h: token.volume24h,
      heatIndex: token.heatIndex
    }));
  } catch (error) {
    console.error('Failed to get hot tokens:', error);
    throw new Error('Failed to get hot tokens');
  }
};

/**
 * Generate smart investment advice
 * @param {string} userAddress User address
 * @returns {Promise<Object>} Investment advice
 */
const generateInvestmentAdvice = async (userAddress) => {
  try {
    // This assumes we have user investment preferences and risk tolerance data
    // In a real project might need to get from user profile or elsewhere
    
    // Get market hot tokens
    const hotTokens = await getHotTokens(5);
    
    // Get recent whale activity
    const recentWhaleActivities = []; // Example, should be fetched from whale activity
    
    // Generate recommendations based on whale activity and market trends
    const recommendations = [];
    
    for (const token of hotTokens) {
      // Predict token trend
      const prediction = await predictTokenTrend(token.symbol);
      
      // Only recommend tokens with clear trends
      if (prediction.confidence > 0.7) {
        recommendations.push({
          token: token.symbol,
          action: prediction.trend === 'bullish' ? 'buy' : (prediction.trend === 'bearish' ? 'sell' : 'hold'),
          confidence: prediction.confidence,
          reason: `Based on ${prediction.trend === 'bullish' ? 'positive' : 'negative'} whale activity and technical indicators`,
          currentPrice: token.currentPrice,
          priceChange24h: token.priceChange24h
        });
      }
    }
    
    return {
      userAddress,
      timestamp: new Date(),
      marketCondition: recommendations.length > 0 ? 
        (recommendations.filter(r => r.action === 'buy').length > recommendations.filter(r => r.action === 'sell').length ? 'bullish' : 'bearish') 
        : 'neutral',
      recommendations
    };
  } catch (error) {
    console.error('Failed to generate investment advice:', error);
    throw new Error('Failed to generate investment advice');
  }
};

module.exports = {
  getMarketOverview,
  analyzeWhalePattern,
  predictTokenTrend,
  getHotTokens,
  generateInvestmentAdvice
}; 