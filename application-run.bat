@echo off
REM Navigate to the script's directory
cd /d "%~dp0"

REM Run the Python script in a new window (so the BAT file can continue)
start "" cmd /c python main.py

REM Wait 2 seconds to ensure the server starts (adjust delay if needed)
timeout /t 5 >nul

REM Open the browser to localhost (replace 5000 with your app's port)
start "" "http://localhost:5000"
