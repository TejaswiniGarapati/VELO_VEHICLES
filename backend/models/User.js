/**
 * User Model
 * Stores user account details and role (user/admin)
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    middleName: { type: String, trim: true, default: '' },
    lastName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    vehicleNumber: { type: String, required: true, trim: true, unique: true },
    vehicleClass: {
      type: String,
      enum: ['2 Wheeler', '3 Wheeler', '4 Wheeler', 'Other Vehicles'],
      required: true,
    },
    vehicleUsage: {
      type: String,
      enum: ['Commercial', 'Non Commercial'],
      required: true,
    },
    transportType: {
      type: String,
      enum: ['Passenger', 'Goods Carrier'],
      required: true,
    },
    logisticsAvailable: { type: Boolean, default: false },
    // Vehicle fields for payment modules
    vehicleType: {
      type: String,
      enum: ['2W', '3W', '4W', 'MEDIUM', 'LARGE', 'HEAVY'],
      required: true,
    },
    vehicleUsageType: {
      type: String,
      enum: ['Transport', 'Goods Carrier'],
      default: 'Transport',
    },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Virtual for full name
userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.middleName || ''} ${this.lastName}`.trim();
});

module.exports = mongoose.model('User', userSchema);
