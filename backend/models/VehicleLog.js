const db = require('../config/db');

class VehicleLog {
  // Get all vehicle logs with filters and pagination
  static async findAll(filters = {}) {
    let query = `
    SELECT v.*, p.name as zone_name 
    FROM vehicle_logs v
    LEFT JOIN parking_zones p ON v.parking_zone_id = p.id
    WHERE 1=1
  `;
    const params = [];

    // Apply filters safely
    if (filters.fuelType && filters.fuelType.trim() !== '') {
      query += ' AND v.fuel_type = ?';
      params.push(filters.fuelType.trim());
    }

    if (filters.vehicleCategory && filters.vehicleCategory.trim() !== '') {
      query += ' AND v.vehicle_category = ?';
      params.push(filters.vehicleCategory.trim());
    }

    if (filters.search && filters.search.trim() !== '') {
      query += ' AND v.number_plate LIKE ?';
      params.push(`%${filters.search.trim()}%`);
    }

    if (filters.startDate && filters.startDate.trim() !== '') {
      query += ' AND v.entry_time >= ?';
      params.push(filters.startDate.trim());
    }

    if (filters.endDate && filters.endDate.trim() !== '') {
      query += ' AND v.entry_time <= ?';
      params.push(filters.endDate.trim());
    }


    // Pagination section
    let limit = parseInt(filters.limit, 10);
    let offset = parseInt(filters.offset, 10);

    if (isNaN(limit) || limit <= 0) limit = 20;
    if (isNaN(offset) || offset < 0) offset = 0;

    query += ` ORDER BY v.entry_time DESC LIMIT ${limit} OFFSET ${offset}`;


    const [rows] = await db.execute(query, params);
    return rows;

  }


  // Get recent vehicles
  static async findRecent(limit = 10) {
    const query = `
      SELECT v.*, p.name as zone_name 
      FROM vehicle_logs v
      LEFT JOIN parking_zones p ON v.parking_zone_id = p.id
      ORDER BY v.entry_time DESC
      LIMIT ?
    `;

    const [rows] = await db.execute(query, [limit]);
    return rows;
  }

  // Update vehicle exit
  static async updateExit(id) {
    const query = `
      UPDATE vehicle_logs 
      SET exit_time = CURRENT_TIMESTAMP 
      WHERE id = ?
    `;

    await db.execute(query, [id]);

    const [rows] = await db.execute('SELECT * FROM vehicle_logs WHERE id = ?', [id]);
    return rows[0];
  }

  // Get fuel distribution
  static async getFuelDistribution() {
    const query = `
      SELECT fuel_type, COUNT(*) as count
      FROM vehicle_logs
      GROUP BY fuel_type
    `;

    const [rows] = await db.execute(query);
    return rows;
  }

  // Get daily counts for last 7 days
  static async getDailyCounts() {
    const query = `
      SELECT 
        DATE(entry_time) as date,
        COUNT(*) as count,
        AVG(pollution_score) as avg_pollution
      FROM vehicle_logs
      WHERE entry_time >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY DATE(entry_time)
      ORDER BY date ASC
    `;

    const [rows] = await db.execute(query);
    return rows;
  }

  // Get pollution index (based on EV vs ICE ratio)
static async getPollutionIndex() {
  const query = `
    SELECT 
      SUM(CASE WHEN fuel_type = 'ICE' THEN 1 ELSE 0 END) AS ice_count,
      SUM(CASE WHEN fuel_type = 'EV' THEN 1 ELSE 0 END) AS ev_count,
      COUNT(*) AS total
    FROM incoming_vehicles
    WHERE decision != 'Warn'
      AND fuel_type IN ('ICE', 'EV')
      AND detected_time >= DATE_SUB(NOW(), INTERVAL 2 DAY)
  `;

  const [rows] = await db.execute(query);
  const { ice_count, ev_count, total } = rows[0];

  if (total === 0) return 0;

  // --- Normalize based on total vehicle count ---
  // Small samples = lower reliability, scale down effect
  const normalizationFactor = Math.min(total / 50, 1); // Maxes out after ~50 vehicles

  // --- Weighted AQI formula ---
  const weightedPollution = (ice_count * 1.0 + ev_count * 0.2) / total;

  // --- Final AQI ---
  let pollutionIndex = Math.round(weightedPollution * 100 * normalizationFactor);

  // Ensure realistic lower and upper bounds
  if (pollutionIndex < 21) pollutionIndex = 21;  // floor
  if (pollutionIndex > 95) pollutionIndex = 95; // cap

  return pollutionIndex;
}

  // Find by ID
  static async findById(id) {
    const query = 'SELECT * FROM vehicle_logs WHERE id = ?';
    const [rows] = await db.execute(query, [id]);
    return rows[0];
  }
}

module.exports = VehicleLog;