#!/usr/bin/env python3
"""
FastAPI Backend Integration for Battery ML System
This script creates a production-ready API server that integrates with the frontend.
"""

import os
import sys
import uvicorn
from pathlib import Path

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
        "soc_model.pkl",
        "soh_model.pkl", 
        "rul_model.pkl",
        "scaler.pkl",
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
    
    # Import and run the battery API
    models_dir = backend_dir / "ML" / "battery_models"
    sys.path.append(str(models_dir))
    
    try:
        # Import the battery API module
        from battery_api import app
        print("🚀 Starting Battery ML API Server...")
        print("📊 ML Models loaded successfully!")
        print("🌐 API will be available at: http://localhost:8000")
        print("📖 Interactive docs at: http://localhost:8000/docs")
        print("🔌 Frontend connection: Auto-detected")
        
        # Run the server
        uvicorn.run(
            app,
            host="0.0.0.0",
            port=8000,
            reload=True,
            log_level="info"
        )
        
    except ImportError as e:
        print("❌ Failed to import battery API:")
        print(f"   Error: {e}")
        print("🔧 Make sure the Jupyter notebook has been run completely.")
    except Exception as e:
        print(f"❌ Error starting server: {e}")

if __name__ == "__main__":
    print("🔋 EVBharat Battery ML Backend")
    print("=" * 40)
    run_backend()