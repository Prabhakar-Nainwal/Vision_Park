const ParkingZone = require('../models/ParkingZone');

// Get all parking zones
exports.getAllZones = async (req, res) => {
  try {
    const zones = await ParkingZone.findAll();
    
    res.json({
      success: true,
      count: zones.length,
      data: zones
    });
  } catch (error) {
    console.error('Error fetching zones:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching parking zones',
      error: error.message
    });
  }
};

// Get single parking zone
exports.getZoneById = async (req, res) => {
  try {
    const zone = await ParkingZone.findById(req.params.id);
    
    if (!zone) {
      return res.status(404).json({
        success: false,
        message: 'Parking zone not found'
      });
    }
    
    res.json({
      success: true,
      data: zone
    });
  } catch (error) {
    console.error('Error fetching zone:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching parking zone',
      error: error.message
    });
  }
};

// Create new parking zone
exports.createZone = async (req, res) => {
  try {
    // FIX 1: Add latitude and longitude to destructuring
    const { name, totalSlots, location, thresholdPercentage, latitude, longitude } = req.body;
    
    if (!name || !totalSlots) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, totalSlots'
      });
    }
    
    const exists = await ParkingZone.exists(name);
    if (exists) {
      return res.status(400).json({
        success: false,
        message: 'A parking zone with this name already exists'
      });
    }
    
    // FIX 2: Pass latitude and longitude to the model
    const zone = await ParkingZone.create({ name, totalSlots, location, thresholdPercentage, latitude, longitude });
    
    const io = req.app.get('io');
    io.emit('zoneCreated', zone);
    
    res.status(201).json({
      success: true,
      message: 'Parking zone created successfully',
      data: zone
    });
  } catch (error) {
    console.error('Error creating zone:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating parking zone',
      error: error.message
    });
  }
};

// Update parking zone
exports.updateZone = async (req, res) => {
  try {
    // FIX 3: Add latitude and longitude to destructuring
    const { name, totalSlots, location, thresholdPercentage, latitude, longitude } = req.body;
    
    // FIX 4: Pass latitude and longitude to the model
    const zone = await ParkingZone.update(req.params.id, {
      name,
      totalSlots,
      location,
      thresholdPercentage,
      latitude, // Pass coordinate
      longitude // Pass coordinate
    });
    
    if (!zone) {
      return res.status(404).json({
        success: false,
        message: 'Parking zone not found'
      });
    }
    
    const io = req.app.get('io');
    io.emit('zoneUpdated', zone);
    
    res.json({
      success: true,
      message: 'Parking zone updated successfully',
      data: zone
    });
  } catch (error) {
    console.error('Error updating zone:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating parking zone',
      error: error.message
    });
  }
};

// Delete parking zone
exports.deleteZone = async (req, res) => {
  try {
    await ParkingZone.softDelete(req.params.id);
    
    const io = req.app.get('io');
    io.emit('zoneDeleted', { id: req.params.id });
    
    res.json({
      success: true,
      message: 'Parking zone deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting zone:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting parking zone',
      error: error.message
    });
  }
};