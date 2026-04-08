#!/usr/bin/env python3
"""
FastAPI Backend Integration for Battery ML System
This script creates a production-ready API server that integrates with the frontend.
"""

import os
import sys
import uvicorn
from pathlib import Path
from starlette.middleware.wsgi import WSGIMiddleware

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.append(str(backend_dir))

def setup_ml_backend():
    """Set up and run the ML backend server"""
    
    # Check if models exist
    models_dir = backend_dir / "ML" / "battery_models"
    if not models_dir.exists():
        print("⚠️  ML models directory not found!")
        print("🔧 Please run the Jupyter notebook first to train and save models:")
        print("   1. Open: backend/ML/battery_analytics_system.ipynb")
        print("   2. Run all cells to train models")
        print("   3. Models will be saved to backend/ML/battery_models/")
        return False
    
    # Check for required model files
    required_files = [
        "SOC_model.pkl",
        "SOH_model.pkl", 
        "RUL_model.pkl",
        "RUL_scaler.pkl",
        "battery_intelligence.pkl",
        "battery_api.py"
    ]
    
    missing_files = []
    for file in required_files:
        if not (models_dir / file).exists():
            missing_files.append(file)
    
    if missing_files:
        print(f"⚠️  Missing model files: {', '.join(missing_files)}")
        print("🔧 Run the complete Jupyter notebook to generate all required files.")
        return False
    
    print("✅ All ML model files found!")
    return True

def run_backend():
    """Run the FastAPI backend server"""
    
    if not setup_ml_backend():
        return
    
    # Import and run battery + drowsiness APIs
    models_dir = backend_dir / "ML" / "battery_models"
    drowsiness_dir = backend_dir / "ML" / "drowziness"
    sys.path.insert(0, str(models_dir))
    sys.path.insert(0, str(drowsiness_dir))

    ml_port_raw = os.getenv("ML_BACKEND_PORT", "8000")
    try:
        ml_port = int(ml_port_raw)
    except ValueError:
        print(f"⚠️  Invalid ML_BACKEND_PORT='{ml_port_raw}', defaulting to 8000")
        ml_port = 8000

    try:
        import importlib.util

        # Load battery API first; this is required.
        spec_battery = importlib.util.spec_from_file_location("battery_api", models_dir / "battery_api.py")
        battery_api_module = importlib.util.module_from_spec(spec_battery)
        spec_battery.loader.exec_module(battery_api_module)

        app = battery_api_module.app

        # Load drowsiness Flask app and mount under /drowsiness.
        spec_drowsiness = importlib.util.spec_from_file_location("web_server", drowsiness_dir / "web_server.py")
        drowsiness_api_module = importlib.util.module_from_spec(spec_drowsiness)
        spec_drowsiness.loader.exec_module(drowsiness_api_module)

        camera_started = False
        try:
            camera_started = bool(drowsiness_api_module.camera.start())
        except Exception as camera_error:
            print("⚠️  Drowsiness camera could not start:")
            print(f"   {camera_error}")
            print("   Drowsiness status endpoints are still available.")

        app.mount("/drowsiness", WSGIMiddleware(drowsiness_api_module.app))

        print("🚀 Starting Combined ML API Server...")
        print("📊 Battery ML models loaded successfully")
        print("👁️  Drowsiness backend mounted at /drowsiness")
        print(f"📷 Drowsiness camera: {'running' if camera_started else 'not running'}")
        if not camera_started:
            camera_error = getattr(drowsiness_api_module.camera, "camera_error", "Camera unavailable")
            print(f"   Reason: {camera_error}")
        print(f"🌐 API base: http://localhost:{ml_port}")
        print(f"🧪 Battery health: http://localhost:{ml_port}/health")
        print(f"🧪 Drowsiness status: http://localhost:{ml_port}/drowsiness/status")

        uvicorn.run(
            app,
            host="0.0.0.0",
            port=ml_port,
            reload=False,
            log_level="info"
        )

    except ImportError as e:
        print("❌ Failed to import one of the backend modules:")
        print(f"   Error: {e}")
        print("🔧 Install missing dependencies from backend requirements files.")
    except Exception as e:
        print(f"❌ Error starting server: {e}")

if __name__ == "__main__":
    print("🔋 EVBharat Battery ML Backend")
    print("=" * 40)
    run_backend()