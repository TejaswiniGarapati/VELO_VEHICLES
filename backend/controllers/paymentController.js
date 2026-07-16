/**
 * Payment Controller
 * Handles FASTag, fuel, insurance, tax, challan payments
 * Creates notifications on success
 */

const Payment = require('../models/Payment');
const Vehicle = require('../models/Vehicle');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Helper: create notification after payment
const createPaymentNotification = async (userId, type, amount, paymentMethod) => {
  const titles = {
    tollgate: 'FASTag Recharge Successful',
    fuel: 'Fuel Payment Successful',
    insurance: 'Insurance Renewal Successful',
    tax: 'Tax Payment Successful',
    challan: 'E-Challan Payment Successful',
  };
  await Notification.create({
    userId,
    type: 'payment',
    title: titles[type] || 'Payment Successful',
    message: `Amount ₹${amount} paid via ${paymentMethod}.`,
    paymentType: type,
    amount,
  });
};

// @route   GET /api/payments/overview
// @desc    Get payment overview (balances, dates) for current user's vehicle
exports.getOverview = async (req, res) => {
  try {
    const vehicle = await Vehicle.findOne({ userId: req.user.id });
    if (!vehicle) {
      return res.json({
        tollgate: { balance: 0, lastRecharge: 0 },
        fuel: { balance: 0, lastAmount: 0 },
        insurance: { policyEnd: null, renewalAmount: 0, lastRenewal: null },
        checkup: { lastDate: null, nextDate: null },
        tax: { amount: 0, dueDate: null, paid: false },
        challans: [],
      });
    }
    const tollgatePayments = await Payment.find({
      userId: req.user.id,
      type: 'tollgate',
      status: 'success',
    })
      .sort({ createdAt: -1 })
      .limit(5);
    const challans = await Payment.find({
      userId: req.user.id,
      type: 'challan',
      status: 'success',
    })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      vehicle,
      tollgate: {
        balance: vehicle.fastagBalance,
        lastRecharge: vehicle.lastFastagRecharge,
        lastRechargeDate: vehicle.lastFastagRechargeDate,
      },
      fuel: {
        balance: vehicle.fuelWalletBalance,
        lastAmount: vehicle.lastFuelAmount,
        lastDate: vehicle.lastFuelDate,
      },
      insurance: {
        policyEnd: vehicle.insurancePolicyEndDate,
        renewalAmount: vehicle.insuranceRenewalAmount,
        lastRenewal: vehicle.lastInsuranceRenewalDate,
      },
      checkup: {
        lastDate: vehicle.lastCheckupDate,
        nextDate: vehicle.nextCheckupDate,
      },
      tax: {
        amount: vehicle.taxAmount,
        dueDate: vehicle.taxDueDate,
        paid: vehicle.taxPaid,
      },
      recentTollgate: tollgatePayments,
      challans,
    });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

// @route   POST /api/payments/tollgate
// @desc    Recharge FASTag for selected vehicle
exports.tollgatePayment = async (req, res) => {
  try {
    const { amount, paymentMethod, vehicleId } = req.body;
    if (!amount || amount <= 0 || !paymentMethod) {
      return res.status(400).json({ message: 'Amount and payment method required' });
    }

    // Find vehicle - use vehicleId if provided, otherwise find first vehicle for user
    let vehicle;
    if (vehicleId) {
      vehicle = await Vehicle.findOne({ _id: vehicleId, userId: req.user.id });
      if (!vehicle) {
        return res.status(404).json({ message: 'Vehicle not found' });
      }
    } else {
      vehicle = await Vehicle.findOne({ userId: req.user.id });
      if (!vehicle) {
        return res.status(400).json({ message: 'Please select a vehicle first' });
      }
    }

    if (vehicle.vehicleType === '2W' || vehicle.vehicleType === '3W') {
      return res.status(400).json({ message: 'FASTag payment is not applicable for 2-Wheeler and 3-Wheeler' });
    }

    const payment = await Payment.create({
      userId: req.user.id,
      vehicleId: vehicle._id,
      type: 'tollgate',
      amount: Number(amount),
      paymentMethod,
      status: 'success',
      description: 'FASTag recharge',
      transactionId: 'TXN-' + Date.now(),
    });

    vehicle.fastagBalance = (vehicle.fastagBalance || 0) + Number(amount);
    vehicle.lastFastagRecharge = Number(amount);
    vehicle.lastFastagRechargeDate = new Date();
    await vehicle.save();

    await createPaymentNotification(req.user.id, 'tollgate', amount, paymentMethod);
    res.status(201).json({ message: 'FASTag recharged successfully', payment, balance: vehicle.fastagBalance });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

// @route   POST /api/payments/fuel
// @desc    Fuel payment for selected vehicle
exports.fuelPayment = async (req, res) => {
  try {
    const { amount, paymentMethod, vehicleId } = req.body;
    if (!amount || amount <= 0 || !paymentMethod) {
      return res.status(400).json({ message: 'Amount and payment method required' });
    }

    // Find vehicle - use vehicleId if provided, otherwise find first vehicle for user
    let vehicle;
    if (vehicleId) {
      vehicle = await Vehicle.findOne({ _id: vehicleId, userId: req.user.id });
      if (!vehicle) {
        return res.status(404).json({ message: 'Vehicle not found' });
      }
    } else {
      vehicle = await Vehicle.findOne({ userId: req.user.id });
      if (!vehicle) {
        return res.status(400).json({ message: 'Please select a vehicle first' });
      }
    }

    if (vehicle.vehicleType === '2W' || vehicle.vehicleType === '3W') {
      return res.status(400).json({ message: 'Fuel payment is not applicable for 2-Wheeler and 3-Wheeler' });
    }

    const payment = await Payment.create({
      userId: req.user.id,
      vehicleId: vehicle._id,
      type: 'fuel',
      amount: Number(amount),
      paymentMethod,
      status: 'success',
      description: 'Fuel payment',
      transactionId: 'TXN-' + Date.now(),
    });

    vehicle.lastFuelAmount = Number(amount);
    vehicle.lastFuelDate = new Date();
    // Optional: treat as wallet top-up
    vehicle.fuelWalletBalance = (vehicle.fuelWalletBalance || 0) + Number(amount);
    await vehicle.save();

    await createPaymentNotification(req.user.id, 'fuel', amount, paymentMethod);
    res.status(201).json({ message: 'Fuel payment successful', payment });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

// @route   POST /api/payments/insurance
exports.insurancePayment = async (req, res) => {
  try {
    const { amount, paymentMethod } = req.body;
    if (!amount || amount <= 0 || !paymentMethod) {
      return res.status(400).json({ message: 'Amount and payment method required' });
    }

    let vehicle = await Vehicle.findOne({ userId: req.user.id });
    if (!vehicle) {
      const user = await User.findById(req.user.id).select('vehicleNumber vehicleType');
      const vehicleNumber = (user?.vehicleNumber || `PROFILE-${Date.now()}`).toString().toUpperCase();
      const vehicleType = user?.vehicleType && ['2W', '3W', '4W', 'MEDIUM', 'LARGE', 'HEAVY'].includes(user.vehicleType)
        ? user.vehicleType
        : '4W';
      vehicle = await Vehicle.create({
        userId: req.user.id,
        vehicleNumber,
        vehicleType,
      });
    }

    const payment = await Payment.create({
      userId: req.user.id,
      vehicleId: vehicle._id,
      type: 'insurance',
      amount: Number(amount),
      paymentMethod,
      status: 'success',
      description: 'Insurance renewal',
      transactionId: 'TXN-' + Date.now(),
    });

    const now = new Date();
    vehicle.lastInsuranceRenewalDate = now;
    vehicle.insurancePolicyEndDate = new Date(now.setFullYear(now.getFullYear() + 1));
    vehicle.insuranceRenewalAmount = Number(amount);
    await vehicle.save();

    await createPaymentNotification(req.user.id, 'insurance', amount, paymentMethod);
    res.status(201).json({
      message: 'Insurance renewed successfully',
      payment,
      policyEnd: vehicle.insurancePolicyEndDate,
    });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

// @route   POST /api/payments/tax
exports.taxPayment = async (req, res) => {
  try {
    const { amount, paymentMethod } = req.body;
    if (!amount || amount <= 0 || !paymentMethod) {
      return res.status(400).json({ message: 'Amount and payment method required' });
    }

    let vehicle = await Vehicle.findOne({ userId: req.user.id });
    if (!vehicle) {
      const user = await User.findById(req.user.id).select('vehicleNumber vehicleType');
      const vehicleNumber = (user?.vehicleNumber || `PROFILE-${Date.now()}`).toString().toUpperCase();
      const vehicleType = user?.vehicleType && ['2W', '3W', '4W', 'MEDIUM', 'LARGE', 'HEAVY'].includes(user.vehicleType)
        ? user.vehicleType
        : '4W';
      vehicle = await Vehicle.create({
        userId: req.user.id,
        vehicleNumber,
        vehicleType,
      });
    }

    const payment = await Payment.create({
      userId: req.user.id,
      vehicleId: vehicle._id,
      type: 'tax',
      amount: Number(amount),
      paymentMethod,
      status: 'success',
      description: 'Vehicle tax payment',
      transactionId: 'TXN-' + Date.now(),
    });

    vehicle.taxPaid = true;
    vehicle.taxAmount = Number(amount);
    await vehicle.save();

    await createPaymentNotification(req.user.id, 'tax', amount, paymentMethod);
    res.status(201).json({ message: 'Tax paid successfully', payment });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

// @route   POST /api/payments/challan
exports.challanPayment = async (req, res) => {
  try {
    const { amount, paymentMethod, description } = req.body;
    if (!amount || amount <= 0 || !paymentMethod) {
      return res.status(400).json({ message: 'Amount and payment method required' });
    }

    let vehicle = await Vehicle.findOne({ userId: req.user.id });

    const payment = await Payment.create({
      userId: req.user.id,
      vehicleId: vehicle ? vehicle._id : null,
      type: 'challan',
      amount: Number(amount),
      paymentMethod,
      status: 'success',
      description: description || 'E-Challan payment',
      transactionId: 'TXN-' + Date.now(),
    });

    await createPaymentNotification(req.user.id, 'challan', amount, paymentMethod);
    res.status(201).json({ message: 'Challan paid successfully', payment });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

// @route   POST /api/payments/checkup
// @desc    Environment checkup slot booking payment
exports.checkupPayment = async (req, res) => {
  try {
    const { amount, paymentMethod, slotDate, vehicleType } = req.body;
    if (!amount || amount <= 0 || !paymentMethod) {
      return res.status(400).json({ message: 'Amount and payment method required' });
    }

    let vehicle = await Vehicle.findOne({ userId: req.user.id });
    if (!vehicle) {
      return res.status(400).json({ message: 'Please add a vehicle first' });
    }

    const payment = await Payment.create({
      userId: req.user.id,
      vehicleId: vehicle._id,
      type: 'checkup',
      amount: Number(amount),
      paymentMethod,
      status: 'success',
      description: 'Environment checkup slot',
      transactionId: 'TXN-' + Date.now(),
    });

    const slotD = slotDate ? new Date(slotDate) : new Date();
    vehicle.nextCheckupDate = slotD;
    vehicle.lastCheckupDate = new Date();
    await vehicle.save();

    await Notification.create({
      userId: req.user.id,
      type: 'slot',
      title: 'Slot Booked',
      message: `Environment checkup slot booked for ${slotD.toLocaleDateString()}. Amount ₹${amount} paid.`,
      amount: Number(amount),
    });

    res.status(201).json({ message: 'Slot booked successfully', payment });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

// @route   GET /api/payments/history
exports.getHistory = async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error' });
  }
};
