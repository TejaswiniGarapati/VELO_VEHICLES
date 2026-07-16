/**
 * Notification Controller
 * Get/mark notifications for logged-in user
 */

const Notification = require('../models/Notification');

// @route   GET /api/notifications
// @desc    Get all notifications for current user
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);
    const unreadCount = await Notification.countDocuments({
      userId: req.user.id,
      read: false,
    });
    res.json({ notifications, unreadCount });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

// @route   PATCH /api/notifications/:id/read
// @desc    Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const notif = await Notification.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!notif) return res.status(404).json({ message: 'Notification not found' });
    notif.read = true;
    await notif.save();
    res.json(notif);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

// @route   PATCH /api/notifications/read-all
// @desc    Mark all as read
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user.id }, { read: true });
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error' });
  }
};
