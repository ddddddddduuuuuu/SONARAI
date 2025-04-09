/**
 * Alert Service
 * Provides functionality for alert generation and notification delivery
 */

const nodemailer = require('nodemailer');
const axios = require('axios');
const Alert = require('../models/AlertModel');
const User = require('../models/UserModel');
require('dotenv').config();

// Configure email sending
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Configure Telegram bot
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

/**
 * Create a new alert
 * @param {Object} alertData Alert data
 * @returns {Promise<Object>} Newly created alert
 */
const createAlert = async (alertData) => {
  try {
    const newAlert = new Alert({
      ...alertData,
      createdAt: new Date(),
      isActive: true,
      viewCount: 0,
      actionCount: 0,
      positiveFeedbackCount: 0,
      negativeFeedbackCount: 0
    });
    
    await newAlert.save();
    return newAlert;
  } catch (error) {
    console.error('Failed to create alert:', error);
    throw new Error('Failed to create alert');
  }
};

/**
 * Generate a whale activity alert
 * @param {string} walletAddress Wallet address
 * @param {string} tokenSymbol Token symbol
 * @param {number} amount Transaction amount
 * @param {string} actionType Activity type (buy, sell, transfer)
 * @returns {Promise<Object>} Generated alert
 */
const generateWhaleAlert = async (walletAddress, tokenSymbol, amount, actionType) => {
  try {
    // Determine alert severity
    let severity = 'medium';
    if (amount > 1000000) severity = 'high';
    else if (amount < 100000) severity = 'low';
    
    // Create alert content
    const title = `Large ${actionType === 'buy' ? 'Purchase' : actionType === 'sell' ? 'Sale' : 'Transfer'}: ${tokenSymbol}`;
    const description = `Whale address ${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)} 
                        ${actionType === 'buy' ? 'bought' : actionType === 'sell' ? 'sold' : 'transferred'} 
                        ${amount.toLocaleString()} ${tokenSymbol}`;
    
    // Create and return the alert
    return await createAlert({
      title,
      description,
      type: 'whale',
      severity,
      relatedToken: tokenSymbol,
      relatedAddress: walletAddress,
      data: { amount, actionType }
    });
  } catch (error) {
    console.error('Failed to generate whale alert:', error);
    throw new Error('Failed to generate whale alert');
  }
};

/**
 * Send email notification
 * @param {string} userEmail User's email
 * @param {Object} alert Alert object
 * @returns {Promise<boolean>} Whether the send was successful
 */
const sendEmailNotification = async (userEmail, alert) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: `SONAR Alert: ${alert.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <h2 style="color: #333;">${alert.title}</h2>
          <p style="color: #666; line-height: 1.5;">${alert.description}</p>
          <p style="margin-top: 20px; color: #888;">
            <strong>Type:</strong> ${alert.type}<br>
            <strong>Severity:</strong> ${alert.severity}<br>
            <strong>Related Token:</strong> ${alert.relatedToken || 'N/A'}<br>
            <strong>Time:</strong> ${new Date(alert.createdAt).toLocaleString()}
          </p>
          <div style="margin-top: 30px; text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/alerts/${alert._id}" 
               style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
              View Details
            </a>
          </div>
        </div>
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    return info.messageId ? true : false;
  } catch (error) {
    console.error('Failed to send email notification:', error);
    return false;
  }
};

/**
 * Send Telegram notification
 * @param {string} chatId Telegram chat ID
 * @param {Object} alert Alert object
 * @returns {Promise<boolean>} Whether the send was successful
 */
const sendTelegramNotification = async (chatId, alert) => {
  try {
    const message = `🚨 *SONAR Alert: ${alert.title}* 🚨\n\n${alert.description}\n\n` +
                   `*Type:* ${alert.type}\n` +
                   `*Severity:* ${alert.severity}\n` +
                   `*Related Token:* ${alert.relatedToken || 'N/A'}\n` +
                   `*Time:* ${new Date(alert.createdAt).toLocaleString()}`;
    
    const response = await axios.post(`${TELEGRAM_API_URL}/sendMessage`, {
      chat_id: chatId,
      text: message,
      parse_mode: 'Markdown'
    });
    
    return response.data.ok;
  } catch (error) {
    console.error('Failed to send Telegram notification:', error);
    return false;
  }
};

/**
 * Broadcast an alert to all eligible users
 * @param {Object} alert Alert object
 * @param {Object} options Sending options
 * @returns {Promise<Object>} Send result statistics
 */
const broadcastAlert = async (alert, options = { email: true, telegram: true }) => {
  try {
    // Get users who should receive this alert
    // Filter based on alert type, severity, and user preferences
    const usersToNotify = await User.find({
      'alertPreferences.enabled': true,
      'alertPreferences.minSeverity': { $in: ['all', alert.severity] },
      'alertPreferences.types': { $in: ['all', alert.type] }
    });
    
    // Send result statistics
    const stats = {
      total: usersToNotify.length,
      emailSent: 0,
      emailFailed: 0,
      telegramSent: 0,
      telegramFailed: 0
    };
    
    // Send notification to each user
    for (const user of usersToNotify) {
      // Send email notification
      if (options.email && user.email && user.alertPreferences.channels.includes('email')) {
        const emailResult = await sendEmailNotification(user.email, alert);
        if (emailResult) stats.emailSent++;
        else stats.emailFailed++;
      }
      
      // Send Telegram notification
      if (options.telegram && user.telegramChatId && user.alertPreferences.channels.includes('telegram')) {
        const telegramResult = await sendTelegramNotification(user.telegramChatId, alert);
        if (telegramResult) stats.telegramSent++;
        else stats.telegramFailed++;
      }
    }
    
    return stats;
  } catch (error) {
    console.error('Failed to broadcast alert:', error);
    throw new Error('Failed to broadcast alert');
  }
};

module.exports = {
  createAlert,
  generateWhaleAlert,
  sendEmailNotification,
  sendTelegramNotification,
  broadcastAlert
}; 