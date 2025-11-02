const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController'); //Traffic Analysis

const { verifyToken } = require('../middleware/authMiddleware');
// PUBLIC Routes
router.get('/analytics', vehicleController.getAnalytics);
router.get('/analytics/traffic', vehicleController.getTrafficAnalytics); //TrafficAnalysis
router.get('/', vehicleController.getAllVehicles);

router.use(verifyToken);

//Protected Routes
router.get('/', vehicleController.getAllVehicles);
router.put('/:id/exit', vehicleController.updateVehicleExit);



module.exports = router;


