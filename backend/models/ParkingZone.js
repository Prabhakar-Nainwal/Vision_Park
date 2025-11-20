const db = require('../config/db');

class ParkingZone {
  // Create new parking zone
  static async create(zoneData) {
    const { name, totalSlots, location, thresholdPercentage, latitude, longitude } = zoneData;
    
    const query = `
      INSERT INTO parking_zones (name, total_slots, location, threshold_percentage, latitude, longitude)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await db.execute(query, [
      name, 
      totalSlots, 
      location || '', 
      thresholdPercentage || 90,
      latitude || 0.0, 
      longitude || 0.0  
    ]);
    
    return { id: result.insertId, ...zoneData, occupiedSlots: 0, isActive: true };
  }


  // Get all active zones (This was previously fixed)
  static async findAll() {
    const query = `
      SELECT 
        id,
        name,
        total_slots as totalSlots,
        occupied_slots as occupiedSlots,
        location,
        threshold_percentage as thresholdPercentage,
        is_active as isActive,
        latitude,
        longitude,
        (total_slots - occupied_slots) as availableSlots,
        ROUND((occupied_slots / total_slots) * 100) as occupancyPercentage,
        created_at as createdAt,
        updated_at as updatedAt
      FROM parking_zones
      WHERE is_active = TRUE
      ORDER BY name ASC
    `;
    
    const [rows] = await db.execute(query);
    return rows;
  }

  // Find by ID (This was previously fixed)
  static async findById(id) {
    const query = `
      SELECT 
        id,
        name,
        total_slots as totalSlots,
        occupied_slots as occupiedSlots,
        location,
        threshold_percentage as thresholdPercentage,
        is_active as isActive,
        latitude,
        longitude,
        (total_slots - occupied_slots) as availableSlots,
        ROUND((occupied_slots / total_slots) * 100) as occupancyPercentage,
        created_at as createdAt,
        updated_at as updatedAt
      FROM parking_zones
      WHERE id = ?
    `;
    
    const [rows] = await db.execute(query, [id]);
    return rows[0];
  }

  // Check if occupancy is above threshold
  static async checkOccupancy(id) {
    const zone = await this.findById(id);
    if (!zone) return null;
    
    const isAboveThreshold = zone.occupancyPercentage >= zone.thresholdPercentage;
    
    return {
      ...zone,
      isAboveThreshold,
      decision: isAboveThreshold ? 'Warn' : 'Allow'
    };
  }

  // Check total occupancy across ALL zones
  static async checkTotalOccupancy() {
    const query = `
      SELECT 
        SUM(total_slots) as total_slots,
        SUM(occupied_slots) as occupied_slots,
        AVG(threshold_percentage) as avg_threshold
      FROM parking_zones
      WHERE is_active = TRUE
    `;
    
    const [rows] = await db.execute(query);
    const { total_slots, occupied_slots, avg_threshold } = rows[0];
    
    if (!total_slots || total_slots === 0) {
      return { decision: 'Warn', occupancyPercentage: 100, availableSlots: 0 };
    }
    
    const occupancyPercentage = Math.round((occupied_slots / total_slots) * 100);
    const availableSlots = total_slots - occupied_slots;
    const threshold = avg_threshold || 90;
    
    return {
      totalSlots: total_slots,
      occupiedSlots: occupied_slots,
      availableSlots: availableSlots,
      occupancyPercentage: occupancyPercentage,
      threshold: threshold,
      decision: occupancyPercentage >= threshold ? 'Warn' : 'Allow'
    };
  }

  // Update parking zone
  static async update(id, zoneData) {
    // FIX 1: Add latitude and longitude to destructuring
    const { name, totalSlots, location, thresholdPercentage, latitude, longitude } = zoneData;
    
    const query = `
      -- FIX 2: Add columns to SET clause
      UPDATE parking_zones
      SET name = ?, total_slots = ?, location = ?, threshold_percentage = ?, latitude = ?, longitude = ?
      WHERE id = ?
    `;
    
    // FIX 3: Add parameters to execute array
    await db.execute(query, [
      name, 
      totalSlots, 
      location || '', 
      thresholdPercentage || 90, 
      latitude || 0.0, 
      longitude || 0.0, 
      id
    ]);
    
    return await this.findById(id);
  }

  // Soft delete
  static async softDelete(id) {
    const query = 'UPDATE parking_zones SET is_active = FALSE WHERE id = ?';
    await db.execute(query, [id]);
    return true;
  }

  // Increment occupied slots
  static async incrementOccupancy(id) {
    const query = `
      UPDATE parking_zones
      SET occupied_slots = occupied_slots + 1
      WHERE id = ? AND occupied_slots < total_slots
    `;
    
    await db.execute(query, [id]);
    return await this.findById(id);
  }

  // Decrement occupied slots
  static async decrementOccupancy(id) {
    const query = `
      UPDATE parking_zones
      SET occupied_slots = GREATEST(occupied_slots - 1, 0)
      WHERE id = ?
    `;
    
    await db.execute(query, [id]);
    return await this.findById(id);
  }

  // Assign to a zone with available space, considering the threshold
  static async findAvailableZone() {
    const query = `
      SELECT id, name, total_slots, occupied_slots, 
             (total_slots - occupied_slots) as available_slots
      FROM parking_zones
      WHERE is_active = TRUE 
      AND ROUND((occupied_slots / total_slots) * 100) < threshold_percentage
      ORDER BY occupied_slots ASC
      LIMIT 1
    `;
    
    const [rows] = await db.execute(query);
    return rows[0] || null;
  }

  // Check if zone exists
  static async exists(name) {
    const query = 'SELECT COUNT(*) as count FROM parking_zones WHERE name = ?';
    const [rows] = await db.execute(query, [name]);
    return rows[0].count > 0;
  }
}

module.exports = ParkingZone;