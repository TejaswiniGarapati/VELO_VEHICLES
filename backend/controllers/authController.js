/**
 * Auth Controller
 * Handles signup, login, and token generation
 */

const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'velo_secret_key',
    { expiresIn: '7d' }
  );
};

// @route   POST /api/auth/signup
// @desc    Register new user
exports.signup = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const first = errors.array()[0];
      return res.status(400).json({ errors: errors.array(), message: first?.msg || 'Validation failed' });
    }

    const {
      firstName,
      middleName,
      lastName,
      phone,
      email,
      password,
      vehicleNumber,
      vehicleClass,
      vehicleUsage,
      transportType,
      logisticsAvailable,
    } = req.body;

    const existingUser = await User.findOne({
      $or: [{ email }, { phone }, { vehicleNumber: vehicleNumber.trim().toUpperCase() }],
    });
    if (existingUser) {
      return res.status(400).json({
        message:
          existingUser.email === email
            ? 'Email already registered'
            : existingUser.phone === phone
            ? 'Phone already registered'
            : 'Vehicle number already registered',
      });
    }

    const derivedVehicleType = vehicleClass === '2 Wheeler'
      ? '2W'
      : vehicleClass === '3 Wheeler'
      ? '3W'
      : '4W';
    const derivedVehicleUsageType = transportType === 'Goods Carrier' ? 'Goods Carrier' : 'Transport';

    const user = await User.create({
      firstName,
      middleName: middleName || '',
      lastName,
      phone,
      email,
      password,
      vehicleNumber: vehicleNumber.trim().toUpperCase(),
      vehicleClass,
      vehicleUsage,
      transportType,
      logisticsAvailable: transportType === 'Goods Carrier' ? Boolean(logisticsAvailable) : false,
      vehicleType: derivedVehicleType,
      vehicleUsageType: derivedVehicleUsageType,
    });

    // Create backing vehicle record for payment modules
    const usage = derivedVehicleUsageType === 'Goods Carrier' ? 'GOODS_CARRIER' : 'TRANSPORT';
    await Vehicle.create({
      userId: user._id,
      vehicleNumber: user.vehicleNumber,
      vehicleType: user.vehicleType,
      usageType: usage || undefined,
    });

    const token = generateToken(user._id);
    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        middleName: user.middleName,
        lastName: user.lastName,
        fullName: `${user.firstName} ${user.middleName || ''} ${user.lastName}`.trim(),
        email: user.email,
        phone: user.phone,
        vehicleNumber: user.vehicleNumber,
        vehicleClass: user.vehicleClass,
        vehicleUsage: user.vehicleUsage,
        transportType: user.transportType,
        logisticsAvailable: user.logisticsAvailable,
        vehicleType: user.vehicleType,
        vehicleUsageType: user.vehicleUsageType,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

// @route   POST /api/auth/login
// @desc    Login with email OR phone and password
exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const first = errors.array()[0];
      return res.status(400).json({ errors: errors.array(), message: first?.msg || 'Validation failed' });
    }

    const { vehicleNumber, password } = req.body;

    const user = await User.findOne({
      vehicleNumber: vehicleNumber.trim().toUpperCase(),
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid vehicle number or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid vehicle number or password' });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is disabled' });
    }

    const token = generateToken(user._id);
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        middleName: user.middleName,
        lastName: user.lastName,
        fullName: `${user.firstName} ${user.middleName || ''} ${user.lastName}`.trim(),
        email: user.email,
        phone: user.phone,
        vehicleNumber: user.vehicleNumber,
        vehicleClass: user.vehicleClass,
        vehicleUsage: user.vehicleUsage,
        transportType: user.transportType,
        logisticsAvailable: user.logisticsAvailable,
        vehicleType: user.vehicleType,
        vehicleUsageType: user.vehicleUsageType,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

// @route   GET /api/auth/me
// @desc    Get current user (requires token)
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({
      user: {
        id: user._id,
        firstName: user.firstName,
        middleName: user.middleName,
        lastName: user.lastName,
        fullName: `${user.firstName} ${user.middleName || ''} ${user.lastName}`.trim(),
        email: user.email,
        phone: user.phone,
        vehicleNumber: user.vehicleNumber,
        vehicleClass: user.vehicleClass,
        vehicleUsage: user.vehicleUsage,
        transportType: user.transportType,
        logisticsAvailable: user.logisticsAvailable,
        vehicleType: user.vehicleType,
        vehicleUsageType: user.vehicleUsageType,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error' });
  }
};
