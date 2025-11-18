import cv2
from ultralytics import YOLO
import easyocr
import numpy as np
import requests
import json
import time
from collections import defaultdict

# --- CONFIGURATION ---
MODEL_PATH = "best.pt"
BACKEND_URL = "http://localhost:5000/api/incoming"
CONF_THRESHOLD = 0.6
BUFFER_DURATION = 4  # seconds
MIN_OCCURRENCES = 3  # minimum number of times plate must appear before sending

model = YOLO(MODEL_PATH)
reader = easyocr.Reader(["en"], gpu=True)

# Rolling detection buffer
detection_buffer = []
last_sent_time = 0
SENT_COOLDOWN = 5  # seconds between backend sends

# --- Helper Functions ---
def detect_plate_color(crop):
    hsv = cv2.cvtColor(crop, cv2.COLOR_BGR2HSV)
    yellow_lower, yellow_upper = np.array([15, 60, 120]), np.array([35, 255, 255])
    green_lower, green_upper = np.array([35, 40, 40]), np.array([85, 255, 255])
    white_lower, white_upper = np.array([0, 0, 150]), np.array([180, 50, 255])

    mask_yellow = cv2.inRange(hsv, yellow_lower, yellow_upper)
    mask_green = cv2.inRange(hsv, green_lower, green_upper)
    mask_white = cv2.inRange(hsv, white_lower, white_upper)

    yellow_pixels = np.sum(mask_yellow > 0)
    green_pixels = np.sum(mask_green > 0)
    white_pixels = np.sum(mask_white > 0)

    if green_pixels > max(yellow_pixels, white_pixels):
        text_area = cv2.bitwise_and(crop, crop, mask=mask_white | mask_yellow)
        hsv_text = cv2.cvtColor(text_area, cv2.COLOR_BGR2HSV)
        mask_text_yellow = cv2.inRange(hsv_text, yellow_lower, yellow_upper)
        mask_text_white = cv2.inRange(hsv_text, white_lower, white_upper)
        yellow_text_pixels = np.sum(mask_text_yellow > 0)
        white_text_pixels = np.sum(mask_text_white > 0)
        text_color = "yellow" if yellow_text_pixels > white_text_pixels else "white"
        return "green", text_color

    if yellow_pixels > white_pixels:
        return "yellow", None
    else:
        return "white", None

def classify_vehicle(plate_color, text_color):
    if plate_color == "yellow":
        return "Commercial", "ICE"
    elif plate_color == "white":
        return "Private", "ICE"
    elif plate_color == "green":
        if text_color == "yellow":
            return "Commercial", "EV"
        else:
            return "Private", "EV"
    return "Unknown", "Unknown"

# --- Main Loop ---
cap = cv2.VideoCapture(0)

while True:
    ret, frame = cap.read()
    if not ret:
        break

    results = model(frame, verbose = False)[0]
    timestamp = time.time()

    for box in results.boxes:
        conf = float(box.conf)
        if conf < CONF_THRESHOLD:
            continue

        x1, y1, x2, y2 = map(int, box.xyxy[0])
        crop = frame[y1:y2, x1:x2]

        plate_color, text_color = detect_plate_color(crop)
        vehicle_category, fuel_type = classify_vehicle(plate_color, text_color)

        ocr_results = reader.readtext(crop)
        if ocr_results:
            text = ocr_results[0][1].upper().replace(" ", "").strip()
            ocr_conf = ocr_results[0][2]

            detection_buffer.append({
                "plate": text,
                "conf": ocr_conf,
                "vehicleCategory": vehicle_category,
                "fuelType": fuel_type,
                "time": timestamp
            })

        cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
        if ocr_results:
            cv2.putText(frame, text, (x1, y1 - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)

    # Clean old entries (older than BUFFER_DURATION)
    detection_buffer = [d for d in detection_buffer if (timestamp - d["time"]) <= BUFFER_DURATION]

    # Group by plate
    grouped = defaultdict(list)
    for d in detection_buffer:
        grouped[d["plate"]].append(d)

    # Find most consistent plate
    best_plate, best_score = None, 0
    for plate, entries in grouped.items():
        if len(entries) >= MIN_OCCURRENCES:
            avg_conf = np.mean([e["conf"] for e in entries])
            if avg_conf > best_score:
                best_score = avg_conf
                best_plate = entries[-1]  # latest detection info

    # Send stable detection
    if best_plate and (time.time() - last_sent_time) > SENT_COOLDOWN:
        payload = {
            "numberPlate": best_plate["plate"],
            "vehicleCategory": best_plate["vehicleCategory"],
            "fuelType": best_plate["fuelType"],
            "confidence": round(float(best_score), 2) * 100
        }

        print(json.dumps(payload, indent=4))

        try:
            response = requests.post(BACKEND_URL, json=payload)
            print(f"✅ Sent to backend | Status: {response.status_code}")
        except Exception as e:
            print(f"⚠️ Backend not reachable: {e}")

        last_sent_time = time.time()
        detection_buffer.clear()  # reset buffer to avoid duplicates

    cv2.imshow("YOLOv8 ANPR", frame)
    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

cap.release()
cv2.destroyAllWindows()
