const express = require('express');

const logisticsController = require(
  '../controllers/logisticsController'
);

const authMiddleware = require(
  '../middleware/authMiddleware'
);

const router = express.Router();

router.use(authMiddleware.protect);

router.get(
  '/',
  logisticsController.getDeliveries
);

router.post(
  '/',
  logisticsController.createDelivery
);

router.patch(
  '/:id/status',
  logisticsController.updateDeliveryStatus
);

module.exports = router;