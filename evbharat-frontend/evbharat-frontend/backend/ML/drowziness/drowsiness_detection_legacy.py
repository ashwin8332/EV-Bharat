"""
🧠 Driver Drowsiness Detection System
Legacy drowsiness detection using OpenCV + face_recognition facial landmarks.
For Python 3.12+ or easier setup, use drowsiness_detection_mediapipe.py.
Based on YouTube: Real Time Driver Drowsiness Detection System | OpenCV
"""

import os
import cv2
import numpy as np
from PIL import Image
import matplotlib.pyplot as plt
from scipy.spatial import distance
import warnings
import sys
import subprocess

warnings.filterwarnings('ignore')

# ============================================================================
# ⚙️ CONFIGURATION & ADVANCED SETTINGS
# ============================================================================

class AdvancedConfig:
    """Advanced configuration for tuning detection accuracy and performance."""
    # --- Core Thresholds ---
    EYE_AR_THRESH = 0.25           # Lower: more sensitive to blinks
    MOUTH_AR_THRESH = 0.6          # Lower: more sensitive to yawns
    DROWSY_SCORE_THRESHOLD = 5     # Frames to trigger a drowsy alert

    # --- Temporal Filtering (Reduces False Positives) ---
    CONSECUTIVE_BLINK_FRAMES = 2   # Number of consecutive frames eyes must be closed
    CONSECUTIVE_YAWN_FRAMES = 3    # Number of consecutive frames mouth must be open

    # --- Head Pose (Ensures Driver is Paying Attention) ---
    HEAD_POSE_ANGLE_THRESHOLD = 20 # Degrees (pitch/yaw) before flagging 'distracted'
    ENABLE_HEAD_POSE_CHECK = True  # Set to False to disable this check

    # --- Performance ---
    PROCESS_EVERY_N_FRAMES = 3     # Process every 3rd frame to save CPU
    PERFORMANCE_MODE = False       # If True, uses faster 'hog' model instead of 'cnn'

    # --- Alerting ---
    ALERT_COOLDOWN_SECONDS = 8     # Minimum seconds between audio alerts


# ============================================================================
# ⚠️ LAZY LOADER FOR FACE_RECOGNITION
# ============================================================================

def _load_face_recognition():
    """Safely import face_recognition, returning None if unavailable."""
    try:
        # Use __import__ to avoid static analysis warnings and add type: ignore
        fr_module = __import__('face_recognition') # type: ignore
        return fr_module
    except ImportError:
        return None

face_recognition = _load_face_recognition()


# ============================================================================
# 👁️ SECTION 1: EYE ASPECT RATIO (EAR) - Detects if eyes are closed
# ============================================================================

def eye_aspect_ratio(eye):
    """
    Calculate Eye Aspect Ratio (EAR)
    Eyes are considered closed if EAR is below the configured threshold.
    
    Formula: EAR = (||p2 - p6|| + ||p3 - p5||) / (2 * ||p1 - p4||)
    """
    A = distance.euclidean(eye[1], eye[5])  # Distance between eyelids
    B = distance.euclidean(eye[2], eye[4])  # Distance between eyelids
    C = distance.euclidean(eye[0], eye[3])  # Eye width
    
    # Avoid division by zero
    if C == 0:
        return 0.0
        
    ear = (A + B) / (2.0 * C)
    return ear


# ============================================================================
# 👄 SECTION 2: MOUTH ASPECT RATIO (MAR) - Detects if yawning
# ============================================================================

def mouth_aspect_ratio(mouth):
    """
    Calculate Mouth Aspect Ratio (MAR)
    Yawning is detected if MAR is above the configured threshold.
    
    Formula: MAR = (||p3 - p9|| + ||p5 - p7||) / (2 * ||p1 - p7||)
    """
    A = distance.euclidean(mouth[2], mouth[10])   # Vertical distance
    B = distance.euclidean(mouth[4], mouth[8])    # Vertical distance
    C = distance.euclidean(mouth[0], mouth[6])    # Horizontal distance (p1 to p7)

    # Avoid division by zero
    if C == 0:
        return 0.0
        
    mar = (A + B) / (2.0 * C)
    return mar


# ============================================================================
# 🧠 SECTION 3: HEAD POSE ESTIMATION
# ============================================================================

def get_head_pose(shape, frame_shape):
    """
    Estimates head pose (pitch, yaw, roll) from facial landmarks.
    Returns angles in degrees.
    """
    h, w = frame_shape
    
    # 2D image points from landmarks
    image_points = np.array([
        shape[30],    # Nose tip
        shape[8],     # Chin
        shape[36],    # Left eye left corner
        shape[45],    # Right eye right corner
        shape[48],    # Left Mouth corner
        shape[54]     # Right mouth corner
    ], dtype="double")
    
    # 3D model points
    model_points = np.array([
        (0.0, 0.0, 0.0),             # Nose tip
        (0.0, -330.0, -65.0),        # Chin
        (-225.0, 170.0, -135.0),     # Left eye left corner
        (225.0, 170.0, -135.0),      # Right eye right corner
        (-150.0, -150.0, -125.0),    # Left Mouth corner
        (150.0, -150.0, -125.0)      # Right mouth corner
    ])
    
    # Camera internals
    focal_length = w
    center = (w / 2, h / 2)
    camera_matrix = np.array(
        [[focal_length, 0, center[0]],
         [0, focal_length, center[1]],
         [0, 0, 1]], dtype="double"
    )
    
    dist_coeffs = np.zeros((4, 1))  # Assuming no lens distortion
    (success, rotation_vector, translation_vector) = cv2.solvePnP(
        model_points, image_points, camera_matrix, dist_coeffs, flags=cv2.SOLVEPNP_ITERATIVE
    )
    
    # Project 3D point (300, 0, 0) to image plane
    (nose_end_point2D, _) = cv2.projectPoints(
        np.array([(0.0, 0.0, 500.0)]), rotation_vector, translation_vector, camera_matrix, dist_coeffs
    )
    
    # Calculate Euler Angles
    rotation_matrix, _ = cv2.Rodrigues(rotation_vector)
    sy = np.sqrt(rotation_matrix[0, 0] * rotation_matrix[0, 0] + rotation_matrix[1, 0] * rotation_matrix[1, 0])
    
    singular = sy < 1e-6
    
    if not singular:
        x = np.arctan2(rotation_matrix[2, 1], rotation_matrix[2, 2])
        y = np.arctan2(-rotation_matrix[2, 0], sy)
        z = np.arctan2(rotation_matrix[1, 0], rotation_matrix[0, 0])
    else:
        x = np.arctan2(-rotation_matrix[1, 2], rotation_matrix[1, 1])
        y = np.arctan2(-rotation_matrix[2, 0], sy)
        z = 0
        
    # Convert to degrees
    pitch = np.rad2deg(x)
    yaw = np.rad2deg(y)
    roll = np.rad2deg(z)

    return pitch, yaw, roll, nose_end_point2D

    C = distance.euclidean(mouth[0], mouth[6])    # Mouth width
    
    mar = (A + B) / (2.0 * C)
    return mar


# ============================================================================
# 🧮 SECTION 3: PROCESS IMAGE FUNCTION - Main detection logic
# ============================================================================

def process_image(frame, config=None):
    """
    Process a single frame to detect drowsiness indicators.
    
    Returns:
        tuple: (eye_flag, mouth_flag, distracted_flag, landmarks)
    """
    if config is None:
        config = AdvancedConfig
        
    if face_recognition is None:
        return False, False, False, []

    # Determine model based on performance mode
    model = "hog" if config.PERFORMANCE_MODE else "cnn"
    
    # Find all face locations and landmarks
    face_locations = face_recognition.face_locations(frame, model=model)
    face_landmarks_list = face_recognition.face_landmarks(frame, face_locations)
    
    eye_flag = False
    mouth_flag = False
    distracted_flag = False
    all_landmarks = []

    for face_landmarks in face_landmarks_list:
        # Extract specific landmarks
        left_eye = face_landmarks['left_eye']
        right_eye = face_landmarks['right_eye']
        mouth = face_landmarks['mouth']
        
        # Calculate EAR
        left_ear = eye_aspect_ratio(left_eye)
        right_ear = eye_aspect_ratio(right_eye)
        ear = (left_ear + right_ear) / 2.0
        
        if ear < config.EYE_AR_THRESH:
            eye_flag = True
            
        # Calculate MAR
        mar = mouth_aspect_ratio(mouth)
        if mar > config.MOUTH_AR_THRESH:
            mouth_flag = True
            
        # Estimate head pose
        if config.ENABLE_HEAD_POSE_CHECK:
            # Convert landmarks to a flat list for pose estimation
            shape = []
            for part in face_landmarks.values():
                shape.extend(part)
            
            pitch, yaw, _, _ = get_head_pose(shape, frame.shape[:2])
            
            if abs(pitch) > config.HEAD_POSE_ANGLE_THRESHOLD or abs(yaw) > config.HEAD_POSE_ANGLE_THRESHOLD:
                distracted_flag = True

        all_landmarks.append(face_landmarks)
        
    return eye_flag, mouth_flag, distracted_flag, all_landmarks


# ============================================================================
# 👁️ SECTION 4: FACIAL LANDMARK VISUALIZATION (Optional)
# ============================================================================

def highlight_facial_points(image_path, save_path=None):
    """
    Visualize facial landmarks on image
    
    Args:
        image_path: Path to input image
        save_path: Optional path to save the annotated image
    """
    print(f"\n📸 Loading image: {image_path}")
    
    image_bgr = cv2.imread(image_path)
    if image_bgr is None:
        print(f"❌ Cannot load image from {image_path}")
        return
    
    image_rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)
    image_copy = image_rgb.copy()

    # Detect faces
    face_locations = face_recognition.face_locations(image_rgb)
    print(f"✅ Detected {len(face_locations)} face(s)")

    # Draw landmarks
    for face_location in face_locations:
        landmarks = face_recognition.face_landmarks(image_rgb, [face_location])[0]

        for feature_name, points in landmarks.items():
            for (x, y) in points:
                cv2.circle(image_copy, (x, y), 3, (0, 255, 0), -1)

    # Display
    plt.figure(figsize=(12, 8))
    plt.imshow(image_copy)
    plt.title("Facial Landmarks Detection")
    plt.axis('off')
    
    if save_path:
        # Save annotated image
        image_bgr_output = cv2.cvtColor(image_copy, cv2.COLOR_RGB2BGR)
        cv2.imwrite(save_path, image_bgr_output)
        print(f"✅ Annotated image saved to {save_path}")
    
    plt.show()


# ============================================================================
# 🎥 SECTION 5: REAL-TIME DROWSINESS DETECTION (Main Function)
# ============================================================================

def detect_drowsiness_video(video_source=0, use_webcam=True, config=None):
    """
    Real-time drowsiness detection from webcam or video file.
    """
    if config is None:
        config = AdvancedConfig
        
    if face_recognition is None:
        print("Legacy detector unavailable. Cannot proceed.")
        return

    # Initialize video capture
    video_cap = cv2.VideoCapture(video_source)
    if not video_cap.isOpened():
        print(f"❌ Error: Cannot open video source: {video_source}")
        return
    
    print(f"✅ Video source opened. Using '{'hog' if config.PERFORMANCE_MODE else 'cnn'}' model.")
    
    # State variables
    score = 0
    blink_counter = 0
    yawn_counter = 0
    
    while True:
        success, frame = video_cap.read()
        if not success:
            break
        
        frame = cv2.resize(frame, (800, 600))
        
        # Process every Nth frame for performance
        if video_cap.get(cv2.CAP_PROP_POS_FRAMES) % config.PROCESS_EVERY_N_FRAMES == 0:
            eye_flag, mouth_flag, distracted_flag, landmarks = process_image(frame, config)
            
            # --- Temporal Filtering for Blinks ---
            if eye_flag:
                blink_counter += 1
            else:
                blink_counter = 0
            
            is_blinking = blink_counter >= config.CONSECUTIVE_BLINK_FRAMES
            
            # --- Temporal Filtering for Yawns ---
            if mouth_flag:
                yawn_counter += 1
            else:
                yawn_counter = 0
            
            is_yawning = yawn_counter >= config.CONSECUTIVE_YAWN_FRAMES

            # --- Update Score ---
            if is_blinking or is_yawning or distracted_flag:
                score += 1
            else:
                score = max(0, score - 1)

            # --- UI & Alerts ---
            if distracted_flag:
                cv2.putText(frame, "DISTRACTED!", (10, 90), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)
            
            if score >= config.DROWSY_SCORE_THRESHOLD:
                cv2.putText(frame, "DROWSY DETECTED!", (frame.shape[1] - 300, 40),
                            cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 3)
                # Trigger alert (add sound logic here)
            
            # Draw landmarks for visualization
            for lms in landmarks:
                for part in lms.values():
                    for point in part:
                        cv2.circle(frame, point, 1, (0, 255, 0), -1)

        cv2.putText(frame, f"Score: {score}", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
        cv2.imshow("Drowsiness Detection", frame)
        
        if cv2.waitKey(1) & 0xFF in [ord('q'), 27]:
            break
            
    video_cap.release()
    cv2.destroyAllWindows()


# ============================================================================
# 🎯 SECTION 6: TEST FUNCTIONS - Validate installation
# ============================================================================

def test_dependencies():
    """Test if all required dependencies are installed"""
    print("\n" + "="*70)
    print("🔍 TESTING DEPENDENCIES")
    print("="*70)
    
    dependencies = {
        'cv2': 'OpenCV',
        'numpy': 'NumPy',
        'PIL': 'Pillow',
        'matplotlib': 'Matplotlib',
        'face_recognition': 'face_recognition',
        'scipy': 'SciPy'
    }
    
    all_installed = True
    
    for module, name in dependencies.items():
        try:
            __import__(module)
            print(f"✅ {name} - OK")
        except ImportError:
            print(f"❌ {name} - NOT INSTALLED")
            all_installed = False
    
    print("="*70)
    return all_installed


def test_face_detection(image_path):
    """Test face detection on a sample image"""
    print(f"\n🧪 Testing face detection on: {image_path}")
    
    if not os.path.exists(image_path):
        print(f"❌ Image not found: {image_path}")
        return False
    
    image_bgr = cv2.imread(image_path)
    image_rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)
    
    face_locations = face_recognition.face_locations(image_rgb)
    
    if len(face_locations) > 0:
        print(f"✅ Detected {len(face_locations)} face(s)")
        return True
    else:
        print("❌ No faces detected")
        return False


# ============================================================================
# 🚀 MAIN EXECUTION
# ============================================================================

if __name__ == "__main__":
    print("\n")
    print("╔" + "="*68 + "╗")
    print("║" + " "*15 + "🧠 DROWSINESS DETECTION SYSTEM 🧠" + " "*19 + "║")
    print("║" + " "*12 + "Real-Time Driver Drowsiness Detection" + " "*20 + "║")
    print("╚" + "="*68 + "╝")
    
    # Test dependencies
    deps_ok = test_dependencies()
    
    # Check if face_recognition is available
    face_recognition_available = face_recognition is not None
    
    # If face_recognition not available, auto-redirect to MediaPipe version
    if not face_recognition_available:
        print("\n" + "="*70)
        print("⚠️  LEGACY MODE UNAVAILABLE")
        print("="*70)
        print(f"Python Version: {sys.version.split()[0]}")
        print("\nℹ️  face_recognition + dlib are not available on Python 3.12+")
        
        # Check if MediaPipe is available
        try:
            import mediapipe
            print("✅ Switching to modern detector (MediaPipe)...\n")
            print("="*70 + "\n")
            
            # Run the MediaPipe detector as subprocess
            result = subprocess.run([sys.executable, 'drowsiness_detection_mediapipe.py'], 
                                  cwd=os.getcwd())
            sys.exit(result.returncode)
        except ImportError:
            print("❌ MediaPipe not installed")
            print("\n📦 To fix this, run:")
            print("   pip install -r requirements.txt")
            print("   python drowsiness_detection.py")
            sys.exit(1)
        except Exception as e:
            print(f"\n❌ Error launching MediaPipe detector: {e}")
            sys.exit(1)
    
    # Menu
    print("\n📋 CHOOSE AN OPTION:")
    print("  1. Use Webcam (Real-time)")
    print("  2. Use Video File")
    print("  3. Visualize Facial Landmarks (Image)")
    print("  4. Run All Tests")
    print("  5. Exit")
    
    choice = input("\nEnter your choice (1-5): ").strip()
    
    if choice == '1':
        # Webcam
        print("\n🎥 Starting webcam detection...")
        print("Make sure your face is visible in front of the camera")
        detect_drowsiness_video(video_source=0, use_webcam=True)
    
    elif choice == '2':
        # Video file
        video_path = input("Enter video file path (e.g., test.mp4): ").strip()
        if os.path.exists(video_path):
            detect_drowsiness_video(video_source=video_path, use_webcam=False)
        else:
            print(f"❌ Video file not found: {video_path}")
    
    elif choice == '3':
        # Facial landmarks
        image_path = input("Enter image file path (e.g., test.jpg): ").strip()
        if os.path.exists(image_path):
            save_path = input("Enter save path for annotated image (optional, press Enter to skip): ").strip()
            save_path = save_path if save_path else None
            highlight_facial_points(image_path, save_path)
        else:
            print(f"❌ Image file not found: {image_path}")
    
    elif choice == '4':
        # Run tests
        print("\n🧪 Running all tests...")
        
        # Test dependencies
        test_dependencies()
        
        # Look for sample images
        print("\n📸 Looking for test images...")
        test_images = []
        for file in os.listdir('.'):
            if file.lower().endswith(('.jpg', '.jpeg', '.png', '.bmp')):
                test_images.append(file)
        
        if test_images:
            print(f"Found test images: {test_images}")
            for img in test_images[:2]:  # Test first 2 images
                test_face_detection(img)
        else:
            print("⚠️  No test images found in current directory")
    
    else:
        print("✅ Exiting...")
    
    print("\n" + "="*70)
    print("Thank you for using Drowsiness Detection System!")
    print("="*70 + "\n")
