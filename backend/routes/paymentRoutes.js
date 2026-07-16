/**
 * Payment Routes
 * FASTag, fuel, insurance, tax, challan
 */

const express = require('express');
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware.protect);

router.get('/overview', paymentController.getOverview);
router.get('/history', paymentController.getHistory);
router.post('/tollgate', paymentController.tollgatePayment);
router.post('/fuel', paymentController.fuelPayment);
router.post('/insurance', paymentController.insurancePayment);
router.post('/tax', paymentController.taxPayment);
router.post('/challan', paymentController.challanPayment);
router.post('/checkup', paymentController.checkupPayment);

module.exports = router;
