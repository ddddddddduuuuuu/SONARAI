const express = require('express');
const router = express.Router();
const tokenController = require('../controllers/tokenController');
const { authMiddleware } = require('../utils/authMiddleware');

/**
 * @route GET /api/tokens
 * @desc 获取代币列表
 * @access 公开
 */
router.get('/', tokenController.getTokens);

/**
 * @route GET /api/tokens/trending
 * @desc 获取热门代币
 * @access 公开
 */
router.get('/trending', tokenController.getTrendingTokens);

/**
 * @route GET /api/tokens/:symbol
 * @desc 获取特定代币详情
 * @access 公开
 */
router.get('/:symbol', tokenController.getTokenBySymbol);

/**
 * @route GET /api/tokens/:symbol/price-history
 * @desc 获取代币价格历史
 * @access 认证（basic及以上会员可访问更多历史数据）
 */
router.get('/:symbol/price-history', tokenController.getTokenPriceHistory);

/**
 * @route GET /api/tokens/:symbol/whale-activity
 * @desc 获取代币大户活动
 * @access 认证（basic及以上会员）
 */
router.get('/:symbol/whale-activity', authMiddleware(['basic', 'premium']), tokenController.getTokenWhaleActivity);

/**
 * @route GET /api/tokens/:symbol/analysis
 * @desc 获取代币分析
 * @access 认证（premium会员）
 */
router.get('/:symbol/analysis', authMiddleware(['premium']), tokenController.getTokenAnalysis);

/**
 * @route GET /api/tokens/risk/high
 * @desc 获取高风险代币
 * @access 认证
 */
router.get('/risk/high', authMiddleware(), tokenController.getHighRiskTokens);

/**
 * @route GET /api/tokens/opportunity
 * @desc 获取潜在机会代币
 * @access 认证（premium会员）
 */
router.get('/opportunity', authMiddleware(['premium']), tokenController.getOpportunityTokens);

module.exports = router; 