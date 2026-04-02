"""
🧠 Driver Drowsiness Detection - OPENCV ONLY VERSION
Ultra-simple version using only OpenCV built-in features
NO external dependencies needed!
"""

import cv2
import numpy as np
from scipy.spatial import distance
import os
import subprocess
import threading
import time

print("\n✅ OpenCV Version:", cv2.__version__)

ALERT_MESSAGE = "You are drowsy. Stop the car and take rest and be hydrated."
ALERT_COOLDOWN_SECONDS = 8
_last_alert_time = 0.0


def _play_alarm_and_voice():
    """Play an alarm tone and speak the warning message."""
    try:
        import winsound

        winsound.Beep(1200, 400)
        winsound.Beep(900, 400)
        winsound.Beep(1200, 400)
    except Exception:
        pass

    try:
        escaped = ALERT_MESSAGE.replace("'", "''")
        ps_cmd = (
            "Add-Type -AssemblyName System.Speech; "
            "$s = New-Object System.Speech.Synthesis.SpeechSynthesizer; "
            "$s.Rate = -1; "
            f"$s.Speak('{escaped}')"
        )
        subprocess.run(
            ["powershell", "-NoProfile", "-Command", ps_cmd],
            check=False,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
    except Exception:
        pass


def trigger_alert_if_needed():
    """Trigger alarm+voice with cooldown to avoid repeated spam."""
    global _last_alert_time
    now = time.time()
    if now - _last_alert_time < ALERT_COOLDOWN_SECONDS:
        return
    _last_alert_time = now
    threading.Thread(target=_play_alarm_and_voice, daemon=True).start()


def _load_cascade(possible_files):
    """Load the first available Haar cascade file from OpenCV data path."""
    for filename in possible_files:
        full_path = os.path.join(cv2.data.haarcascades, filename)
        cascade = cv2.CascadeClassifier(full_path)
        if not cascade.empty():
            return cascade, full_path
    return None, None

# ============================================================================
# 👁️ EYE ASPECT RATIO (EAR)
# ============================================================================

def eye_aspect_ratio(eye):
    """Calculate Eye Aspect Ratio"""
    A = distance.euclidean(eye[1], eye[5])
    B = distance.euclidean(eye[2], eye[4])
    C = distance.euclidean(eye[0], eye[3])
    ear = (A + B) / (2.0 * C)
    return ear


# ============================================================================
# 🎥 SIMPLE DROWSINESS DETECTION - BLINK-BASED
# ============================================================================

def detect_drowsiness_simple():
    """
    Simple drowsiness detection using eye blink frequency
    """
    print("\n" + "="*70)
    print("🚗 SIMPLE DROWSINESS DETECTION - STARTING")
    print("="*70)
    
    # Load cascade classifiers (built-in with OpenCV)
    face_cascade, face_cascade_path = _load_cascade([
        'haarcascade_frontalface_default.xml',
        'haarcascade_frontalface_alt.xml',
        'haarcascade_frontalface_alt2.xml',
    ])
    eye_cascade, eye_cascade_path = _load_cascade([
        'haarcascade_eye_tree_eyeglasses.xml',
        'haarcascade_eye.xml',
    ])

    if face_cascade is None:
        print("❌ Face cascade not found in OpenCV data directory")
        print(f"   Expected under: {cv2.data.haarcascades}")
        return

    if eye_cascade is None:
        print("❌ Eye cascade not found in OpenCV data directory")
        print(f"   Expected under: {cv2.data.haarcascades}")
        return

    print("✅ Cascade classifiers loaded")
    print(f"   Face: {face_cascade_path}")
    print(f"   Eye : {eye_cascade_path}")
    
    # Video capture
    cap = cv2.VideoCapture(0)
    
    if not cap.isOpened():
        print("❌ Cannot open webcam")
        return
    
    print("✅ Webcam opened")
    print("\nPress 'q' or ESC to stop\n")
    
    # Parameters
    blink_count = 0
    frame_count = 0
    eyes_closed_count = 0
    drowsy_threshold = 15  # Consecutive frames with eyes closed
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        
        frame = cv2.resize(frame, (640, 480))
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        
        frame_count += 1
        
        # Detect faces
        faces = face_cascade.detectMultiScale(gray, 1.3, 5)
        
        if len(faces) > 0:
            for (x, y, w, h) in faces:
                # Draw face rectangle
                cv2.rectangle(frame, (x, y), (x+w, y+h), (255, 0, 0), 2)
                
                # ROI for eyes detection
                roi_gray = gray[y:y+h, x:x+w]
                roi_color = frame[y:y+h, x:x+w]
                
                # Detect eyes
                eyes = eye_cascade.detectMultiScale(roi_gray)
                
                if len(eyes) >= 2:
                    # Eyes are open
                    eyes_closed_count = 0
                    cv2.putText(frame, "Eyes: OPEN", (10, 40),
                              cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
                else:
                    # Eyes are closed or not detected
                    eyes_closed_count += 1
                    
                    if eyes_closed_count > drowsy_threshold:
                        cv2.putText(frame, "DROWSY ALERT!", (x+10, y-20),
                                  cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 3)
                        cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 0, 255), 3)
                        trigger_alert_if_needed()
                    else:
                        cv2.putText(frame, f"Eyes: CLOSED ({eyes_closed_count})", 
                                  (10, 40), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 165, 255), 2)
        
        # Display info
        cv2.putText(frame, f"Frame: {frame_count}", (10, 80),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
        cv2.putText(frame, "Press 'q' to exit", (10, 120),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
        
        # Show frame
        cv2.imshow("Drowsiness Detection", frame)
        
        # Check for exit
        key = cv2.waitKey(1) & 0xFF
        if key == ord('q') or key == 27:
            print("\n⏹️  Stopped by user")
            break
    
    cap.release()
    cv2.destroyAllWindows()
    
    print(f"\nTotal frames: {frame_count}")
    print("="*70 + "\n")


# ============================================================================
# 🧪 TEST DEPENDENCIES
# ============================================================================

def test_deps():
    """Test dependencies"""
    print("\n" + "="*70)
    print("🔍 TESTING DEPENDENCIES")
    print("="*70)
    
    try:
        import cv2
        print(f"✅ OpenCV {cv2.__version__}")
    except:
        print("❌ OpenCV not installed")
        return False
    
    try:
        import numpy
        print(f"✅ NumPy {numpy.__version__}")
    except:
        print("❌ NumPy not installed")
        return False
    
    try:
        import scipy
        print(f"✅ SciPy {scipy.__version__}")
    except:
        print("❌ SciPy not installed")
        return False
    
    print("="*70)
    return True


# ============================================================================
# 🚀 MAIN
# ============================================================================

if __name__ == "__main__":
    print("\n╔" + "="*68 + "╗")
    print("║" + " "*18 + "🧠 DROWSINESS DETECTION - SIMPLE" + " "*16 + "║")
    print("║" + " "*22 + "(OpenCV Only Version)" + " "*26 + "║")
    print("╚" + "="*68 + "╝")
    
    if test_deps():
        print("\n📋 OPTIONS:")
        print("  1. Start Detection")
        print("  2. Exit")
        
        choice = input("\nChoice (1-2): ").strip()
        
        if choice == '1':
            detect_drowsiness_simple()
        else:
            print("✅ Exiting")
    else:
        print("\n⚠️  Please install dependencies:")
        print("pip install opencv-python numpy scipy")
    
    print("\n" +"="*70 + "\n")
