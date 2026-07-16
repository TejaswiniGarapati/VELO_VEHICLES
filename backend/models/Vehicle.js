/**
 * Vehicle Model
 * Stores vehicle information linked to user
 * Supports multiple vehicles per user
 */

const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    vehicleNumber: { 
      type: String, 
      required: true,
      // Unique per user (compound index ensures uniqueness within user's vehicles)
    },
    vehicleType: { 
      type: String, 
      enum: ['2W', '3W', '4W', 'MEDIUM', 'LARGE', 'HEAVY'],
      required: true,
    },
    // Transport / Goods Carrier - for Logistics visibility
    usageType: { type: String, enum: ['TRANSPORT', 'GOODS_CARRIER'], default: null },
    // FASTag balance per vehicle
    fastagBalance: { type: Number, default: 0 },
    lastFastagRecharge: { type: Number, default: 0 },
    lastFastagRechargeDate: { type: Date },
    // Fuel wallet balance per vehicle
    fuelWalletBalance: { type: Number, default: 0 },
    lastFuelAmount: { type: Number, default: 0 },
    lastFuelDate: { type: Date },
    // Insurance
    insurancePolicyEndDate: { type: Date },
    insuranceRenewalAmount: { type: Number, default: 0 },
    lastInsuranceRenewalDate: { type: Date },
    // Environmental checkup
    lastCheckupDate: { type: Date },
    nextCheckupDate: { type: Date },
    // Tax
    taxDueDate: { type: Date },
    taxAmount: { type: Number, default: 0 },
    taxPaid: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Compound index: vehicleNumber must be unique per user
vehicleSchema.index({ userId: 1, vehicleNumber: 1 }, { unique: true });

module.exports = mongoose.model('Vehicle', vehicleSchema);
