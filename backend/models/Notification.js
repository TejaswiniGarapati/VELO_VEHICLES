/**
 * Notification Model
 * Stores notifications (payment success, checkup reminders, etc.)
 */

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, required: true }, // e.g. 'payment', 'reminder', 'challan'
    title: { type: String, required: true },
    message: { type: String, required: true },
    paymentType: { type: String, default: '' }, // tollgate, fuel, etc.
    amount: { type: Number, default: 0 },
    read: { type: Boolean, default: false },
    // For admin: system-wide notifications can use null userId
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
