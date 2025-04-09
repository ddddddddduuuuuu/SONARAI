const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController');
const { authenticate } = require('../middleware/authMiddleware');

/**
 * @route GET /api/alerts
 * @desc 获取预警列表
 * @access 需要认证
 */
router.get('/', authenticate, alertController.getAlerts);

/**
 * @route GET /api/alerts/recent
 * @desc 获取最近的预警
 * @access 需要认证
 */
router.get('/recent', authenticate, alertController.getRecentAlerts);

/**
 * @route GET /api/alerts/:id
 * @desc 获取特定预警的详情
 * @access 需要认证
 */
router.get('/:id', authenticate, alertController.getAlertById);

/**
 * @route POST /api/alerts/custom
 * @desc 创建自定义预警
 * @access 需要认证
 */
router.post('/custom', authenticate, alertController.createAlert);

/**
 * @route PUT /api/alerts/:id
 * @desc 更新预警
 * @access 需要认证（仅能更新自己创建的预警）
 */
router.put('/:id', authenticate, alertController.updateAlert);

/**
 * @route DELETE /api/alerts/:id
 * @desc 删除预警
 * @access 需要认证（仅能删除自己创建的预警）
 */
router.delete('/:id', authenticate, alertController.deleteAlert);

/**
 * @route POST /api/alerts/:id/feedback
 * @desc 提交预警反馈（有用/无用）
 * @access 需要认证
 */
router.post('/:id/feedback', authenticate, alertController.submitAlertFeedback);

/**
 * @route GET /api/alerts/by-token/:tokenId
 * @desc 获取特定代币的预警
 * @access 需要认证
 */
router.get('/by-token/:tokenId', authenticate, alertController.getAlertsByToken);

/**
 * @route GET /api/alerts/stats/overview
 * @desc 获取预警统计信息
 * @access 需要认证
 */
router.get('/stats/overview', authenticate, alertController.getAlertStats);

module.exports = router; 