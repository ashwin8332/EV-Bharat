# Hardware Setup & Wireless Car Model

## 🔌 Wireless Car Model Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    PHYSICAL CAR MODEL / IoT DEVICE               │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              SENSOR LAYER                                   │ │
│  │  ┌──────────────┬──────────────┬──────────────┬─────────┐  │ │
│  │  │ Battery      │ GPS Module   │ Temperature  │ Current │  │ │
│  │  │ Voltage      │ (NEO-6M)     │ Sensors      │ Sensors │  │ │
│  │  │ Sensor       │              │ (DHT22)      │ (ACS712)│  │ │
│  │  └──────┬───────┴──────┬───────┴──────┬───────┴────┬────┘  │ │
│  └─────────┼──────────────┼──────────────┼────────────┼───────┘ │
│            │              │              │            │          │
│            └──────────────┴──────────────┴────────────┘          │
│                            │                                      │
│  ┌─────────────────────────▼────────────────────────────────┐   │
│  │         MICROCONTROLLER UNIT (MCU)                        │   │
│  │  • ESP32 / NodeMCU / Raspberry Pi                         │   │
│  │  • Data aggregation and preprocessing                     │   │
│  │  • Protocol handling (MQTT/HTTP/WebSocket)                │   │
│  │  • Edge computing for basic analytics                     │   │
│  └─────────────────────────┬────────────────────────────────┘   │
│                            │                                      │
│  ┌─────────────────────────▼────────────────────────────────┐   │
│  │         WIRELESS COMMUNICATION LAYER                      │   │
│  │  ┌───────────┬──────────┬──────────────────┐            │   │
│  │  │ VLC       │ LoRaWAN  │ 4G/5G Module     │            │   │
│  │  │ (Line-of- │ (Long    │ (SIM800/SIM7600) │            │   │
│  │  │ sight)    │ Range)   │                  │            │   │
│  │  └───────────┴──────────┴──────────────────┘            │   │
│  └────────────────────────────────────────────────────────────┘ │
└────────────────────────┬───────────────────────────────────────┘
                         │
                         │ WIRELESS TRANSMISSION
                         │ (JSON payload over MQTT/HTTP)
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CLOUD/SERVER LAYER                            │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              MQTT BROKER / API Gateway                      │ │
│  │              (Mosquitto / AWS IoT Core)                     │ │
│  └────────────────────────┬───────────────────────────────────┘ │
│                           │                                      │
│  ┌────────────────────────▼───────────────────────────────────┐ │
│  │              DATA PROCESSING SERVICE                        │ │
│  │  • Validate incoming sensor data                           │ │
│  │  • Store in database (PostgreSQL/MongoDB)                  │ │
│  │  • Trigger ML models (Modules A & B)                       │ │
│  └────────────────────────┬───────────────────────────────────┘ │
│                           │                                      │
│  ┌────────────────────────▼───────────────────────────────────┐ │
│  │              ML INFERENCE ENGINE                            │ │
│  │  • Battery health prediction                               │ │
│  │  • Energy consumption forecasting                          │ │
│  │  • Anomaly detection                                       │ │
│  └────────────────────────┬───────────────────────────────────┘ │
│                           │                                      │
│                           ▼                                      │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │              WEB/MOBILE APPLICATION                        │ │
│  │  • Real-time dashboard                                     │ │
│  │  • Route recommendations                                   │ │
│  │  • Alerts and notifications                                │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📡 Wireless Communication Protocol Selection

| Protocol   | Range       | Power    | Data Rate | Use Case                    |
|------------|-------------|----------|-----------|----------------------------|
| **VLC**    | 2-20m LOS   | Medium   | High      | Lab/indoor telemetry link   |
| **LoRaWAN**| 2-15km      | Low      | Low       | Long-range rural areas      |
| **4G/5G**  | Wide area   | Medium   | Very High | Production deployment       |
| **MQTT**   | Protocol layer          | -         | Lightweight pub/sub messaging |

**Recommendation**: Start with **VLC + MQTT** (optical bridge) for prototyping; use **4G/5G** for field deployment.

---

## 🔧 Hardware Components (Bill of Materials)

### Essential Components

| Component | Specification | Quantity | Approx. Cost (INR) |
|-----------|---------------|----------|-------------------|
| **Microcontroller** | ESP32 DevKit V1 | 1 | ₹400-600 |
| **Voltage Sensor** | Voltage Divider / INA219 | 1 | ₹150-300 |
| **Current Sensor** | ACS712 (20A/30A) | 1 | ₹200-350 |
| **Temperature Sensor** | DHT22 / DS18B20 | 1 | ₹150-250 |
| **GPS Module** | NEO-6M / NEO-M8N | 1 | ₹400-700 |
| **Power Supply** | Li-ion 3.7V (18650) + holder | 2 | ₹200-400 |
| **Voltage Regulator** | AMS1117 3.3V | 1 | ₹20-50 |
| **Display (Optional)** | 0.96" OLED I2C | 1 | ₹200-350 |
| **Breadboard** | 830 points | 1 | ₹100-200 |
| **Jumper Wires** | M-M, M-F, F-F | Set | ₹100-150 |

### VLC Link Components (Required)

| Component | Specification | Quantity | Approx. Cost (INR) |
|-----------|---------------|----------|-------------------|
| **TX LED + Driver** | 1-3W high-power white/blue LED with constant-current driver (350-700mA) | 1 | ₹250-500 |
| **Optics (TX)** | Collimating lens or diffuser for LED | 1 | ₹100-200 |
| **Photodiode (RX)** | PIN photodiode or phototransistor | 1 | ₹150-300 |
| **TIA Module (RX)** | Transimpedance amplifier (e.g., OPA381/LM358 breakout) | 1 | ₹150-300 |
| **Optics (RX)** | Focusing lens + light baffle to reduce ambient noise | 1 | ₹150-300 |
| **Heatsink/Fan** | For LED thermal management | 1 | ₹100-200 |
| **Enclosure Mounts** | Brackets to maintain line-of-sight alignment | 2 | ₹100-150 |

### For Physical Car Model

| Component | Specification | Quantity | Approx. Cost (INR) |
|-----------|---------------|----------|-------------------|
| **Chassis** | RC Car base / 4WD robot | 1 | ₹800-1500 |
| **DC Motors** | 3-6V, 200 RPM | 4 | ₹200-400 |
| **Motor Driver** | L298N H-Bridge | 1 | ₹150-250 |
| **Wheels** | 65mm diameter | 4 | ₹100-200 |
| **Battery Holder** | For 18650 cells | 1 | ₹50-100 |

### Optional (Advanced Features)

| Component | Purpose | Approx. Cost (INR) |
|-----------|---------|-------------------|
| **SIM800L** | GSM/GPRS for 4G | ₹350-500 |
| **SD Card Module** | Local data logging | ₹100-200 |
| **Ultrasonic Sensor** | Obstacle detection | ₹100-150 |
| **Accelerometer** | Motion detection | ₹150-250 |

**Total Estimated Cost**: ₹3,000 - 5,000 (Basic setup)
**Additional for VLC Link**: ₹900 - 1,700

---

## 📊 Data Flow from Car to Cloud

```
Sensor Reading (Every 1-5 seconds)
         │
         ▼
ESP32 Microcontroller
  ├─ Read voltage: 48.5V
  ├─ Read current: 12.3A
  ├─ Read temp: 32°C
  ├─ Read GPS: 28.6139°N, 77.2090°E
  └─ Read speed: 45 km/h
         │
         ▼
Create JSON Payload
{
  "device_id": "EV_001",
  "timestamp": "2026-01-15T10:30:45Z",
  "battery": {
    "voltage": 48.5,
    "current": 12.3,
    "temperature": 32,
    "soc": 75
  },
  "location": {
    "latitude": 28.6139,
    "longitude": 77.2090,
    "speed": 45
  }
}
         │
         ▼
Transmit via VLC optical link (JSON over UART)
  Topic (at gateway MQTT bridge): "ev/telemetry/EV_001"
         │
         ▼
Cloud MQTT Broker receives
         │
         ▼
Backend API processes
  ├─ Store in database
  ├─ Feed to ML models
  └─ Update dashboard
         │
         ▼
User sees real-time data on app
```

---

## 🔌 Wiring Diagram (ESP32 Based)

```
ESP32 DevKit
├─ GPIO 34 → Voltage Sensor (Analog)
├─ GPIO 35 → Current Sensor (Analog)
├─ GPIO 4  → DHT22 (Data)
├─ GPIO 16 → GPS TX
├─ GPIO 17 → GPS RX
├─ GPIO 21 → OLED SDA (I2C)
├─ GPIO 22 → OLED SCL (I2C)
├─ 3.3V    → Sensors VCC
└─ GND     → Common Ground

Power Supply
├─ 18650 Battery (3.7V) → AMS1117 Regulator → 3.3V → ESP32
└─ USB Cable (Development/Debugging)
```

---

## 🛠️ Assembly Instructions

### Step 1: Prepare Components
1. Unbox all components
2. Test ESP32 with basic blink sketch
3. Check sensor functionality individually

### Step 2: Breadboard Assembly
1. Mount ESP32 on breadboard
2. Connect voltage regulator
3. Wire sensors according to diagram
4. Double-check connections

### Step 3: Firmware Upload
1. Install Arduino IDE + ESP32 board support
2. Upload sensor test code
3. Verify serial monitor output
4. Test VLC TX/RX by placing emitter/receiver 2-5m apart; confirm packets arrive at gateway

### Step 4: MQTT Setup
1. Install MQTT broker (Mosquitto) on server/cloud or gateway
2. Configure gateway to publish VLC-received UART frames to MQTT
3. Test publish/subscribe functionality end-to-end (ESP32 → VLC → gateway → broker)

### Step 5: Car Integration (Optional)
1. Mount components on chassis
2. Connect motors to L298N driver
3. Add battery pack for mobility
4. Test movement and data collection

---

## 🔧 Firmware Development

### Quick Start Code (ESP32 → VLC UART → MQTT Gateway)

```cpp
#include <ArduinoJson.h>
#include <DHT.h>

DHT dht(4, DHT22);

// Use UART2 for VLC TX/RX (GPIO16/17 on many ESP32 boards)
HardwareSerial vlc(2);

void setup() {
  Serial.begin(115200);
  vlc.begin(115200, SERIAL_8N1, 16, 17); // RX, TX
  dht.begin();
}

void loop() {
  float temp = dht.readTemperature();
  float voltage = analogRead(34) * (3.3 / 4095.0);

  // Build JSON
  StaticJsonDocument<128> doc;
  doc["device_id"] = "EV_001";
  doc["temp"] = temp;
  doc["voltage"] = voltage;

  // Serialize to VLC UART
  serializeJson(doc, vlc);
  vlc.println(); // newline as frame separator

  delay(5000); // Send every 5 seconds
}
```

**Gateway note**: The receiving gateway should read the VLC UART stream and publish the JSON line to the MQTT broker topic `ev/telemetry/EV_001`.

---

## 📚 Recommended Resources

### Hardware Tutorials
- [ESP32 Getting Started Guide](https://randomnerdtutorials.com/getting-started-with-esp32/)
- [MQTT Protocol Basics](https://mqtt.org/getting-started/)
- [GPS Module with ESP32](https://lastminuteengineers.com/neo6m-gps-arduino-tutorial/)

### Shopping Links (India)
- **Robu.in** - Electronics components
- **Amazon India** - Sensors and modules
- **HackerEarth** - Development boards
- **Local Electronics Market** - Lamington Road (Mumbai), SP Road (Bangalore)

---

## ⚠️ Safety Considerations

1. **Voltage Levels**: Never exceed 3.3V on ESP32 GPIO pins
2. **Current Protection**: Use appropriate fuses for battery
3. **Heat Management**: Ensure proper ventilation for regulators and LED heatsink
4. **Short Circuit**: Double-check all connections before power-on
5. **Battery Handling**: Follow Li-ion battery safety guidelines
6. **Eye Safety**: Do not stare into high-power LEDs; use diffusers or shielding during tests

---

## 🔍 Troubleshooting

| Issue | Solution |
|-------|----------|
| VLC link unstable | Improve LOS alignment, reduce ambient light, add RX shielding |
| Sensor readings incorrect | Verify wiring, check voltage levels |
| MQTT connection fails | Test broker connectivity, firewall settings |
| GPS not getting fix | Move to open area, wait 2-3 minutes |
| Random resets | Insufficient power supply, add capacitors |

---

**Next**: See [TECH_STACK.md](TECH_STACK.md) for software setup and [DEVELOPMENT_ROADMAP.md](DEVELOPMENT_ROADMAP.md) for timeline.
