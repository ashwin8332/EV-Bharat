#!/bin/bash

# EVBharat RAG Backend Startup Script

echo "🚀 Starting EVBharat RAG Backend..."
RAG_PORT="${RAG_BACKEND_PORT:-9000}"

# Navigate to the EVBharat Bot directory
cd "$(dirname "$0")"

# Check if virtual environment exists, create if it doesn't
if [ ! -d "venv" ]; then
    echo "📦 Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install/upgrade dependencies
echo "📋 Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Create data directory if it doesn't exist
echo "📁 Creating data directory..."
mkdir -p data

# Set environment variables if .env file exists
if [ -f ".env" ]; then
    echo "🔐 Loading environment variables from .env file..."
    export $(cat .env | grep -v '^#' | xargs)
else
    echo "⚠️ Warning: .env file not found. Make sure to set your API keys manually."
fi

# Start the FastAPI server
echo "🌐 Starting RAG API server on http://localhost:${RAG_PORT}..."
echo "📖 API documentation will be available at http://localhost:${RAG_PORT}/docs"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

uvicorn rag_api:app --host 0.0.0.0 --port "${RAG_PORT}" --reload