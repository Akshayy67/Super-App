// Signaling service for WebRTC communication
// In production, this should use Socket.IO or WebSocket server

export interface SignalingMessage {
  type:
    | "offer"
    | "answer"
    | "ice-candidate"
    | "participant-joined"
    | "participant-left"
    | "chat-message"
    | "join-meeting"
    | "meeting-participants";
  meetingId: string;
  fromParticipant: string;
  toParticipant?: string;
  data?: any;
  timestamp: Date;
}

export type SignalingEventListener = (message: SignalingMessage) => void;

class SignalingService {
  private listeners: SignalingEventListener[] = [];
  private broadcastChannel: BroadcastChannel | null = null;
  private websocket: WebSocket | null = null;
  private isConnected = false;
  private retryCount = 0;
  private maxRetries = 5;

  // Simple meeting state for BroadcastChannel fallback
  private meetingParticipants = new Map<string, Set<string>>();

  constructor() {
    this.initializeSignaling();
  }

  private initializeSignaling() {
    // Try WebSocket first (for production)
    if (this.tryWebSocketConnection()) {
      return;
    }

    // Fallback to BroadcastChannel for local development
    this.initializeBroadcastChannel();
  }

  private tryWebSocketConnection(): boolean {
    try {
      // Try multiple WebSocket services in order of preference
      const wsUrls = [
        process.env.REACT_APP_SIGNALING_SERVER,
        "ws://localhost:3001", // Local signaling server
        "ws://localhost:8080", // Fallback local port
        // Note: For production, deploy your signaling server to Railway, Render, or Heroku
      ].filter(Boolean);

      if (wsUrls.length === 0) {
        console.log("⚠️ No WebSocket URLs configured, using BroadcastChannel");
        return false;
      }

      const wsUrl = wsUrls[0];
      console.log("🔄 Attempting WebSocket connection to:", wsUrl);

      this.websocket = new WebSocket(wsUrl);

      // Set a connection timeout
      const connectionTimeout = setTimeout(() => {
        if (
          this.websocket &&
          this.websocket.readyState === WebSocket.CONNECTING
        ) {
          console.log("⏰ WebSocket connection timeout, closing...");
          this.websocket.close();
          this.websocket = null;
          this.isConnected = false;
        }
      }, 5000); // 5 second timeout

      this.websocket.onopen = () => {
        clearTimeout(connectionTimeout);
        console.log("✅ WebSocket signaling connected to:", wsUrl);
        this.isConnected = true;

        // Send a ping to verify connection
        this.sendMessage({
          type: "ping" as any,
          meetingId: "system",
          fromParticipant: "client",
          data: { timestamp: Date.now() },
        });
      };

      this.websocket.onmessage = (event) => {
        try {
          const message: SignalingMessage = JSON.parse(event.data);
          console.log("📨 Received signaling message:", message.type);

          // Handle pong responses
          if (message.type === ("pong" as any)) {
            console.log("🏓 Received pong from server");
            return;
          }

          this.handleIncomingMessage(message);
        } catch (error) {
          console.error("❌ Failed to parse signaling message:", error);
        }
      };

      this.websocket.onclose = (event) => {
        clearTimeout(connectionTimeout);
        console.log(
          "❌ WebSocket signaling disconnected:",
          event.code,
          event.reason
        );
        this.isConnected = false;
        this.websocket = null;

        // Only retry if it wasn't a manual close
        if (event.code !== 1000) {
          // Retry connection after 3 seconds with exponential backoff
          const retryDelay = Math.min(
            3000 * Math.pow(2, this.retryCount),
            30000
          );
          console.log(
            `🔄 Retrying WebSocket connection in ${retryDelay}ms (attempt ${
              this.retryCount + 1
            })`
          );

          setTimeout(() => {
            this.retryCount++;
            if (this.retryCount <= 5 && !this.tryWebSocketConnection()) {
              console.log("🔄 WebSocket retry failed, using BroadcastChannel");
              this.initializeBroadcastChannel();
            } else if (this.retryCount > 5) {
              console.log(
                "❌ Max WebSocket retry attempts reached, using BroadcastChannel"
              );
              this.initializeBroadcastChannel();
            }
          }, retryDelay);
        } else {
          // Manual close, fallback to BroadcastChannel
          this.initializeBroadcastChannel();
        }
      };

      this.websocket.onerror = (error) => {
        clearTimeout(connectionTimeout);
        console.error("❌ WebSocket signaling error:", error);
        this.websocket = null;
        this.isConnected = false;
        return false;
      };

      return true;
    } catch (error) {
      console.log(
        "❌ WebSocket not available, using BroadcastChannel fallback:",
        error
      );
      return false;
    }
  }

  private initializeBroadcastChannel() {
    try {
      // Reset retry count when falling back to BroadcastChannel
      this.retryCount = 0;

      this.broadcastChannel = new BroadcastChannel("webrtc-signaling");
      this.broadcastChannel.addEventListener("message", (event) => {
        try {
          this.handleIncomingMessage(event.data);
        } catch (error) {
          console.error("❌ Error handling BroadcastChannel message:", error);
        }
      });

      this.broadcastChannel.addEventListener("messageerror", (event) => {
        console.error("❌ BroadcastChannel message error:", event);
      });

      console.log("✅ BroadcastChannel signaling initialized");
      this.isConnected = true;
    } catch (error) {
      console.error("❌ Failed to initialize BroadcastChannel:", error);
      this.isConnected = false;
    }
  }

  private handleIncomingMessage(message: SignalingMessage) {
    // Handle join-meeting requests for BroadcastChannel fallback
    if (message.type === "join-meeting" && this.broadcastChannel) {
      this.handleJoinMeetingRequest(message);
    }

    // Always notify listeners
    this.notifyListeners(message);
  }

  private handleJoinMeetingRequest(message: SignalingMessage) {
    const { meetingId, fromParticipant, data } = message;

    console.log(
      `🔄 [BroadcastChannel] Processing join-meeting request from ${
        data?.participantName || fromParticipant
      }`
    );

    // Get existing participants for this meeting
    if (!this.meetingParticipants.has(meetingId)) {
      this.meetingParticipants.set(meetingId, new Set());
    }

    const participants = this.meetingParticipants.get(meetingId)!;
    const existingParticipants = Array.from(participants).map(
      (participantId) => ({
        participantId,
        participantName: participantId, // In real implementation, store names
      })
    );

    // Add the new participant
    participants.add(fromParticipant);

    console.log(
      `📋 [BroadcastChannel] Sending existing participants (${existingParticipants.length}) to ${data?.participantName}`
    );
    console.log(
      `💡 [BroadcastChannel] Meeting ${meetingId} now has ${participants.size} participants`
    );

    // Send existing participants to the joining user
    // Use a small delay to ensure the WebRTC service is ready to handle the response
    setTimeout(() => {
      const responseMessage: SignalingMessage = {
        type: "meeting-participants",
        meetingId,
        fromParticipant: "server",
        toParticipant: fromParticipant,
        data: { participants: existingParticipants },
        timestamp: new Date(),
      };

      console.log(
        `📤 [BroadcastChannel] Sending meeting-participants response to ${data?.participantName}`
      );
      this.notifyListeners(responseMessage);
    }, 100);
  }

  private notifyListeners(message: SignalingMessage) {
    this.listeners.forEach((listener) => {
      try {
        listener(message);
      } catch (error) {
        console.error("Error in signaling listener:", error);
      }
    });
  }

  // Public methods
  addEventListener(listener: SignalingEventListener): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  sendMessage(message: Omit<SignalingMessage, "timestamp">): void {
    if (!this.isConnected) {
      console.warn("Signaling not connected, message not sent");
      return;
    }

    const fullMessage: SignalingMessage = {
      ...message,
      timestamp: new Date(),
    };

    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify(fullMessage));
    } else if (this.broadcastChannel) {
      this.broadcastChannel.postMessage(fullMessage);
    }
  }

  // Convenience methods
  sendOffer(
    meetingId: string,
    toParticipant: string,
    fromParticipant: string,
    offer: RTCSessionDescriptionInit
  ) {
    this.sendMessage({
      type: "offer",
      meetingId,
      fromParticipant,
      toParticipant,
      data: offer,
    });
  }

  sendAnswer(
    meetingId: string,
    toParticipant: string,
    fromParticipant: string,
    answer: RTCSessionDescriptionInit
  ) {
    this.sendMessage({
      type: "answer",
      meetingId,
      fromParticipant,
      toParticipant,
      data: answer,
    });
  }

  sendIceCandidate(
    meetingId: string,
    toParticipant: string,
    fromParticipant: string,
    candidate: RTCIceCandidate
  ) {
    this.sendMessage({
      type: "ice-candidate",
      meetingId,
      fromParticipant,
      toParticipant,
      data: candidate,
    });
  }

  broadcastParticipantJoined(
    meetingId: string,
    fromParticipant: string,
    participantData: any
  ) {
    this.sendMessage({
      type: "participant-joined",
      meetingId,
      fromParticipant,
      data: participantData,
    });
  }

  broadcastParticipantLeft(meetingId: string, fromParticipant: string) {
    // Remove from local meeting state
    if (this.meetingParticipants.has(meetingId)) {
      this.meetingParticipants.get(meetingId)!.delete(fromParticipant);

      // Clean up empty meetings
      if (this.meetingParticipants.get(meetingId)!.size === 0) {
        this.meetingParticipants.delete(meetingId);
      }
    }

    this.sendMessage({
      type: "participant-left",
      meetingId,
      fromParticipant,
      data: { participantId: fromParticipant },
    });
  }

  sendChatMessage(meetingId: string, fromParticipant: string, message: string) {
    this.sendMessage({
      type: "chat-message",
      meetingId,
      fromParticipant,
      data: { message, senderName: fromParticipant },
    });
  }

  isConnectedToSignaling(): boolean {
    return this.isConnected;
  }

  getConnectionType(): "websocket" | "broadcast" | "none" {
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      return "websocket";
    } else if (this.broadcastChannel) {
      return "broadcast";
    }
    return "none";
  }

  // Cleanup
  destroy() {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }

    if (this.broadcastChannel) {
      this.broadcastChannel.close();
      this.broadcastChannel = null;
    }

    this.listeners = [];
    this.isConnected = false;
  }
}

export const signalingService = new SignalingService();

// Production WebSocket Server Setup Instructions:
/*
To set up a production WebSocket signaling server, create a Node.js server:

1. Install dependencies:
   npm install ws express cors

2. Create server.js:
   ```javascript
   const WebSocket = require('ws');
   const express = require('express');
   const cors = require('cors');

   const app = express();
   app.use(cors());

   const server = require('http').createServer(app);
   const wss = new WebSocket.Server({ server });

   const meetings = new Map();

   wss.on('connection', (ws) => {
     console.log('Client connected');

     ws.on('message', (data) => {
       try {
         const message = JSON.parse(data);
         const { meetingId, toParticipant } = message;

         // Store client in meeting
         if (!meetings.has(meetingId)) {
           meetings.set(meetingId, new Set());
         }
         meetings.get(meetingId).add(ws);

         // Forward message to specific participant or broadcast
         if (toParticipant) {
           // Send to specific participant (implement participant tracking)
           ws.send(data);
         } else {
           // Broadcast to all participants in meeting
           meetings.get(meetingId).forEach(client => {
             if (client !== ws && client.readyState === WebSocket.OPEN) {
               client.send(data);
             }
           });
         }
       } catch (error) {
         console.error('Error handling message:', error);
       }
     });

     ws.on('close', () => {
       console.log('Client disconnected');
       // Remove from all meetings
       meetings.forEach(participants => participants.delete(ws));
     });
   });

   const PORT = process.env.PORT || 8080;
   server.listen(PORT, () => {
     console.log(`Signaling server running on port ${PORT}`);
   });
   ```

3. Set environment variable:
   REACT_APP_SIGNALING_SERVER=ws://your-server.com:8080

4. Deploy to Heroku, Railway, or your preferred platform
*/
