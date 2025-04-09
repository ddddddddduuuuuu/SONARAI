const Whale = require('../models/WhaleModel');

/**
 * Get list of whale wallets
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.getWhales = async (req, res) => {
  try {
    const { page = 1, limit = 20, sort = 'totalValue', order = 'desc' } = req.query;
    
    // Build sort options
    const sortOptions = {};
    sortOptions[sort] = order === 'desc' ? -1 : 1;
    
    // Paginated query
    const whales = await Whale.find()
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .select('address label category totalValue lastActivity activityScore influenceRank');
    
    // Calculate total count
    const total = await Whale.countDocuments();
    
    res.json({
      whales,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching whale wallets:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get top 10 influential whales
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.getTopWhales = async (req, res) => {
  try {
    const whales = await Whale.find()
      .sort({ influenceRank: 1 }) // Lower influenceRank means higher influence
      .limit(10)
      .select('address label category totalValue lastActivity activityScore influenceRank');
    
    res.json({ whales });
  } catch (error) {
    console.error('Error fetching top whales:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get specific whale wallet details
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.getWhaleByAddress = async (req, res) => {
  try {
    const { address } = req.params;
    
    const whale = await Whale.findOne({ address });
    
    if (!whale) {
      return res.status(404).json({ message: 'Whale wallet not found' });
    }
    
    res.json({ whale });
  } catch (error) {
    console.error('Error fetching whale details:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get transaction history for a specific whale
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.getWhaleTransactions = async (req, res) => {
  try {
    const { address } = req.params;
    const { limit = 20 } = req.query;
    
    const whale = await Whale.findOne({ address });
    
    if (!whale) {
      return res.status(404).json({ message: 'Whale wallet not found' });
    }
    
    // Get recent transactions, sorted by time in descending order
    const transactions = (whale.recentTransactions || [])
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, Number(limit));
    
    res.json({
      address,
      transactions
    });
  } catch (error) {
    console.error('Error fetching whale transactions:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get whales holding a specific token
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.getWhalesByToken = async (req, res) => {
  try {
    const { symbol } = req.params;
    
    // Find whales holding this token
    const whales = await Whale.find({
      'holdingTokens.token': symbol.toUpperCase()
    })
    .sort({ 'holdingTokens.valueUSD': -1 })
    .select('address label category totalValue holdingTokens');
    
    // Process results, only return holding information relevant to this token
    const whalesWithTokenHolding = whales.map(whale => {
      const tokenHolding = whale.holdingTokens.find(
        holding => holding.token === symbol.toUpperCase()
      );
      
      return {
        address: whale.address,
        label: whale.label,
        category: whale.category,
        totalValue: whale.totalValue,
        holding: tokenHolding
      };
    });
    
    res.json({
      symbol: symbol.toUpperCase(),
      totalWhales: whalesWithTokenHolding.length,
      whales: whalesWithTokenHolding
    });
  } catch (error) {
    console.error('Error fetching whales by token:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get recently active whales
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.getRecentActiveWhales = async (req, res) => {
  try {
    const { hours = 24 } = req.query;
    
    // Calculate time threshold
    const timeThreshold = new Date();
    timeThreshold.setHours(timeThreshold.getHours() - Number(hours));
    
    // Query recently active whales
    const whales = await Whale.find({
      lastActivity: { $gte: timeThreshold }
    })
    .sort({ lastActivity: -1 })
    .limit(20)
    .select('address label category totalValue lastActivity activityScore');
    
    res.json({
      timeRange: `${hours} hours`,
      count: whales.length,
      whales
    });
  } catch (error) {
    console.error('Error fetching recently active whales:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get whales by behavior type
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.getWhalesByBehavior = async (req, res) => {
  try {
    const { type } = req.params;
    const { limit = 20 } = req.query;
    
    let query = {};
    let behaviorDescription = '';
    
    // Build query conditions based on behavior type
    switch (type) {
      case 'accumulating':
        // Find whales who are accumulating tokens (more buys than sells in recent transactions)
        query = {
          'recentTransactions.type': 'buy',
          $expr: {
            $gt: [
              { $size: { $filter: { input: '$recentTransactions', as: 'tx', cond: { $eq: ['$$tx.type', 'buy'] } } } },
              { $size: { $filter: { input: '$recentTransactions', as: 'tx', cond: { $eq: ['$$tx.type', 'sell'] } } } }
            ]
          }
        };
        behaviorDescription = 'Accumulating tokens';
        break;
        
      case 'distributing':
        // Find whales who are distributing tokens (more sells than buys in recent transactions)
        query = {
          'recentTransactions.type': 'sell',
          $expr: {
            $gt: [
              { $size: { $filter: { input: '$recentTransactions', as: 'tx', cond: { $eq: ['$$tx.type', 'sell'] } } } },
              { $size: { $filter: { input: '$recentTransactions', as: 'tx', cond: { $eq: ['$$tx.type', 'buy'] } } } }
            ]
          }
        };
        behaviorDescription = 'Distributing tokens';
        break;
        
      case 'active':
        // Find actively trading whales (frequent transactions)
        query = {
          activityScore: { $gte: 80 }
        };
        behaviorDescription = 'Active trading';
        break;
        
      case 'inactive':
        // Find inactive whales (no transactions for a long time)
        query = {
          activityScore: { $lte: 20 }
        };
        behaviorDescription = 'Inactive';
        break;
        
      default:
        return res.status(400).json({ message: 'Invalid behavior type' });
    }
    
    // Query whales matching the conditions
    const whales = await Whale.find(query)
      .sort({ totalValue: -1 })
      .limit(Number(limit))
      .select('address label category totalValue lastActivity activityScore');
    
    res.json({
      behavior: behaviorDescription,
      count: whales.length,
      whales
    });
  } catch (error) {
    console.error('Error fetching whales by behavior:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 