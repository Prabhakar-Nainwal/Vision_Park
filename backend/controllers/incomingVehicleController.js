const IncomingVehicle = require('../models/IncomingVehicle');
const ParkingZone = require('../models/ParkingZone');

// Get unprocessed incoming vehicles (for real-time display)
exports.getUnprocessed = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const vehicles = await IncomingVehicle.findUnprocessed(limit);

    return res.json({
      success: true,
      count: vehicles.length,
      data: vehicles
    });
  } catch (error) {
    console.error('Error fetching unprocessed vehicles:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching unprocessed vehicles',
      error: error.message
    });
  }
};

// Add new incoming vehicle from ANPR
exports.addIncomingVehicle = async (req, res) => {
  try {
    const { numberPlate, vehicleCategory, fuelType, confidence } = req.body;
    // Validate required fields
    if (!numberPlate || !vehicleCategory || !fuelType || confidence === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: numberPlate, vehicleCategory, fuelType, confidence'
      });
    }

    // Calculate pollution score
    const pollutionScore = fuelType === 'ICE'
      ? Math.floor(Math.random() * 10) + 40 : 0;

    // STEP 1: Check if Commercial vehicle - assign IGNORE decision
    if (vehicleCategory === 'Commercial') {
      const vehicle = await IncomingVehicle.create({
        numberPlate,
        vehicleCategory,
        fuelType,
        confidence,
        decision: 'Ignore',
        parkingZoneId: null,
        pollutionScore
      });

      // Mark as processed (will NOT go to vehicle_logs due to Ignore decision)
      await IncomingVehicle.processVehicle(vehicle.id);

      // Emit to real-time feed
      const io = req.app.get('io');
      io.emit('newIncomingVehicle', {
        id: vehicle.id,
        number_plate: numberPlate,
        vehicle_category: vehicleCategory,
        fuel_type: fuelType,
        confidence: confidence,
        detected_time: new Date().toISOString(),
        decision: 'Ignore',
        zone_name: null,
        pollution_score: pollutionScore
      });

      return res.status(201).json({
        success: true,
        message: 'Commercial vehicle - Decision: Ignore',
        data: vehicle,
        decision: 'Ignore'
      });
    }

    // STEP 2: For Private vehicles - check total parking occupancy
    const totalOccupancyStatus = await ParkingZone.checkTotalOccupancy();

    const decision = totalOccupancyStatus.decision; // 'Allow' or 'Warn'

    let assignedZoneId = null;
    let assignedZoneName = null;

    if (decision === 'Allow') {
      // Find an available zone with space
      const availableZone = await ParkingZone.findAvailableZone();

      if (availableZone) {
        assignedZoneId = availableZone.id;
        assignedZoneName = availableZone.name;
      } else {
        // No zones available - change to Warn
        const warnVehicle = await IncomingVehicle.create({
          numberPlate,
          vehicleCategory,
          fuelType,
          confidence,
          decision: 'Warn',
          parkingZoneId: null,
          pollutionScore
        });

        // Mark as processed (will NOT go to vehicle_logs due to Warn decision)
        await IncomingVehicle.processVehicle(warnVehicle.id);

        const io = req.app.get('io');
        io.emit('newIncomingVehicle', {
          id: warnVehicle.id,
          number_plate: numberPlate,
          vehicle_category: vehicleCategory,
          fuel_type: fuelType,
          confidence: confidence,
          detected_time: new Date().toISOString(),
          decision: 'Warn',
          zone_name: null,
          pollution_score: pollutionScore
        });

        return res.status(201).json({
          success: true,
          message: 'Private vehicle - Decision: Warn (All zones full)',
          data: warnVehicle,
          decision: 'Warn',
          totalOccupancy: totalOccupancyStatus
        });
      }
    }

    // STEP 3: Create incoming vehicle entry
    const vehicle = await IncomingVehicle.create({
      numberPlate,
      vehicleCategory,
      fuelType,
      confidence,
      decision,
      parkingZoneId: assignedZoneId,
      pollutionScore
    });

    // STEP 4: Process vehicle
    const processResult = await IncomingVehicle.processVehicle(vehicle.id);

    if (decision === 'Allow' && assignedZoneId && processResult.vehicleLogId) {
      // ONLY for Allow decision: Update parking zone and add to vehicle_logs
      await ParkingZone.incrementOccupancy(assignedZoneId);

      const io = req.app.get('io');
      io.emit('newIncomingVehicle', {
        id: vehicle.id,
        number_plate: numberPlate,
        vehicle_category: vehicleCategory,
        fuel_type: fuelType,
        confidence: confidence,
        detected_time: new Date().toISOString(),
        decision: 'Allow',
        zone_name: assignedZoneName,
        parking_zone_id: assignedZoneId,
        pollution_score: pollutionScore
      });
      io.emit('zoneUpdated', await ParkingZone.findById(assignedZoneId));

      return res.status(201).json({
        success: true,
        message: `Private vehicle - Decision: Allow (Assigned to ${assignedZoneName})`,
        data: vehicle,
        decision: 'Allow',
        assignedZone: {
          id: assignedZoneId,
          name: assignedZoneName
        },
        vehicleLogId: processResult.vehicleLogId
      });
    } else {
      // Decision is Warn - parking full
      const io = req.app.get('io');
      io.emit('newIncomingVehicle', {
        id: vehicle.id,
        number_plate: numberPlate,
        vehicle_category: vehicleCategory,
        fuel_type: fuelType,
        confidence: confidence,
        detected_time: new Date().toISOString(),
        decision: 'Warn',
        zone_name: null,
        pollution_score: pollutionScore
      });

      return res.status(201).json({
        success: true,
        message: 'Private vehicle - Decision: Warn (All zones full)',
        data: vehicle,
        decision: 'Warn',
        totalOccupancy: totalOccupancyStatus
      });
    }
  } catch (error) {
    console.error('Error adding incoming vehicle:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding incoming vehicle',
      error: error.message
    });
  }
};

// Process single vehicle
exports.processVehicle = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await IncomingVehicle.processVehicle(id);

    if (result.success && result.vehicleLogId) {
      // Get the vehicle data
      const vehicle = await IncomingVehicle.findById(id);

      // Update parking zone occupancy if allowed
      if (vehicle.parking_zone_id && vehicle.decision === 'Allow') {
        await ParkingZone.incrementOccupancy(vehicle.parking_zone_id);
      }

      // Emit real-time updates
      const io = req.app.get('io');
      io.emit('vehicleProcessed', { id, vehicleLogId: result.vehicleLogId });
    }

    res.json({
      success: true,
      message: result.message,
      data: result
    });
  } catch (error) {
    console.error('Error processing vehicle:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing vehicle',
      error: error.message
    });
  }
};

// Get statistics
exports.getStats = async (req, res) => {
  try {
    const stats = await IncomingVehicle.getStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
};

// logs & reports
// Get History (for Logs & Reports page)
exports.getHistory = async (req, res) => {
  try {
    const filters = {
      search: req.query.search,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      page: req.query.page,   // Pass page
      limit: req.query.limit  // Pass limit
    };

    const result = await IncomingVehicle.getHistory(filters);

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Get Analytics (for Logs & Reports page)
exports.getAnalytics = async (req, res) => {
  try {
    const data = await IncomingVehicle.getAnalytics();
    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};