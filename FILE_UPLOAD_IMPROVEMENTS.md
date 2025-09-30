# File Upload & WebSocket Improvements

## ✅ Changes Made

### 1. Increased File Size Limit to 15MB
- **Maximum file size**: Increased from 50MB to **15MB** as requested
- **Google Drive threshold**: Lowered from 5MB to **1MB** for better performance
- **Firestore limit**: Remains at 750KB for small files
- **Files between 750KB-1MB**: Automatically use Google Drive storage
- **Files 1MB-15MB**: Use Google Drive storage with enhanced error handling

### 2. Fixed WebSocket Connection Issues
- **Improved fallback**: BroadcastChannel is now the primary signaling method
- **WebSocket enhancement**: WebSocket server is now optional for enhanced features
- **Better error handling**: Reduced error spam in console
- **Graceful degradation**: App works fully even without WebSocket server

### 3. Enhanced PowerPoint File Support
- **Better corruption detection**: Improved detection of corrupted .ppt/.pptx files
- **15MB support**: PowerPoint files up to 15MB are now supported
- **Enhanced error messages**: Better feedback for file upload issues
- **Office Online integration**: Improved Office Online viewer links

## 🚀 How to Start the WebSocket Server (Optional)

The WebSocket signaling server is **optional** - your app works fully without it using BroadcastChannel for local meetings.

### Option 1: Using the Node.js script
```bash
node start-signaling.js
```

### Option 2: Manual start
```bash
cd signaling-server
npm install
npm start
```

### Option 3: Using the batch file (Windows)
```bash
start-signaling-server.bat
```

## 📊 File Size Handling

| File Size | Storage Method | Notes |
|-----------|----------------|-------|
| < 750KB | Firestore | Fast access, embedded in database |
| 750KB - 1MB | Google Drive | Requires Google Drive connection |
| 1MB - 15MB | Google Drive | Enhanced error handling |
| > 15MB | Rejected | Clear error message to user |

## 🔧 WebSocket Status

- **Without WebSocket**: Local meetings work via BroadcastChannel
- **With WebSocket**: Enhanced features for multi-device meetings
- **Fallback**: Automatic fallback to BroadcastChannel if WebSocket fails

## 🎯 User Experience Improvements

1. **Faster uploads**: Smaller files use Firestore for instant access
2. **Better error messages**: Clear feedback for file size and corruption issues
3. **Seamless fallback**: No interruption if WebSocket server is unavailable
4. **Enhanced PowerPoint support**: Better handling of presentation files
5. **15MB limit**: Supports larger documents as requested

## 🐛 Console Log Improvements

- Reduced WebSocket error spam
- Better file upload progress logging
- Clearer corruption detection messages
- Enhanced debugging information for file processing
