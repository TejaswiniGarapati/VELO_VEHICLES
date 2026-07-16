const mongoose = require('mongoose');

const logisticsSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    goodsType: {
      type: String,
      required: true,
      trim: true,
    },

    pickupLocation: {
      type: String,
      required: true,
      trim: true,
    },

    destination: {
      type: String,
      required: true,
      trim: true,
    },

    goodsWeight: {
      type: Number,
      required: true,
      min: 1,
    },

    customerName: {
      type: String,
      required: true,
      trim: true,
    },

    customerPhone: {
      type: String,
      required: true,
      trim: true,
    },

    transportCharge: {
      type: Number,
      required: true,
      min: 1,
    },

    status: {
      type: String,
      enum: [
        'ASSIGNED',
        'PICKED UP',
        'IN TRANSIT',
        'DELIVERED',
      ],
      default: 'ASSIGNED',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  'Logistics',
  logisticsSchema
);