#!/bin/bash
# Start TravelSensei Python Flask Backend

echo "🐍 Starting TravelSensei Python Flask Backend..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python -m venv venv
fi

# Activate virtual environment
echo "🔌 Activating virtual environment..."
source venv/bin/activate

# Install dependencies if requirements.txt is newer than last install
if [ requirements.txt -nt venv/pyvenv.cfg ] || [ ! -f "venv/installed.txt" ]; then
    echo "📚 Installing dependencies..."
    pip install -r requirements.txt
    touch venv/installed.txt
fi

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo "⚙️ Creating .env file..."
    cp .env.example .env
    echo "🔧 Please edit .env file with your API keys and configuration"
fi

# Start the server
echo "🚀 Starting Flask server..."
python app.py