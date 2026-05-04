const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { isMockDbEnabled, mockUsers } = require('../config/mockDb');

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const token = authHeader.split(' ')[1];

    if (isMockDbEnabled() && token === 'mock-token') {
      req.user = mockUsers[0];
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'development-secret');
    const userId = decoded.id || decoded._id || decoded.userId;

    if (isMockDbEnabled()) {
      req.user = mockUsers.find((user) => user._id === userId) || mockUsers[0];
      return next();
    }

    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid token user' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  next();
};

module.exports = {
  authMiddleware,
  adminOnly
};
