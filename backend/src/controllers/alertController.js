const Alert = require('../models/AlertModel');

/**
 * Get alert list
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.getAlerts = async (req, res) => {
  try {
    const { page = 1, limit = 20, type, severity, token, isActive = 'true' } = req.query;
    
    // Build query conditions
    const query = {
      isActive: isActive === 'true',
      $or: [
        { isBroadcast: true },
        { userId: req.user._id }
      ]
    };
    
    // Add optional filters
    if (type) query.type = type;
    if (severity) query.severity = severity;
    if (token) query.token = token;
    
    // Paginated query
    const alerts = await Alert.find(query)
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    
    // Calculate total count
    const total = await Alert.countDocuments(query);
    
    res.json({
      alerts,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error getting alert list:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get recent alerts
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.getRecentAlerts = async (req, res) => {
  try {
    const { limit = 10, minSeverity = 'low' } = req.query;
    
    // Filter by minimum severity level
    const severityLevels = ['low', 'medium', 'high'];
    const minSeverityIndex = severityLevels.indexOf(minSeverity);
    
    if (minSeverityIndex === -1) {
      return res.status(400).json({ message: 'Invalid severity level' });
    }
    
    const allowedSeverities = severityLevels.slice(minSeverityIndex);
    
    // Build query conditions
    const query = {
      isActive: true,
      severity: { $in: allowedSeverities },
      $or: [
        { isBroadcast: true },
        { userId: req.user._id }
      ]
    };
    
    // Query recent alerts
    const alerts = await Alert.find(query)
      .sort({ timestamp: -1 })
      .limit(Number(limit));
    
    res.json({ alerts });
  } catch (error) {
    console.error('Error getting recent alerts:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get alert details by ID
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.getAlertById = async (req, res) => {
  try {
    const alertId = req.params.id;
    const alert = await Alert.findById(alertId);
    
    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }
    
    // Check user permissions
    if (!alert.isBroadcast && !alert.userId.equals(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Use the markAsRead method to increment view count
    await alert.markAsRead();
    
    res.json({ alert });
  } catch (error) {
    console.error('Error getting alert details:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Create custom alert
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.createAlert = async (req, res) => {
  try {
    const { type, token, title, message, severity = 'medium', data = {} } = req.body;
    
    // Check required fields
    if (!type || !token || !title || !message) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Check if user has permission to create custom alerts
    const maxCustomAlerts = req.user.permissions.maxCustomAlerts;
    
    // Count user's existing custom alerts
    const userAlertsCount = await Alert.countDocuments({
      userId: req.user._id,
      type: 'custom'
    });
    
    if (userAlertsCount >= maxCustomAlerts) {
      return res.status(403).json({
        message: `Custom alert limit reached (${maxCustomAlerts}), please upgrade your membership to create more alerts`,
        maxCustomAlerts,
        currentCount: userAlertsCount
      });
    }
    
    // Create new alert
    const newAlert = new Alert({
      type,
      token,
      title,
      message,
      severity,
      data,
      source: 'user',
      userId: req.user._id,
      isBroadcast: false, // User-created alerts are not broadcast to other users by default
    });
    
    await newAlert.save();
    
    res.status(201).json({
      message: 'Alert created successfully',
      alert: newAlert
    });
  } catch (error) {
    console.error('Error creating alert:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Update alert
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.updateAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, message, severity, isActive, data } = req.body;
    
    const alert = await Alert.findById(id);
    
    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }
    
    // Check user permissions
    if (!alert.userId || !alert.userId.equals(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Update alert fields
    if (title) alert.title = title;
    if (message) alert.message = message;
    if (severity) alert.severity = severity;
    if (isActive !== undefined) alert.isActive = isActive;
    if (data) alert.data = { ...alert.data, ...data };
    
    await alert.save();
    
    res.json({
      message: 'Alert updated successfully',
      alert
    });
  } catch (error) {
    console.error('Error updating alert:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Delete alert
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.deleteAlert = async (req, res) => {
  try {
    const { id } = req.params;
    
    const alert = await Alert.findById(id);
    
    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }
    
    // Check user permissions
    if (!alert.userId || !alert.userId.equals(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    await Alert.findByIdAndDelete(id);
    
    res.json({
      message: 'Alert deleted',
      id
    });
  } catch (error) {
    console.error('Error deleting alert:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Submit alert feedback
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.submitAlertFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { isUseful } = req.body;
    
    if (isUseful === undefined) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    const alert = await Alert.findById(id);
    
    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }
    
    // Update feedback
    if (isUseful) {
      alert.feedback.useful += 1;
    } else {
      alert.feedback.notUseful += 1;
    }
    
    // Increment action count
    alert.actionCount += 1;
    
    await alert.save();
    
    res.json({
      message: 'Feedback submitted successfully',
      feedback: alert.feedback
    });
  } catch (error) {
    console.error('Error submitting alert feedback:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get alerts by token
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.getAlertsByToken = async (req, res) => {
  try {
    const { tokenId } = req.params;
    const { limit = 20 } = req.query;
    
    // Build query conditions
    const query = {
      token: tokenId.toUpperCase(),
      isActive: true,
      $or: [
        { isBroadcast: true },
        { userId: req.user._id }
      ]
    };
    
    // Query token alerts
    const alerts = await Alert.find(query)
      .sort({ timestamp: -1 })
      .limit(Number(limit));
    
    res.json({
      token: tokenId.toUpperCase(),
      count: alerts.length,
      alerts
    });
  } catch (error) {
    console.error('Error getting token alerts:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get alert statistics
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.getAlertStats = async (req, res) => {
  try {
    // Get today's alert count
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const totalToday = await Alert.countDocuments({
      timestamp: { $gte: today }
    });
    
    // Count alerts by type for today
    const alertsByType = await Alert.countTodayAlertsByType();
    
    // Count by severity
    const alertsBySeverity = await Alert.aggregate([
      {
        $match: {
          isActive: true
        }
      },
      {
        $group: {
          _id: '$severity',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Most active tokens (most alerts)
    const mostActiveTokens = await Alert.aggregate([
      {
        $match: {
          isActive: true,
          timestamp: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Past week
        }
      },
      {
        $group: {
          _id: '$token',
          alertCount: { $sum: 1 },
          highSeverityCount: {
            $sum: { $cond: [{ $eq: ['$severity', 'high'] }, 1, 0] }
          }
        }
      },
      {
        $sort: { alertCount: -1 }
      },
      {
        $limit: 5
      }
    ]);
    
    res.json({
      totalToday,
      alertsByType,
      alertsBySeverity,
      mostActiveTokens
    });
  } catch (error) {
    console.error('Error getting alert statistics:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 