const express = require('express');
const router = express.Router();
const zoneController = require('../controllers/zoneController');
const { verifyToken } = require('../middleware/authMiddleware');

// 🟢 Public route (for public dashboard view)
router.get('/', zoneController.getAllZones);

// 🔒 Protected routes
router.use(verifyToken);
router.get('/:id', zoneController.getZoneById);
router.post('/', zoneController.createZone);
router.put('/:id', zoneController.updateZone);
router.delete('/:id', zoneController.deleteZone);

module.exports = router;
