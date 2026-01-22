# Development Roadmap

## 📋 16-Week Implementation Timeline

---

## Week 1-2: Setup & Hardware Procurement

### Tasks
- [ ] Set up development environment (Python, IDEs)
- [ ] Purchase hardware components (ESP32, sensors)
- [ ] Procure VLC link parts (LED driver, high-power LED, photodiode + TIA, optics)
- [ ] Research and select APIs (Google Maps, traffic APIs)
- [ ] Set up version control (Git)
- [ ] Install Arduino IDE / PlatformIO

### Deliverables
- ✅ All hardware components procured
- ✅ VLC optical link BOM received (TX: LED + driver, RX: photodiode + TIA + optics)
- ✅ Development environment configured
- ✅ Git repository initialized
- ✅ API keys obtained

### Resources Needed
- Budget: ₹3,000-5,000 for hardware
- VLC components:
  - High-power white/blue LED (TX) with constant-current driver
  - Photodiode or PIN diode (RX) with transimpedance amplifier
  - Optical lenses/diffusers and light baffles to improve SNR
  - Heatsink + small fan for LED thermal management
- Google Maps API key (free tier)
- TomTom API key (free tier)

---

## Week 2-3: IoT Device Development

### Tasks
- [ ] Assemble car model with sensors
- [ ] Write firmware for ESP32 (sensor reading)
- [ ] Implement VLC telemetry link with MQTT payloads
- [ ] Test VLC line-of-sight data transmission
- [ ] Set up MQTT broker (local/cloud)

### Deliverables
- ✅ Working ESP32 with all sensors connected
- ✅ Firmware reading sensor data accurately
- ✅ VLC link + MQTT payload communication established
- ✅ JSON payload structure defined

### Code Components
```
firmware/
├── esp32_sensor_mqtt/
│   ├── esp32_sensor_mqtt.ino
│   ├── config.h
│   └── sensors.h
```

### Testing Criteria
- Sensors read data every 5 seconds
- MQTT messages published successfully
- VLC link re-syncs within 2 seconds after occlusion
- Battery life > 2 hours on Li-ion

---

## Week 3-4: Data Collection & Integration

### Tasks
- [ ] Collect real sensor data from car model
- [ ] Create data logging system
- [ ] Store data in database (time-series)
- [ ] Validate data quality and consistency

### Deliverables
- ✅ Backend service receiving MQTT data
- ✅ Database schema designed
- ✅ 7+ days of continuous sensor data collected
- ✅ Data visualization dashboard (basic)

### Code Components
```
backend/
├── services/
│   ├── mqtt_handler.py
│   └── data_logger.py
├── database/
│   └── schema.sql
```

### Database Schema
```sql
CREATE TABLE sensor_readings (
    id SERIAL PRIMARY KEY,
    device_id VARCHAR(50),
    timestamp TIMESTAMP,
    voltage FLOAT,
    current FLOAT,
    temperature FLOAT,
    latitude FLOAT,
    longitude FLOAT,
    speed FLOAT
);
```

---

## Week 5-6: Battery Health Module

### Tasks
- [ ] Implement data preprocessing (from IoT device)
- [ ] Train SoH prediction model
- [ ] Validate model accuracy (>85%)
- [ ] Create API endpoint for battery health

### Deliverables
- ✅ Trained Random Forest/LSTM model
- ✅ Model accuracy > 85%
- ✅ API endpoint: `/api/battery/health`
- ✅ Real-time SoH prediction

### ML Pipeline
```python
# Features
- Voltage (V)
- Current (A)
- Temperature (°C)
- Charging cycles
- Age (days)

# Target
- State of Health (%)

# Model
- Random Forest Regressor / LSTM
```

### API Response
```json
{
  "device_id": "EV_001",
  "soh": 87.5,
  "soc": 75.2,
  "degradation_rate": 0.05,
  "estimated_capacity": 35.0
}
```

---

## Week 7-8: Energy Prediction Module

### Tasks
- [ ] Feature engineering (speed, elevation, etc.)
- [ ] Train consumption prediction model using real data
- [ ] Test with Indian driving patterns
- [ ] Optimize model performance

### Deliverables
- ✅ Energy prediction model (error < 10%)
- ✅ API endpoint: `/api/energy/predict`
- ✅ Support for multiple route scenarios

### Features Engineering
```python
# Input Features
- Distance (km)
- Elevation gain (m)
- Average speed (km/h)
- Traffic density (0-1)
- AC usage (boolean)
- Road type (highway/city)
- Weather conditions

# Output
- Energy consumption (kWh)
```

### Model Training
```python
# Dataset
- 1000+ route samples
- Mix of highway/city driving
- Indian road conditions

# Algorithm
- Gradient Boosting / Neural Network
- Cross-validation (k=5)
- RMSE < 2 kWh
```

---

## Week 9-10: Traffic Integration

### Tasks
- [ ] Integrate traffic APIs
- [ ] Real-time data fetching
- [ ] Traffic impact analysis
- [ ] Route scoring algorithm

### Deliverables
- ✅ Google Maps API integration
- ✅ Traffic data caching (Redis)
- ✅ Traffic impact on energy model
- ✅ API endpoint: `/api/traffic/status`

### Integration Points
```python
# Google Maps Directions API
- Fetch multiple route alternatives
- Get real-time traffic data
- Calculate distance and duration

# Traffic Score
Score = (base_time / actual_time) × 100
- 100: No traffic
- 50-80: Moderate
- <50: Heavy congestion
```

---

## Week 11-12: Integration & Routing

### Tasks
- [ ] Combine all modules (IoT + ML + Traffic)
- [ ] Implement routing algorithm
- [ ] Feasibility checker
- [ ] Recommendation engine

### Deliverables
- ✅ End-to-end route recommendation system
- ✅ API endpoint: `/api/route/recommend`
- ✅ Battery feasibility analysis
- ✅ Ranked route alternatives

### Routing Algorithm
```python
def recommend_route(current_location, destination, battery_soc):
    # 1. Fetch routes from Google Maps
    routes = maps_api.get_routes(current_location, destination)
    
    # 2. For each route
    for route in routes:
        # Get traffic data
        traffic = get_traffic_data(route)
        
        # Predict energy consumption
        energy = ml_model.predict_energy(route, traffic)
        
        # Check feasibility
        available_energy = battery_soc * battery_capacity
        is_feasible = (available_energy - energy) > safety_margin
        
        # Calculate score
        score = calculate_score(energy, traffic, time, feasibility)
        
    # 3. Rank and return
    return sorted_routes_by_score
```

### Route Score Formula
```
Score = 0.4 × EnergyEfficiency + 
        0.3 × TimeSaved + 
        0.2 × TrafficScore + 
        0.1 × BatterySafety
```

---

## Week 13-14: UI Development

### Tasks
- [ ] Design dashboard with live IoT data
- [ ] Map integration
- [ ] Real-time visualization (sensor graphs)
- [ ] Mobile responsiveness

### Deliverables
- ✅ React/Flutter web app
- ✅ Real-time battery dashboard
- ✅ Interactive map with routes
- ✅ Mobile-friendly interface

### UI Components
```
Dashboard:
├── Battery Status Card
│   ├── SoC gauge
│   ├── SoH indicator
│   └── Voltage/Current graphs
├── Map View
│   ├── Current location marker
│   ├── Route alternatives
│   └── Charging stations
├── Route Recommendations
│   ├── Energy estimates
│   ├── Time estimates
│   └── Traffic alerts
└── Settings
    ├── Device selection
    └── Preferences
```

### Frontend Stack
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "leaflet": "^1.9.4",
    "chart.js": "^4.4.0",
    "react-chartjs-2": "^5.2.0",
    "axios": "^1.6.0",
    "socket.io-client": "^4.6.0"
  }
}
```

---

## Week 15-16: Testing & Deployment

### Tasks
- [ ] End-to-end testing
- [ ] Performance optimization
- [ ] Documentation
- [ ] Deployment

### Deliverables
- ✅ All unit tests passing (>80% coverage)
- ✅ Integration tests complete
- ✅ Performance benchmarks met
- ✅ Deployed to cloud (AWS/Azure/GCP)
- ✅ Complete documentation

### Testing Checklist
- [ ] **Unit Tests**
  - ML model accuracy tests
  - API endpoint tests
  - Database query tests
  
- [ ] **Integration Tests**
  - IoT → Backend → Database flow
  - API → ML model → Response
  - Frontend → Backend integration
  
- [ ] **Performance Tests**
  - API response time < 2s
  - MQTT message latency < 500ms
  - Dashboard load time < 3s
  
- [ ] **User Acceptance Tests**
  - Route recommendation accuracy
  - Battery feasibility correctness
  - Real-time data updates

### Deployment Steps
```bash
# 1. Containerize
docker build -t ev-backend ./backend
docker build -t ev-frontend ./frontend

# 2. Push to registry
docker push username/ev-backend:latest
docker push username/ev-frontend:latest

# 3. Deploy to cloud
kubectl apply -f k8s/deployment.yaml

# 4. Configure DNS and SSL
# 5. Set up monitoring (Prometheus/Grafana)
```

---

## 📊 Progress Tracking

| Week | Module | Status | Completion % |
|------|--------|--------|--------------|
| 1-2  | Setup & Procurement | 🔲 Not Started | 0% |
| 2-3  | IoT Development | 🔲 Not Started | 0% |
| 3-4  | Data Collection | 🔲 Not Started | 0% |
| 5-6  | Battery Health ML | 🔲 Not Started | 0% |
| 7-8  | Energy Prediction ML | 🔲 Not Started | 0% |
| 9-10 | Traffic Integration | 🔲 Not Started | 0% |
| 11-12| Routing Engine | 🔲 Not Started | 0% |
| 13-14| UI Development | 🔲 Not Started | 0% |
| 15-16| Testing & Deploy | 🔲 Not Started | 0% |

---

## 🎯 Milestones

| Milestone | Target Date | Description |
|-----------|-------------|-------------|
| **M1: Hardware Ready** | Week 3 | IoT device collecting data |
| **M2: Data Pipeline** | Week 4 | Backend storing sensor data |
| **M3: ML Models Trained** | Week 8 | Both models achieving targets |
| **M4: API Complete** | Week 12 | All endpoints functional |
| **M5: MVP Launch** | Week 14 | Working demo with UI |
| **M6: Production** | Week 16 | Deployed and tested |

---

## 🚧 Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Hardware delays | High | Order components early, have backup suppliers |
| API rate limits | Medium | Cache aggressively, use free tiers wisely |
| ML model accuracy | High | Collect diverse dataset, try multiple algorithms |
| Time overrun | Medium | Prioritize core features, defer nice-to-haves |
| Budget constraints | Low | Use free cloud tiers, open-source tools |

---

## 📚 Learning Resources

### Week-by-Week Tutorials
- **Weeks 1-3**: ESP32 + MQTT (Random Nerd Tutorials)
- **Weeks 5-6**: ML with Scikit-learn (Coursera)
- **Weeks 7-8**: Deep Learning for Regression (TensorFlow docs)
- **Weeks 9-10**: Google Maps API (Official docs)
- **Weeks 13-14**: React Dashboard (FreeCodeCamp)

---

## ✅ Definition of Done

Each module is complete when:
1. ✅ Code is written and committed
2. ✅ Unit tests pass (>80% coverage)
3. ✅ Integration tested with other modules
4. ✅ Documentation updated
5. ✅ Peer reviewed (if applicable)
6. ✅ Performance benchmarks met

---

**Ready to start? Begin with Week 1-2 tasks!** 🚀
