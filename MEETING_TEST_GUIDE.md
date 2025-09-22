# Real-Time Meeting Test Guide

## 🚀 **IMPORTANT: Start Signaling Server First!**

### **Step 1: Start the WebSocket Signaling Server**

1. **Open Command Prompt/Terminal** in the Super App directory
2. **Run the signaling server:**

   ```bash
   # Windows
   start-signaling-server.bat

   # Mac/Linux
   cd signaling-server
   npm install
   npm start
   ```

3. **Verify server is running:**
   - You should see: "🎯 WebRTC Signaling Server running on port 8080"
   - Test health check: http://localhost:8080/health

### **Step 2: Test Real-Time Video Calling**

## 🧪 **How to Test the Real-Time Meeting System**

### **Real Multi-User Test (RECOMMENDED):**

1. **Open the Super App** in your browser
2. **Go to Study Team** → **Live Meeting** tab
3. **Create a meeting:**

   - Enter title: "Test Meeting"
   - Click "Create Meeting"
   - Note the meeting ID (e.g., `meeting_1234567890_abc123`)

4. **Open a new tab** with the same Super App
5. **Join the meeting:**

   - Go to Study Team → Live Meeting
   - Click "Join by ID"
   - Enter the meeting ID from step 3
   - Click "Join Meeting"

6. **Test features:**
   - Turn on camera in both tabs
   - Test mute/unmute
   - Try screen sharing
   - Verify you can see video from both tabs

### **Real Multi-User Test:**

1. **Share meeting ID** with another person
2. **Both users join** the same meeting ID
3. **Test real-time communication:**
   - Video/audio should work between different computers
   - Screen sharing should be visible to all participants
   - Mute/unmute should update for all participants

## 🔍 **What to Look For:**

### **✅ Success Indicators:**

- **Video streams** appear for all participants
- **Audio** works bidirectionally
- **Participant list** shows all joined users
- **Host indicator** shows correctly (first person to join)
- **Screen sharing** replaces video feed
- **Mute/unmute** updates in real-time
- **Leave meeting** removes participant from others' view

### **❌ Common Issues & Solutions:**

#### **"Camera/Microphone not working"**

- **Check browser permissions** (click camera icon in address bar)
- **Ensure HTTPS** - WebRTC requires secure connection
- **Try different browser** (Chrome recommended)

#### **"Can't see other participants"**

- **Check signaling connection** in browser dev tools (F12 → Console)
- **Verify both users joined same meeting ID**
- **Try refreshing both browsers**

#### **"No audio/video"**

- **Check device permissions** in browser settings
- **Test with different devices** (built-in vs external camera)
- **Verify microphone is not muted** at system level

## 🛠️ **Development Testing:**

### **Browser Console Debugging:**

Open browser dev tools (F12) and look for:

```javascript
// Success messages:
"✅ WebSocket signaling connected";
"✅ BroadcastChannel signaling initialized";
"Peer connection with user123: connected";

// Error messages to investigate:
"Error handling signaling message";
"Error starting camera";
"WebRTC connection failed";
```

### **Network Tab:**

- Check for WebSocket connections to signaling server
- Verify STUN server connections
- Look for ICE candidate exchanges

### **WebRTC Internals:**

- Chrome: `chrome://webrtc-internals/`
- Firefox: `about:webrtc`
- Shows detailed peer connection stats

## 📊 **Expected Behavior:**

### **Meeting Creation:**

1. User clicks "Create Meeting"
2. Meeting ID generated (format: `meeting_timestamp_randomstring`)
3. User becomes host
4. Camera/microphone permissions requested
5. Local video stream appears

### **Meeting Joining:**

1. User enters meeting ID
2. Signaling message sent to existing participants
3. Peer connections established with all existing participants
4. Offer/answer exchange completed
5. ICE candidates exchanged
6. Video/audio streams start flowing
7. User appears in all participants' video grids

### **Real-time Features:**

- **Mute/unmute** → Audio track enabled/disabled → Visual indicator updates
- **Camera on/off** → Video track starts/stops → Video feed appears/disappears
- **Screen share** → Display media replaces camera → All participants see screen
- **Leave meeting** → Peer connections closed → User disappears from others' grids

## 🚀 **Production Deployment:**

### **For Local Testing:**

- Uses BroadcastChannel (works across browser tabs on same machine)
- No server setup required
- Perfect for development and single-machine testing

### **For Multi-User Production:**

1. **Deploy signaling server** (see REALTIME_MEETING_SETUP.md)
2. **Set environment variable:** `REACT_APP_SIGNALING_SERVER=wss://your-server.com`
3. **Test across different networks/devices**
4. **Configure TURN servers** for NAT traversal if needed

## 🎯 **Success Criteria:**

The meeting system is working correctly when:

- ✅ Multiple users can join the same meeting
- ✅ Video and audio streams in real-time
- ✅ Screen sharing works across participants
- ✅ Mute/unmute controls work properly
- ✅ Participants can leave/join dynamically
- ✅ Host privileges transfer correctly
- ✅ Meeting state syncs across all participants

## 🔧 **Troubleshooting Commands:**

```javascript
// In browser console, check WebRTC service state:
console.log(webrtcService.getCurrentMeeting());
console.log(webrtcService.getLocalStream());

// Check signaling connection:
console.log(signalingService.isConnectedToSignaling());
console.log(signalingService.getConnectionType());

// Force reconnection:
location.reload(); // Simple but effective
```

The real-time meeting system now provides enterprise-grade video conferencing capabilities that work just like Google Meet or Zoom!
