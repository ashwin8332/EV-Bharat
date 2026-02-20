#!/usr/bin/env python3
"""Test script to check model loading issues"""

import pickle
import sys
from pathlib import Path

# Add current directory to path
current_dir = Path(__file__).parent
sys.path.append(str(current_dir))

def test_model_loading():
    """Test loading each model file individually"""
    
    models_dir = current_dir / "ML" / "battery_models"
    
    model_files = [
        "SOC_model.pkl",
        "SOH_model.pkl", 
        "RUL_model.pkl",
        "RUL_scaler.pkl",
        "battery_intelligence.pkl",
        "model_config.pkl"
    ]
    
    for filename in model_files:
        filepath = models_dir / filename
        if filepath.exists():
            try:
                print(f"Testing {filename}...")
                with open(filepath, 'rb') as f:
                    model = pickle.load(f)
                print(f"✅ {filename} loaded successfully - Type: {type(model)}")
                
                # Check if it's a scikit-learn model
                if hasattr(model, 'predict'):
                    print(f"   - Has predict method")
                if hasattr(model, 'transform'):
                    print(f"   - Has transform method")
                    
            except Exception as e:
                print(f"❌ Error loading {filename}: {e}")
                print(f"   Error type: {type(e)}")
        else:
            print(f"⚠️  {filename} not found")
        print()

if __name__ == "__main__":
    print("🔋 Testing Model Loading")
    print("=" * 30)
    test_model_loading()