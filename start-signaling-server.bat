@echo off
echo 🚀 Starting WebRTC Signaling Server...
echo.

cd signaling-server

echo 📦 Installing dependencies...
call npm install

echo.
echo 🎯 Starting server on port 8080...
echo 📡 WebSocket endpoint: ws://localhost:8080
echo 🌐 Health check: http://localhost:8080/health
echo.
echo Press Ctrl+C to stop the server
echo.

call npm start
