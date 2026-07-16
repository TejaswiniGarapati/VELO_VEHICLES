/**
 * User Controller
 * Handles user profile and vehicle data for dashboard/payment modules
 */

const User = require('../models/User');
const Vehicle = require('../models/Vehicle');

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

// Get vehicles for current user
exports.getVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

// Add new vehicle for current user
exports.addVehicle = async (req, res) => {
  try {
    const { vehicleNumber, vehicleType } = req.body;
    
    // Validate input
    if (!vehicleNumber || !vehicleType) {
      return res.status(400).json({ message: 'Vehicle number and vehicle type are required' });
    }
    
    if (!['2W', '3W', '4W', 'MEDIUM', 'LARGE', 'HEAVY'].includes(vehicleType)) {
      return res.status(400).json({ message: 'Invalid vehicle type' });
    }
    
    // Check if vehicle number already exists for this user
    const existing = await Vehicle.findOne({ 
      userId: req.user.id, 
      vehicleNumber: vehicleNumber.trim().toUpperCase() 
    });
    
    if (existing) {
      return res.status(400).json({ message: 'Vehicle number already exists for your account' });
    }
    
    // Create new vehicle (usageType optional, from body)
    const vehicle = await Vehicle.create({
      userId: req.user.id,
      vehicleNumber: vehicleNumber.trim().toUpperCase(),
      vehicleType,
      ...(req.body.usageType && ['TRANSPORT', 'GOODS_CARRIER'].includes(req.body.usageType) && { usageType: req.body.usageType }),
    });
    
    res.status(201).json({ message: 'Vehicle added successfully', vehicle });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Vehicle number already exists for your account' });
    }
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

// Get or create default vehicle (legacy - used by some payment modules)
// Note: This is kept for backward compatibility but users should use vehicle selection
exports.getOrCreateDefaultVehicle = async (req, res) => {
  try {
    let vehicle = await Vehicle.findOne({ userId: req.user.id });
    if (!vehicle) {
      // Create a default vehicle with minimal required fields
      vehicle = await Vehicle.create({
        userId: req.user.id,
        vehicleNumber: 'DEFAULT-' + Date.now(),
        vehicleType: '4W', // Default to 4W
      });
    }
    res.json(vehicle);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

// Update vehicle (e.g. registration, FASTag balance after recharge)
exports.updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findOne({ userId: req.user.id });
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });

    const allowed = [
      'registrationNumber', 'vehicleType', 'make', 'model',
      'fastagBalance', 'lastFastagRecharge', 'lastFastagRechargeDate',
      'fuelWalletBalance', 'lastFuelAmount', 'lastFuelDate',
      'insurancePolicyEndDate', 'insuranceRenewalAmount', 'lastInsuranceRenewalDate',
      'lastCheckupDate', 'nextCheckupDate', 'taxDueDate', 'taxAmount', 'taxPaid',
    ];
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) vehicle[key] = req.body[key];
    });
    await vehicle.save();
    res.json(vehicle);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error' });
  }
};
