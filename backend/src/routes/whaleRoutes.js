const express = require('express');
const router = express.Router();
const whaleController = require('../controllers/whaleController');
const { authMiddleware } = require('../utils/authMiddleware');

/**
 * @route GET /api/whales
 * @desc 获取大户钱包列表
 * @access 需要认证（basic及以上会员）
 */
router.get('/', authMiddleware(['basic', 'premium']), whaleController.getWhales);

/**
 * @route GET /api/whales/top
 * @desc 获取前10影响力大户
 * @access 公开
 */
router.get('/top', whaleController.getTopWhales);

/**
 * @route GET /api/whales/:address
 * @desc 获取特定大户钱包详情
 * @access 需要认证（basic及以上会员）
 */
router.get('/:address', authMiddleware(['basic', 'premium']), whaleController.getWhaleByAddress);

/**
 * @route GET /api/whales/:address/transactions
 * @desc 获取特定大户的交易历史
 * @access 需要认证（basic及以上会员）
 */
router.get('/:address/transactions', authMiddleware(['basic', 'premium']), whaleController.getWhaleTransactions);

/**
 * @route GET /api/whales/token/:symbol
 * @desc 获取持有特定代币的大户列表
 * @access 需要认证（basic及以上会员）
 */
router.get('/token/:symbol', authMiddleware(['basic', 'premium']), whaleController.getWhalesByToken);

/**
 * @route GET /api/whales/activity/recent
 * @desc 获取最近活跃的大户列表
 * @access 需要认证（basic及以上会员）
 */
router.get('/activity/recent', authMiddleware(['basic', 'premium']), whaleController.getRecentActiveWhales);

/**
 * @route GET /api/whales/behavior/:type
 * @desc 获取特定行为的大户列表
 * @access 需要认证（premium会员）
 */
router.get('/behavior/:type', authMiddleware(['premium']), whaleController.getWhalesByBehavior);

module.exports = router; 