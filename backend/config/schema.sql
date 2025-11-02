CREATE DATABASE IF NOT EXISTS traffic_optimization;
USE traffic_optimization;

-- Table: parking_zones
CREATE TABLE IF NOT EXISTS parking_zones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  total_slots INT NOT NULL CHECK (total_slots > 0),
  occupied_slots INT DEFAULT 0 CHECK (occupied_slots >= 0),
  location VARCHAR(255) DEFAULT '',
  threshold_percentage INT DEFAULT 90,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_name (name),
  INDEX idx_active (is_active)
);

-- Table: incoming_vehicles (Real-time ANPR detections)
CREATE TABLE IF NOT EXISTS incoming_vehicles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  number_plate VARCHAR(50) NOT NULL,
  vehicle_category ENUM('Commercial', 'Private') NOT NULL,
  fuel_type ENUM('EV', 'ICE') NOT NULL,
  confidence DECIMAL(5,2) NOT NULL,
  detected_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  decision ENUM('Allow', 'Warn', 'Ignore') NOT NULL,
  parking_zone_id INT,
  pollution_score INT DEFAULT 0,
  processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parking_zone_id) REFERENCES parking_zones(id) ON DELETE SET NULL,
  INDEX idx_processed (processed),
  INDEX idx_detected_time (detected_time),
  INDEX idx_number_plate (number_plate)
);

-- Table: vehicle_logs (Allowed/processed vehicles only)
CREATE TABLE IF NOT EXISTS vehicle_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  number_plate VARCHAR(50) NOT NULL,
  vehicle_category ENUM('Commercial', 'Private') NOT NULL,
  fuel_type ENUM('EV', 'ICE') NOT NULL,
  confidence DECIMAL(5,2) NOT NULL,
  entry_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  exit_time TIMESTAMP NULL DEFAULT NULL,
  parking_zone_id INT,
  pollution_score INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (parking_zone_id) REFERENCES parking_zones(id) ON DELETE SET NULL,
  INDEX idx_number_plate (number_plate),
  INDEX idx_entry_time (entry_time),
  INDEX idx_exit_time (exit_time),
  INDEX idx_parking_zone (parking_zone_id)
);

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('organization_admin','admin') DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Insert sample parking zones
INSERT INTO parking_zones (name, total_slots, occupied_slots, location, threshold_percentage) VALUES
('Zone A', 100, 0, 'North Wing', 90),
('Zone B', 80, 0, 'South Wing', 85),
('Zone C', 120, 0, 'East Wing', 90);