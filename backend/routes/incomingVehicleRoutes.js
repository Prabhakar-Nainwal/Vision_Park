const express = require('express');
const router = express.Router();
const incomingVehicleController = require('../controllers/incomingVehicleController');
const { verifyToken } = require('../middleware/authMiddleware');

// --- PUBLIC ROUTES ---
// Get statistics
router.get('/stats', incomingVehicleController.getStats);

// Add new incoming vehicle (ANPR endpoint)

router.post('/', incomingVehicleController.addIncomingVehicle);

// --- APPLY AUTH MIDDLEWARE ---

router.use(verifyToken);

// --- PROTECTED ROUTES ---

// Routes for Logs & Reports
router.get('/history', incomingVehicleController.getHistory);
router.get('/analytics', incomingVehicleController.getAnalytics);

// Get unprocessed incoming vehicles
router.get('/unprocessed', incomingVehicleController.getUnprocessed);

// Process single vehicle
router.post('/:id/process', incomingVehicleController.processVehicle);

module.exports = router;