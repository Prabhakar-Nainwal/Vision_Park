USE traffic_optimization;

DROP PROCEDURE IF EXISTS GenerateTrafficData;

DELIMITER $$

CREATE PROCEDURE GenerateTrafficData(IN num_records INT)
BEGIN
    DECLARE i INT DEFAULT 0;
    DECLARE v_plate VARCHAR(20);
    DECLARE v_category VARCHAR(20);
    DECLARE v_fuel VARCHAR(10);
    DECLARE v_decision VARCHAR(10);
    DECLARE v_zone_id INT;
    DECLARE v_conf DECIMAL(5,2);
    DECLARE v_pollution INT;
    
    -- Time variables
    DECLARE v_event_time DATETIME;
    DECLARE v_exit_time DATETIME;
    DECLARE v_duration_mins INT;
    DECLARE v_cutoff_time DATETIME DEFAULT '2025-11-16 23:59:59';
    
    -- Total seconds in ~686 days (2024 leap year + 2025 up to Nov 16)
    -- 366 days + 320 days = 686 days * 86400 = 59,270,400 seconds
    DECLARE v_total_seconds INT DEFAULT 59270400;

    WHILE i < num_records DO
        -- 1. Generate Random Entry Time (Jan 1, 2024 to Nov 16, 2025)
        SET v_event_time = DATE_ADD('2024-01-01 00:00:00', INTERVAL FLOOR(RAND() * v_total_seconds) SECOND);
        
        -- 2. Generate Vehicle Data
        SET v_plate = CONCAT('DL-', FLOOR(10 + (RAND() * 89)), '-AA-', FLOOR(1000 + (RAND() * 8999)));
        SET v_category = IF(RAND() > 0.7, 'Commercial', 'Private'); 
        SET v_fuel = IF(RAND() > 0.6, 'ICE', 'EV');
        SET v_conf = 85 + (RAND() * 14.99);
        SET v_pollution = FLOOR(RAND() * 180);
        
        -- 3. Apply Rules
        SET v_zone_id = NULL; 
        SET v_exit_time = NULL;

        IF v_category = 'Commercial' THEN
            SET v_decision = 'Ignore';
        ELSE
            IF RAND() < 0.75 THEN
                SET v_decision = 'Allow';
                SET v_zone_id = IF(RAND() < 0.5, 1, 2); -- Zone 1 or 2 only
                
                -- 4. Calculate Exit Time (Only for Allowed vehicles)
                -- Random duration between 30 mins and 300 mins (5 hours)
                SET v_duration_mins = 30 + FLOOR(RAND() * 270);
                SET v_exit_time = DATE_ADD(v_event_time, INTERVAL v_duration_mins MINUTE);
                
                -- LOGIC: If exit time is after the cutoff date, set it to NULL (Still Parked)
                IF v_exit_time > v_cutoff_time THEN
                    SET v_exit_time = NULL;
                END IF;
                
            ELSE
                SET v_decision = IF(RAND() < 0.5, 'Warn', 'Ignore');
            END IF;
        END IF;

        -- 5. Insert into Incoming (Real-time detection log)
        INSERT INTO incoming_vehicles 
        (number_plate, vehicle_category, fuel_type, confidence, decision, parking_zone_id, pollution_score, processed, detected_time)
        VALUES 
        (v_plate, v_category, v_fuel, v_conf, v_decision, v_zone_id, v_pollution, TRUE, v_event_time);

        -- 6. Insert into Vehicle Logs (History of parking)
        IF v_decision = 'Allow' THEN
            INSERT INTO vehicle_logs 
            (number_plate, vehicle_category, fuel_type, confidence, entry_time, exit_time, parking_zone_id, pollution_score)
            VALUES 
            (v_plate, v_category, v_fuel, v_conf, v_event_time, v_exit_time, v_zone_id, v_pollution);
        END IF;

        SET i = i + 1;
    END WHILE;
END$$

DELIMITER ;

-- ==========================================
-- EXECUTE
-- ==========================================

-- Recommended: Run with a larger number since it spans 2 years
CALL GenerateTrafficData(90000); 

-- Sync current occupancy (Only counts cars where exit_time IS NULL)
UPDATE parking_zones pz
SET occupied_slots = (
    SELECT COUNT(*) 
    FROM vehicle_logs vl 
    WHERE vl.parking_zone_id = pz.id 
    AND vl.exit_time IS NULL
)
WHERE pz.id IN (1, 2);