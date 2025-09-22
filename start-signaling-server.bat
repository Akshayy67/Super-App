@echo off
echo 🚀 Starting WebRTC Signaling Server...
echo.

cd signaling-server

echo 📦 Installing dependencies...
call npm install

echo.
echo 🎯 Starting server on port 3001...
echo 📡 WebSocket endpoint: ws://localhost:3001
echo 🌐 Health check: http://localhost:3001/health
echo.
echo Press Ctrl+C to stop the server
echo.

call npm start
