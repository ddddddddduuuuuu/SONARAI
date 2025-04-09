const Token = require('../models/TokenModel');

/**
 * 获取代币列表
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.getTokens = async (req, res) => {
  try {
    const { page = 1, limit = 20, sort = 'marketCap', order = 'desc' } = req.query;
    
    // 构建排序条件
    const sortOptions = {};
    sortOptions[sort] = order === 'desc' ? -1 : 1;
    
    // 分页查询
    const tokens = await Token.find()
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .select('symbol name currentPrice priceChangePercentage24h marketCap volume24h whaleInterest movementTrend');
    
    // 计算总数
    const total = await Token.countDocuments();
    
    res.json({
      tokens,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('获取代币列表错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

/**
 * 获取热门代币
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.getTrendingTokens = async (req, res) => {
  try {
    // 实际项目中，这里应该使用复杂的算法计算热门代币
    // 对于MVP，我们使用一个简单的查询，基于大户关注度和交易量
    
    const tokens = await Token.find({
      $or: [
        { whaleInterest: { $in: ['High', 'Very High'] } },
        { volume24h: { $gte: 1000000 } } // 日交易量大于100万美元
      ]
    })
    .sort({ whaleInterest: -1, volume24h: -1 })
    .limit(10)
    .select('symbol name currentPrice priceChangePercentage24h whaleInterest movementTrend');
    
    res.json({ tokens });
  } catch (error) {
    console.error('获取热门代币错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

/**
 * 获取特定代币详情
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.getTokenBySymbol = async (req, res) => {
  try {
    const { symbol } = req.params;
    
    const token = await Token.findOne({ symbol: symbol.toUpperCase() });
    
    if (!token) {
      return res.status(404).json({ message: '未找到该代币' });
    }
    
    res.json({ token });
  } catch (error) {
    console.error('获取代币详情错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

/**
 * 获取代币价格历史
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.getTokenPriceHistory = async (req, res) => {
  try {
    const { symbol } = req.params;
    const { period = '24h' } = req.query;
    
    const token = await Token.findOne({ symbol: symbol.toUpperCase() });
    
    if (!token) {
      return res.status(404).json({ message: '未找到该代币' });
    }
    
    // 根据用户会员等级和请求的时间段过滤历史数据
    let priceHistory = token.priceHistory || [];
    
    // 如果用户已认证，则检查其会员等级
    if (req.user) {
      // 基础会员和高级会员可以访问更长时间段的历史数据
      if (['basic', 'premium'].includes(req.user.tier)) {
        // 不限制数据访问
      } else {
        // 免费用户只能访问最近24小时的数据
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);
        priceHistory = priceHistory.filter(item => item.timestamp >= oneDayAgo);
      }
    } else {
      // 未认证用户只能访问最近24小时的数据
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      priceHistory = priceHistory.filter(item => item.timestamp >= oneDayAgo);
    }
    
    // 根据请求的时间段进一步过滤数据
    const now = new Date();
    let filterDate = new Date();
    
    switch (period) {
      case '1h':
        filterDate.setHours(now.getHours() - 1);
        break;
      case '24h':
        filterDate.setDate(now.getDate() - 1);
        break;
      case '7d':
        filterDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        filterDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        filterDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        filterDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        filterDate.setDate(now.getDate() - 1); // 默认24小时
    }
    
    priceHistory = priceHistory.filter(item => item.timestamp >= filterDate);
    
    res.json({
      symbol: token.symbol,
      period,
      priceHistory
    });
  } catch (error) {
    console.error('获取代币价格历史错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

/**
 * 获取代币大户活动
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.getTokenWhaleActivity = async (req, res) => {
  try {
    const { symbol } = req.params;
    
    // 在实际项目中，这里应该查询与该代币相关的大户活动
    // 对于MVP，我们返回模拟数据
    
    const mockWhaleActivity = [
      {
        id: 'wa1',
        whaleAddress: '5YourSolanaWhaleAddress1234567890',
        whaleLabel: 'Whale #1',
        action: 'buy',
        amount: 250000,
        valueUSD: 125000,
        timestamp: new Date(Date.now() - 3600000), // 1小时前
      },
      {
        id: 'wa2',
        whaleAddress: '5AnotherSolanaWhaleAddress2345678901',
        whaleLabel: 'Whale #2',
        action: 'sell',
        amount: 150000,
        valueUSD: 75000,
        timestamp: new Date(Date.now() - 7200000), // 2小时前
      },
      {
        id: 'wa3',
        whaleAddress: '5ThirdSolanaWhaleAddress3456789012',
        whaleLabel: 'Institution #1',
        action: 'buy',
        amount: 500000,
        valueUSD: 250000,
        timestamp: new Date(Date.now() - 10800000), // 3小时前
      },
      {
        id: 'wa4',
        whaleAddress: '5FourthSolanaWhaleAddress4567890123',
        whaleLabel: 'Project Fund',
        action: 'transfer_in',
        amount: 1000000,
        valueUSD: 500000,
        timestamp: new Date(Date.now() - 14400000), // 4小时前
      },
    ];
    
    res.json({
      symbol,
      whaleActivity: mockWhaleActivity
    });
  } catch (error) {
    console.error('获取代币大户活动错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

/**
 * Get token analysis
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.getTokenAnalysis = async (req, res) => {
  try {
    const { symbol } = req.params;
    
    const token = await Token.findOne({ symbol: symbol.toUpperCase() });
    
    if (!token) {
      return res.status(404).json({ message: 'Token not found' });
    }
    
    // In a real project, complex analysis algorithms would run here
    // For MVP, we return mock analysis data
    
    const mockAnalysis = {
      symbol: token.symbol,
      name: token.name,
      summary: `${token.name}(${token.symbol}) is currently in ${token.movementTrend === 'Accumulating' ? 'accumulation' : token.movementTrend === 'Distributing' ? 'distribution' : 'holding'} phase, with ${token.whaleInterest} whale interest.`,
      technicalAnalysis: {
        trend: token.priceChangePercentage24h > 0 ? 'bullish' : 'bearish',
        supportLevels: [token.currentPrice * 0.9, token.currentPrice * 0.8],
        resistanceLevels: [token.currentPrice * 1.1, token.currentPrice * 1.2],
        volumeAnalysis: token.volume24h > 1000000 ? 'high' : 'moderate',
      },
      whaleAnalysis: {
        behavior: token.movementTrend,
        concentrationRisk: token.whalePercentage > 50 ? 'high' : token.whalePercentage > 30 ? 'medium' : 'low',
        recentActivity: token.whaleInterest === 'Very High' ? 'very_active' : token.whaleInterest === 'High' ? 'active' : 'moderate',
        topWhalesCount: Math.floor(Math.random() * 10) + 5,
      },
      marketSentiment: {
        overall: Math.random() > 0.5 ? 'positive' : 'negative',
        socialMediaBuzz: Math.floor(Math.random() * 100),
        developmentActivity: Math.floor(Math.random() * 100),
      },
      riskAssessment: {
        overallRisk: token.riskScore,
        liquidityRisk: token.liquidityScore,
        volatilityRisk: Math.floor(Math.random() * 100),
        concentrationRisk: token.whalePercentage,
      },
      prediction: {
        shortTerm: token.priceChangePercentage24h > 5 ? 'strong_buy' : token.priceChangePercentage24h > 0 ? 'buy' : token.priceChangePercentage24h > -5 ? 'hold' : 'sell',
        confidence: Math.floor(Math.random() * 40) + 60, // Confidence between 60-100
        disclaimer: 'This prediction is for informational purposes only and does not constitute investment advice. Markets are risky, invest with caution.',
      }
    };
    
    res.json({
      token: {
        symbol: token.symbol,
        name: token.name,
        currentPrice: token.currentPrice,
        priceChangePercentage24h: token.priceChangePercentage24h,
      },
      analysis: mockAnalysis
    });
  } catch (error) {
    console.error('Error getting token analysis:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get high risk tokens
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.getHighRiskTokens = async (req, res) => {
  try {
    // Query tokens with high risk scores
    const tokens = await Token.find({ riskScore: { $gte: 70 } })
      .sort({ riskScore: -1 })
      .limit(10)
      .select('symbol name currentPrice riskScore liquidityScore whalePercentage');
    
    res.json({ tokens });
  } catch (error) {
    console.error('Error getting high risk tokens:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * 获取潜在机会代币
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.getOpportunityTokens = async (req, res) => {
  try {
    // 在实际项目中，这里应该运行复杂的算法寻找潜在机会
    // 对于MVP，我们使用简单的条件查询
    
    const tokens = await Token.find({
      whaleInterest: { $in: ['High', 'Very High'] },
      movementTrend: 'Accumulating',
      riskScore: { $lt: 50 }, // 风险较低
    })
    .sort({ whaleInterest: -1 })
    .limit(10)
    .select('symbol name currentPrice priceChangePercentage24h whaleInterest movementTrend');
    
    res.json({ tokens });
  } catch (error) {
    console.error('获取潜在机会代币错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
}; 