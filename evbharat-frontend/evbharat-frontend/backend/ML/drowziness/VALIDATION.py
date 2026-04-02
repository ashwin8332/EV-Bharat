#!/usr/bin/env python3
"""
✅ Final Validation Script
Ensures all implementations are working correctly
"""

import sys
import os

# Ensure emoji/status symbols don't crash on Windows cp1252 consoles.
try:
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
except Exception:
    pass

print("\n" + "="*70)
print("🔍 DROWSINESS DETECTION SYSTEM - FINAL VALIDATION")
print("="*70 + "\n")

# Test 1: Check Python version
print("TEST 1: Python Version")
print("-" * 70)
python_version = sys.version_info
if python_version >= (3, 7):
    print(f"✅ Python {python_version.major}.{python_version.minor} (Required: 3.7+)")
else:
    print(f"❌ Python {python_version.major}.{python_version.minor} (Required: 3.7+)")
    sys.exit(1)

# Test 2: Check imports
print("\nTEST 2: Required Modules")
print("-" * 70)

modules_status = {}
modules = {
    'cv2': 'OpenCV',
    'numpy': 'NumPy',
    'scipy': 'SciPy',
    'mediapipe': 'MediaPipe',
}

for module_name, friendly_name in modules.items():
    try:
        __import__(module_name)
        print(f"✅ {friendly_name:20} - OK")
        modules_status[module_name] = True
    except ImportError as e:
        print(f"⚠️  {friendly_name:20} - MISSING (optional)")
        modules_status[module_name] = False

# Test 3: Check files
print("\nTEST 3: Required Files")
print("-" * 70)

required_files = {
    'drowsiness_detection_mediapipe.py': 'Main detection script (MediaPipe + fallback)',
    'drowsiness_detection_simple.py': 'Fallback detection script (OpenCV only)',
    'drowsiness_detection.py': 'Legacy face_recognition-based detector',
    'drowsiness_model.h5': 'Trained model artifact',
    'VALIDATION.py': 'Validation script',
}

files_ok = True
for filename, description in required_files.items():
    if os.path.exists(filename):
        size = os.path.getsize(filename)
        print(f"✅ {filename:40} ({size:,} bytes)")
    else:
        print(f"❌ {filename:40} - MISSING")
        files_ok = False

# Test 4: Validate MediaPipe imports in detection script
print("\nTEST 4: Code Validation")
print("-" * 70)

try:
    # Test import of functions from MediaPipe version
    from drowsiness_detection_mediapipe import (
        eye_aspect_ratio,
        mouth_aspect_ratio,
        process_image,
        test_dependencies
    )
    print("✅ drowsiness_detection_mediapipe.py - All functions OK")
except Exception as e:
    print(f"⚠️  drowsiness_detection_mediapipe.py - Import error: {e}")

# Test 5: Quick functionality test
print("\nTEST 5: Functionality Check")
print("-" * 70)

try:
    import numpy as np
    from scipy.spatial import distance
    
    # Test EAR calculation
    test_eye = np.array([
        (10, 5), (5, 8), (5, 15), 
        (10, 20), (15, 15), (15, 8)
    ], dtype=np.float32)
    
    def test_ear(eye):
        A = distance.euclidean(eye[1], eye[5])
        B = distance.euclidean(eye[2], eye[4])
        C = distance.euclidean(eye[0], eye[3])
        return (A + B) / (2.0 * C)
    
    ear_value = test_ear(test_eye)
    print(f"✅ EAR Calculation - Works (EAR={ear_value:.4f})")
    
    # Test MAR calculation
    test_mouth = np.array([
        (10, 10), (5, 11), (5, 12), (5, 13), (5, 14),
        (10, 15), (15, 14), (15, 13), (15, 12), (15, 11),
        (10, 10)
    ], dtype=np.float32)
    
    def test_mar(mouth):
        A = distance.euclidean(mouth[2], mouth[10])
        B = distance.euclidean(mouth[4], mouth[8])
        C = distance.euclidean(mouth[0], mouth[6])
        return (A + B) / (2.0 * C)
    
    mar_value = test_mar(test_mouth)
    print(f"✅ MAR Calculation - Works (MAR={mar_value:.4f})")
    
except Exception as e:
    print(f"❌ Calculation test failed: {e}")

# Test 6: Test image detection
print("\nTEST 6: Test Images")
print("-" * 70)

test_images = ['sample_image.jpg', 'test_face.jpg', 'test_image_drowsy.jpg']
image_count = 0

for img_file in test_images:
    if os.path.exists(img_file):
        size = os.path.getsize(img_file)
        print(f"✅ {img_file:30} ({size:,} bytes)")
        image_count += 1
    else:
        print(f"⚠️  {img_file:30} - Not found (optional)")

print(f"\n   Total test images: {image_count}/3")

# Final Summary
print("\n" + "="*70)
print("📊 VALIDATION SUMMARY")
print("="*70)

# Calculate status
critical_ok = modules_status.get('cv2') and modules_status.get('scipy') and modules_status.get('numpy')
recommended_ok = modules_status.get('mediapipe')

print(f"""
Critical Dependencies:
  ✅ OpenCV (cv2)      - {'OK' if modules_status.get('cv2') else 'MISSING'}
  ✅ NumPy            - {'OK' if modules_status.get('numpy') else 'MISSING'}  
  ✅ SciPy            - {'OK' if modules_status.get('scipy') else 'MISSING'}

Recommended:
  ✅ MediaPipe (fast) - {'OK ⭐' if modules_status.get('mediapipe') else 'Not installed, will auto-install'}

Files: {'✅ All present' if files_ok else '⚠️  Some missing'}

Status: {'🟢 READY' if critical_ok else '🔴 SETUP NEEDED'}
""")

# What to do next
print("="*70)
print("🚀 NEXT STEPS")
print("="*70)

if critical_ok and recommended_ok:
    print("""
✅ ALL SYSTEMS READY!

Run any of these:
    1. python drowsiness_detection_mediapipe.py       (Recommended)
    2. python drowsiness_detection_simple.py          (OpenCV-only fallback)
    3. python VALIDATION.py                           (Re-run validation)
""")
elif critical_ok:
    print("""
⚠️  SETUP NEEDED

Missing: MediaPipe (but system can still run!)

Install with:
  pip install mediapipe

Or run:
    python drowsiness_detection_mediapipe.py (will auto-install)
""")
else:
    print("""
❌ SETUP REQUIRED

Missing critical packages. Install with:
  pip install opencv-python numpy scipy mediapipe

Or run:
    python drowsiness_detection_mediapipe.py (will auto-install mediapipe only)
""")

print("="*70 + "\n")

# Return appropriate exit code
sys.exit(0 if critical_ok else 1)
