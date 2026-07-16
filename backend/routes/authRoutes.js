/**
 * Auth Routes
 * Signup, Login, Get Me
 */

const express = require('express');
const { body, validationResult } = require('express-validator');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Validation helpers
const signupValidation = [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('phone').trim().notEmpty().withMessage('Phone is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) throw new Error('Passwords do not match');
    return true;
  }),
  body('captchaAnswer').notEmpty().withMessage('CAPTCHA verification required'),
  // Vehicle fields for new flow
  body('vehicleNumber')
    .trim()
    .isLength({ min: 10, max: 10 })
    .withMessage('Vehicle number must be exactly 10 characters'),
  body('vehicleClass')
    .isIn(['2 Wheeler', '3 Wheeler', '4 Wheeler', 'Other Vehicles'])
    .withMessage('Vehicle class is invalid'),
  body('vehicleUsage')
    .isIn(['Commercial', 'Non Commercial'])
    .withMessage('Vehicle usage is invalid'),
  body('transportType')
    .isIn(['Passenger', 'Goods Carrier'])
    .withMessage('Transport type is invalid'),
  body('logisticsAvailable')
    .optional()
    .isBoolean()
    .withMessage('Logistics availability must be boolean'),
];

const loginValidation = [
  body('vehicleNumber').notEmpty().withMessage('Vehicle number is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

// POST /api/auth/signup
router.post('/signup', signupValidation, authController.signup);

// POST /api/auth/login
router.post('/login', loginValidation, authController.login);

// GET /api/auth/me (protected)
router.get('/me', authMiddleware.protect, authController.getMe);

module.exports = router;
