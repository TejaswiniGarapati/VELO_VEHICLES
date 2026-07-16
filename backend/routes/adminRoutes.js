/**
 * Admin Routes
 * Users, payments, notifications, activity
 */

const express = require('express');
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware.protect);
router.use(authMiddleware.adminOnly);

router.get('/users', adminController.getAllUsers);
router.get('/payments', adminController.getAllPayments);
router.get('/notifications', adminController.getAllNotifications);
router.get('/activity', adminController.getActivity);

module.exports = router;
