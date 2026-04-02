"""MediaPipe-first entrypoint.

The improved (more accurate) drowsiness logic lives in `drowsiness_detection.py`:
- short per-user calibration
- smoothing
- PERCLOS windowing
- prolonged eye-closure
- yawn duration

This file stays as a stable entrypoint for users and for `VALIDATION.py`.
"""

from __future__ import annotations

import os
import sys

# Re-export symbols expected by VALIDATION.py / users.
from drowsiness_detection import (  # noqa: F401
    DetectionConfig,
    detect_drowsiness_video,
    eye_aspect_ratio,
    mouth_aspect_ratio,
    process_image,
    test_dependencies,
)


def main() -> None:
    print("\n")
    print("╔" + "=" * 68 + "╗")
    print("║" + " " * 12 + "🧠 DROWSINESS DETECTION SYSTEM (MediaPipe)" + " " * 11 + "║")
    print("╚" + "=" * 68 + "╝")

    if not test_dependencies():
        print("\nMissing packages detected. Install with:")
        print(f"  {sys.executable} -m pip install -r requirements.txt")

    print("\n📋 CHOOSE AN OPTION:")
    print("  1. Use Webcam (Real-time)")
    print("  2. Use Video File")
    print("  3. Run Tests")
    print("  4. Exit")

    choice = input("\nEnter your choice (1-4): ").strip()

    if choice == "1":
        print("\n🎥 Starting webcam detection...")
        detect_drowsiness_video(video_source=0, use_webcam=True, backend="mediapipe")
    elif choice == "2":
        video_path = input("Enter video file path: ").strip()
        if os.path.exists(video_path):
            detect_drowsiness_video(video_source=video_path, use_webcam=False, backend="mediapipe")
        else:
            print(f"❌ Video not found: {video_path}")
    elif choice == "3":
        test_dependencies()
    else:
        print("✅ Exiting...")


if __name__ == "__main__":
    main()
