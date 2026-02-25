# ESP32 Bluetooth Compilation Fix

## Problem
You're getting the error: `'BluetoothSerial' does not name a type`

## Solutions

### Solution 1: Enable Bluetooth in Arduino IDE ⭐ RECOMMENDED

1. **Select the correct ESP32 board**:
   - Go to **Tools** → **Board** → **ESP32 Arduino**
   - Select **"ESP32 Dev Module"** or **"ESP32-WROOM-DA Module"**
   - ❌ Avoid: ESP32-S2, ESP32-C3 (they don't support Bluetooth Classic)

2. **Update ESP32 Board Package**:
   - Go to **Tools** → **Board** → **Boards Manager**
   - Search for "esp32"
   - Install or update to version **2.0.0 or higher**

3. **Check Partition Scheme**:
   - Go to **Tools** → **Partition Scheme**
   - Select **"Huge APP (3MB No OTA/1MB SPIFFS)"** or **"Default 4MB with spiffs"**

4. **Verify Upload Settings**:
   ```
   Board: "ESP32 Dev Module"
   Upload Speed: "115200"
   CPU Frequency: "240MHz (WiFi/BT)"  ← Make sure this includes BT!
   Flash Frequency: "80MHz"
   Flash Mode: "QIO"
   Flash Size: "4MB (32Mb)"
   Partition Scheme: "Default 4MB with spiffs (1.2MB APP/1.5MB SPIFFS)"
   Core Debug Level: "None"
   ```

5. **Try uploading again**

### Solution 2: Use the Simple Version (No Web Control)

If Bluetooth Classic still doesn't work, use the simpler version:

1. Open **`esp32_simple.ino`** instead of `esp32.ino`
2. This version only uses **Dabble** (no BluetoothSerial)
3. Control with **Dabble mobile app** instead of web interface
4. Upload and it should compile without errors

### Solution 3: Check Your ESP32 Chip Type

**Bluetooth Classic is ONLY supported on original ESP32**

| Chip | Bluetooth Classic | BLE | Recommendation |
|------|-------------------|-----|----------------|
| ESP32 (original) | ✅ Yes | ✅ Yes | Use esp32.ino |
| ESP32-S2 | ❌ No | ❌ No | Use esp32_simple.ino (WiFi only) |
| ESP32-S3 | ❌ No | ✅ Yes | Need BLE version |
| ESP32-C3 | ❌ No | ✅ Yes | Need BLE version |

**To check your chip type:**
- Look at the chip markings on your board
- Or upload a simple sketch and check Serial output
- Or look at your board's product description

### Solution 4: Manual Library Installation

If the library isn't found:

1. Download BluetoothSerial:
   - It's included with ESP32 Arduino core
   - No separate download needed

2. Reinstall ESP32 board support:
   ```
   - Remove: C:\Users\Student\AppData\Local\Arduino15\packages\esp32
   - Open Arduino IDE → Boards Manager
   - Search "esp32" → Install "ESP32 by Espressif Systems"
   ```

## After Fixing Compilation

### Upload the Code
1. Connect ESP32 via USB
2. Select correct COM port: **Tools** → **Port**
3. Click **Upload** button
4. Wait for "Done uploading" message

### Test the Vehicle
1. Power on the ESP32
2. Download **Dabble app** on your phone
   - Android: [Play Store](https://play.google.com/store/apps/details?id=io.dabble)
   - iOS: [App Store](https://apps.apple.com/app/dabble/id1472734455)
3. Connect to "ESP32_V2E_CAR"
4. Use gamepad to control motors

### For Web Control (if using esp32.ino)
1. Make sure compilation succeeds
2. ESP32 will advertise as "ESP32_V2E_CAR"
3. Start the Bluetooth bridge:
   ```bash
   cd evbharat-frontend/evbharat-frontend/backend
   ./start_bluetooth_bridge.sh
   ```
4. Open web dashboard at http://localhost:5173/dashboard
5. Click "Connect" in Vehicle Control panel

## Still Having Issues?

### Error: "Bluetooth is not enabled"
- Your board doesn't support Bluetooth Classic
- Use **esp32_simple.ino** instead

### Error: "Multiple libraries found"
- This is just a warning, ignore it
- Arduino will use the correct one

### Error: "Compilation error: ..."
- Copy the full error message
- Check if it's related to `ledcAttach` (older ESP32 core uses `ledcSetup`)
- Update to ESP32 Arduino core 2.0.0+

### Motors not moving
- Check wiring connections
- Verify motor driver is powered
- Check pin numbers match your hardware
- Test with Serial Monitor to see commands

## Quick Test Code

Upload this to verify Bluetooth works:

```cpp
#include "BluetoothSerial.h"

BluetoothSerial SerialBT;

void setup() {
  Serial.begin(115200);
  SerialBT.begin("ESP32_TEST");
  Serial.println("Bluetooth Started");
}

void loop() {
  if (SerialBT.available()) {
    Serial.println(SerialBT.readString());
  }
  delay(100);
}
```

If this compiles and uploads successfully, then BluetoothSerial is working!

## Summary

✅ **Best Solution**: Update ESP32 Arduino core to 2.0.0+  
✅ **Quick Fix**: Use `esp32_simple.ino` (Dabble only)  
✅ **Check**: Make sure you have original ESP32, not S2/S3/C3  

Your ESP32 should now compile and work! 🎉
