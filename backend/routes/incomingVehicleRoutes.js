const express = require('express');
const router = express.Router();
const incomingVehicleController = require('../controllers/incomingVehicleController');
const { verifyToken } = require('../middleware/authMiddleware');

// --- PUBLIC ROUTES ---
// These routes are NOT protected by auth.
// They can be accessed by anyone, including your detect.py script.

// Get statistics
router.get('/stats', incomingVehicleController.getStats);

// Add new incoming vehicle (ANPR endpoint)
// This is now public, so your Python script can send data.
router.post('/', incomingVehicleController.addIncomingVehicle);


// --- APPLY AUTH MIDDLEWARE ---
// Everything *after* this line is protected and requires a valid token.
router.use(verifyToken);


// --- PROTECTED ROUTES ---
// These routes are only for logged-in admins.

// Get unprocessed incoming vehicles
router.get('/unprocessed', incomingVehicleController.getUnprocessed);

// Process single vehicle
router.post('/:id/process', incomingVehicleController.processVehicle);

module.exports = router;