const jwt = require('jsonwebtoken');
const User = require('../models/UserModel');

/**
 * Authentication middleware
 * @param {Array} allowedTiers - Array of allowed user tiers, e.g. ['basic', 'premium'], defaults to all authenticated users
 * @returns {Function} - Express middleware function
 */
const authMiddleware = (allowedTiers = []) => {
  return async (req, res, next) => {
    try {
      // Get token from header
      const token = req.header('Authorization')?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'sonar_jwt_secret');
      
      // Find user
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }
      
      // Check if user is active
      if (!user.isActive) {
        return res.status(403).json({ message: 'Account is disabled' });
      }
      
      // Check if user has required tier if specified
      if (allowedTiers.length > 0 && !allowedTiers.includes(user.tier)) {
        return res.status(403).json({ 
          message: 'Membership upgrade required to access this feature',
          requiredTier: allowedTiers[0]
        });
      }
      
      // Add user info to request object
      req.user = user;
      req.token = token;
      
      // Update last login time
      user.lastLogin = new Date();
      await user.save();
      
      next();
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Invalid token' });
      }
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired, please log in again' });
      }
      
      console.error('Authentication middleware error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };
};

/**
 * Admin authorization middleware
 * @returns {Function} - Express middleware function
 */
const adminMiddleware = () => {
  return async (req, res, next) => {
    try {
      // Ensure user is authenticated
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      // Check if user is an admin
      if (req.user.userRole !== 'admin') {
        return res.status(403).json({ message: 'Admin privileges required' });
      }
      
      next();
    } catch (error) {
      console.error('Admin middleware error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };
};

module.exports = {
  authMiddleware,
  adminMiddleware
}; 