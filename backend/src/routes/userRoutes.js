const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authMiddleware } = require('../utils/authMiddleware');

/**
 * @route POST /api/users/register
 * @desc 用户注册
 * @access 公开
 */
router.post('/register', userController.register);

/**
 * @route POST /api/users/login
 * @desc 用户登录
 * @access 公开
 */
router.post('/login', userController.login);

/**
 * @route GET /api/users/profile
 * @desc 获取当前用户的个人资料
 * @access 需要认证
 */
router.get('/profile', authMiddleware(), userController.getUserProfile);

/**
 * @route PUT /api/users/profile
 * @desc 更新用户个人资料
 * @access 需要认证
 */
router.put('/profile', authMiddleware(), userController.updateUserProfile);

/**
 * @route POST /api/users/connect-wallet
 * @desc 连接钱包
 * @access 需要认证
 */
router.post('/connect-wallet', authMiddleware(), userController.connectWallet);

/**
 * @route GET /api/users/watchlist
 * @desc 获取用户的关注列表
 * @access 需要认证
 */
router.get('/watchlist', authMiddleware(), userController.getWatchlist);

/**
 * @route POST /api/users/watchlist
 * @desc 添加代币到关注列表
 * @access 需要认证
 */
router.post('/watchlist', authMiddleware(), userController.addToWatchlist);

/**
 * @route DELETE /api/users/watchlist/:token
 * @desc 从关注列表中移除代币
 * @access 需要认证
 */
router.delete('/watchlist/:token', authMiddleware(), userController.removeFromWatchlist);

/**
 * @route PUT /api/users/watchlist/:token/alerts
 * @desc 更新关注代币的预警设置
 * @access 需要认证
 */
router.put('/watchlist/:token/alerts', authMiddleware(), userController.updateWatchlistAlerts);

/**
 * @route PUT /api/users/alert-preferences
 * @desc 更新用户的预警偏好设置
 * @access 需要认证
 */
router.put('/alert-preferences', authMiddleware(), userController.updateAlertPreferences);

/**
 * @route POST /api/users/upgrade-tier
 * @desc 升级用户会员等级
 * @access 需要认证
 */
router.post('/upgrade-tier', authMiddleware(), userController.upgradeTier);

module.exports = router; 