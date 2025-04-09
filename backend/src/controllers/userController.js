const User = require('../models/UserModel');
const jwt = require('jsonwebtoken');

/**
 * 用户注册
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // 检查用户名和邮箱是否已存在
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });
    
    if (existingUser) {
      return res.status(400).json({
        message: existingUser.email === email 
          ? '该邮箱已被注册' 
          : '该用户名已被使用'
      });
    }
    
    // 创建新用户
    const newUser = new User({
      username,
      email,
      password,
      tier: 'free', // 默认注册为免费用户
    });
    
    await newUser.save();
    
    // 生成JWT令牌
    const token = jwt.sign(
      { userId: newUser._id },
      process.env.JWT_SECRET || 'sonar_jwt_secret',
      { expiresIn: '7d' }
    );
    
    // 返回用户信息（不包含密码）
    const userResponse = {
      id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      tier: newUser.tier,
      walletAddress: newUser.walletAddress,
      avatarUrl: newUser.avatarUrl,
      sonarBalance: newUser.sonarBalance,
      createdAt: newUser.createdAt
    };
    
    res.status(201).json({
      message: '注册成功',
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

/**
 * 用户登录
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // 查找用户
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(400).json({ message: '邮箱或密码不正确' });
    }
    
    // 检查用户状态
    if (!user.isActive) {
      return res.status(403).json({ message: '该账户已被禁用' });
    }
    
    // 验证密码
    const isPasswordValid = user.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(400).json({ message: '邮箱或密码不正确' });
    }
    
    // 生成JWT令牌
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'sonar_jwt_secret',
      { expiresIn: '7d' }
    );
    
    // 更新最后登录时间
    user.lastLogin = new Date();
    await user.save();
    
    // 返回用户信息（不包含密码）
    const userResponse = {
      id: user._id,
      username: user.username,
      email: user.email,
      tier: user.tier,
      walletAddress: user.walletAddress,
      avatarUrl: user.avatarUrl,
      sonarBalance: user.sonarBalance,
    };
    
    res.json({
      message: '登录成功',
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

/**
 * 获取用户个人资料
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.getUserProfile = async (req, res) => {
  try {
    const user = req.user;
    
    // 返回用户信息（不包含密码）
    const userResponse = {
      id: user._id,
      username: user.username,
      email: user.email,
      tier: user.tier,
      walletAddress: user.walletAddress,
      avatarUrl: user.avatarUrl,
      sonarBalance: user.sonarBalance,
      watchlist: user.watchlist,
      alertPreferences: user.alertPreferences,
      permissions: user.permissions, // 虚拟字段，获取当前会员等级的权限
      lastLogin: user.lastLogin,
      createdAt: user.createdAt
    };
    
    res.json({ user: userResponse });
  } catch (error) {
    console.error('获取用户资料错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

/**
 * 更新用户个人资料
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.updateUserProfile = async (req, res) => {
  try {
    const { username, avatarUrl } = req.body;
    const user = req.user;
    
    // 检查用户名是否已被其他用户使用
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      
      if (existingUser) {
        return res.status(400).json({ message: '该用户名已被使用' });
      }
      
      user.username = username;
    }
    
    // 更新头像
    if (avatarUrl) {
      user.avatarUrl = avatarUrl;
    }
    
    await user.save();
    
    res.json({
      message: '个人资料更新成功',
      user: {
        id: user._id,
        username: user.username,
        avatarUrl: user.avatarUrl
      }
    });
  } catch (error) {
    console.error('更新用户资料错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

/**
 * 连接钱包
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.connectWallet = async (req, res) => {
  try {
    const { walletAddress, signature } = req.body;
    
    if (!walletAddress) {
      return res.status(400).json({ message: '钱包地址不能为空' });
    }
    
    // 在实际项目中，这里应该验证签名
    // 对于MVP，我们简化这一步骤，直接绑定钱包地址
    
    // 检查钱包地址是否已被其他用户使用
    const existingUser = await User.findOne({ walletAddress });
    
    if (existingUser && !existingUser._id.equals(req.user._id)) {
      return res.status(400).json({ message: '该钱包地址已被其他账户绑定' });
    }
    
    // 更新用户的钱包地址
    req.user.walletAddress = walletAddress;
    await req.user.save();
    
    res.json({
      message: '钱包连接成功',
      walletAddress
    });
  } catch (error) {
    console.error('连接钱包错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

/**
 * 获取用户的关注列表
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.getWatchlist = async (req, res) => {
  try {
    // 用户的关注列表已通过中间件加载到req.user中
    const watchlist = req.user.watchlist || [];
    
    res.json({ watchlist });
  } catch (error) {
    console.error('获取关注列表错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

/**
 * 添加代币到关注列表
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.addToWatchlist = async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ message: '代币标识不能为空' });
    }
    
    const user = req.user;
    
    // 检查代币是否已在关注列表中
    const existingToken = user.watchlist.find(item => item.token === token);
    
    if (existingToken) {
      return res.status(400).json({ message: '该代币已在关注列表中' });
    }
    
    // 检查关注列表是否已达到用户等级的上限
    const maxWatchlistTokens = user.permissions.maxWatchlistTokens;
    
    if (user.watchlist.length >= maxWatchlistTokens) {
      return res.status(403).json({
        message: `关注列表已达到上限(${maxWatchlistTokens})，请升级会员以添加更多代币`,
        maxWatchlistTokens,
        currentCount: user.watchlist.length
      });
    }
    
    // 添加代币到关注列表
    user.watchlist.push({
      token,
      addedAt: new Date(),
      alertSettings: {
        priceChange: { enabled: true, threshold: 5 },
        whaleMovement: { enabled: false, threshold: 1000000 },
        fundFlow: { enabled: false },
      }
    });
    
    await user.save();
    
    res.json({
      message: '添加成功',
      token,
      watchlistCount: user.watchlist.length,
      maxWatchlistTokens
    });
  } catch (error) {
    console.error('添加到关注列表错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

/**
 * 从关注列表中移除代币
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.removeFromWatchlist = async (req, res) => {
  try {
    const { token } = req.params;
    const user = req.user;
    
    // 检查代币是否在关注列表中
    const tokenIndex = user.watchlist.findIndex(item => item.token === token);
    
    if (tokenIndex === -1) {
      return res.status(400).json({ message: '该代币不在关注列表中' });
    }
    
    // 移除代币
    user.watchlist.splice(tokenIndex, 1);
    await user.save();
    
    res.json({
      message: '已从关注列表中移除',
      token,
      watchlistCount: user.watchlist.length
    });
  } catch (error) {
    console.error('从关注列表移除错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

/**
 * 更新关注代币的预警设置
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.updateWatchlistAlerts = async (req, res) => {
  try {
    const { token } = req.params;
    const { alertSettings } = req.body;
    const user = req.user;
    
    // 检查代币是否在关注列表中
    const tokenItem = user.watchlist.find(item => item.token === token);
    
    if (!tokenItem) {
      return res.status(400).json({ message: '该代币不在关注列表中' });
    }
    
    // 更新预警设置
    if (alertSettings.priceChange) {
      tokenItem.alertSettings.priceChange = {
        ...tokenItem.alertSettings.priceChange,
        ...alertSettings.priceChange
      };
    }
    
    if (alertSettings.whaleMovement) {
      tokenItem.alertSettings.whaleMovement = {
        ...tokenItem.alertSettings.whaleMovement,
        ...alertSettings.whaleMovement
      };
    }
    
    if (alertSettings.fundFlow) {
      tokenItem.alertSettings.fundFlow = {
        ...tokenItem.alertSettings.fundFlow,
        ...alertSettings.fundFlow
      };
    }
    
    await user.save();
    
    res.json({
      message: '预警设置已更新',
      token,
      alertSettings: tokenItem.alertSettings
    });
  } catch (error) {
    console.error('更新关注代币预警设置错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

/**
 * 更新用户的预警偏好设置
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.updateAlertPreferences = async (req, res) => {
  try {
    const { alertPreferences } = req.body;
    const user = req.user;
    
    // 更新预警偏好设置
    if (alertPreferences.email) {
      user.alertPreferences.email = {
        ...user.alertPreferences.email,
        ...alertPreferences.email
      };
    }
    
    if (alertPreferences.push) {
      user.alertPreferences.push = {
        ...user.alertPreferences.push,
        ...alertPreferences.push
      };
    }
    
    if (alertPreferences.minSeverity) {
      user.alertPreferences.minSeverity = alertPreferences.minSeverity;
    }
    
    await user.save();
    
    res.json({
      message: '预警偏好设置已更新',
      alertPreferences: user.alertPreferences
    });
  } catch (error) {
    console.error('更新预警偏好设置错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

/**
 * 升级用户会员等级
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.upgradeTier = async (req, res) => {
  try {
    const { tier, paymentMethod, paymentId } = req.body;
    const user = req.user;
    
    // 验证会员等级
    if (!['basic', 'premium'].includes(tier)) {
      return res.status(400).json({ message: '无效的会员等级' });
    }
    
    // 如果当前已经是请求的等级或更高，则不需要升级
    if ((tier === 'basic' && ['basic', 'premium'].includes(user.tier)) ||
        (tier === 'premium' && user.tier === 'premium')) {
      return res.status(400).json({ message: '您已经是该会员等级或更高等级' });
    }
    
    // 在实际项目中，这里应该处理支付逻辑
    // 对于MVP，我们模拟支付成功
    
    // 更新用户会员等级
    user.tier = tier;
    await user.save();
    
    res.json({
      message: '会员升级成功',
      tier,
      permissions: user.permissions // 虚拟字段，获取新会员等级的权限
    });
  } catch (error) {
    console.error('升级会员错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
}; 