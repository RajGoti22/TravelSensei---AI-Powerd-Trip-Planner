@echo off
REM Start TravelSensei Python Flask Backend (Windows)

echo 🐍 Starting TravelSensei Python Flask Backend...

REM Check if virtual environment exists
if not exist "venv" (
    echo 📦 Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo 🔌 Activating virtual environment...
call venv\Scripts\activate.bat

REM Install dependencies
echo 📚 Installing dependencies...
pip install -r requirements.txt

REM Create .env if it doesn't exist
if not exist ".env" (
    echo ⚙️ Creating .env file...
    copy .env.example .env
    echo 🔧 Please edit .env file with your API keys and configuration
)

REM Start the server
echo 🚀 Starting Flask server...
python app.py

pause