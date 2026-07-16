/**
 * Payment Model
 * Stores all payment transactions (tollgate, fuel, insurance, tax, challan)
 */

const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
    type: {
      type: String,
      enum: ['tollgate', 'fuel', 'insurance', 'tax', 'challan', 'checkup'],
      required: true,
    },
    amount: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['upi', 'bank', 'card'], required: true },
    status: { type: String, enum: ['pending', 'success', 'failed'], default: 'success' },
    description: { type: String, default: '' },
    transactionId: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
