/**
 * Authentication Middleware
 * Verifies JWT and attaches user to request
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - user must be logged in
exports.protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return res.status(401).json({ message: 'Not authorized. Please login.' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'velo_secret_key');
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) return res.status(401).json({ message: 'User not found' });
    if (!req.user.isActive) return res.status(401).json({ message: 'Account is disabled' });
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Admin only
exports.adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin only.' });
  }
};
