/**
 * Admin Controller
 * View users, payments, notifications, app activity
 */

const User = require('../models/User');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');

// @route   GET /api/admin/users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

// @route   GET /api/admin/payments
exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('userId', 'firstName lastName email phone')
      .sort({ createdAt: -1 })
      .limit(200);
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

// @route   GET /api/admin/notifications
exports.getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find()
      .populate('userId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

// @route   GET /api/admin/activity
exports.getActivity = async (req, res) => {
  try {
    const [userCount, paymentCount, recentPayments] = await Promise.all([
      User.countDocuments(),
      Payment.countDocuments(),
      Payment.find().populate('userId', 'firstName lastName').sort({ createdAt: -1 }).limit(20),
    ]);
    res.json({
      totalUsers: userCount,
      totalPayments: paymentCount,
      recentPayments,
    });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error' });
  }
};
