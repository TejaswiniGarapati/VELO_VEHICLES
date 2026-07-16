/**
 * User Routes
 * Profile, vehicles, update vehicle
 */

const express = require('express');
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require login
router.use(authMiddleware.protect);

router.get('/profile', userController.getProfile);
router.get('/vehicles', userController.getVehicles);
router.post('/vehicles', userController.addVehicle);
router.get('/vehicle/default', userController.getOrCreateDefaultVehicle);
router.put('/vehicle', userController.updateVehicle);

module.exports = router;
