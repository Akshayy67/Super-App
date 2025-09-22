const WebSocket = require("ws");
const express = require("express");
const cors = require("cors");
const http = require("http");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Store active meetings and participants
const meetings = new Map();
const participants = new Map(); // websocket -> participant info

console.log("🚀 WebRTC Signaling Server Starting...");

wss.on("connection", (ws) => {
  console.log("👤 New client connected");

  ws.on("message", (data) => {
    try {
      const message = JSON.parse(data.toString());
      console.log(
        "📨 Received message:",
        message.type,
        "for meeting:",
        message.meetingId
      );

      handleSignalingMessage(ws, message);
    } catch (error) {
      console.error("❌ Error parsing message:", error);
      ws.send(
        JSON.stringify({
          type: "error",
          message: "Invalid message format",
        })
      );
    }
  });

  ws.on("close", () => {
    console.log("👋 Client disconnected");
    handleClientDisconnect(ws);
  });

  ws.on("error", (error) => {
    console.error("🔥 WebSocket error:", error);
  });
});

function handleSignalingMessage(ws, message) {
  const { type, meetingId, fromParticipant, toParticipant, data } = message;

  switch (type) {
    case "join-meeting":
      handleJoinMeeting(ws, message);
      break;

    case "offer":
    case "answer":
    case "ice-candidate":
      forwardToParticipant(message);
      break;

    case "participant-joined":
    case "participant-left":
      broadcastToMeeting(meetingId, message, ws);
      break;

    default:
      console.log("🤷 Unknown message type:", type);
  }
}

function handleJoinMeeting(ws, message) {
  const { meetingId, fromParticipant, data } = message;

  // Store participant info
  participants.set(ws, {
    id: fromParticipant,
    meetingId: meetingId,
    name: data.participantName || "Unknown",
  });

  // Add to meeting
  if (!meetings.has(meetingId)) {
    meetings.set(meetingId, new Set());
  }
  meetings.get(meetingId).add(ws);

  console.log(`✅ ${data.participantName} joined meeting ${meetingId}`);

  // Notify existing participants about new participant
  broadcastToMeeting(
    meetingId,
    {
      type: "participant-joined",
      meetingId,
      fromParticipant,
      data: {
        participantId: fromParticipant,
        participantName: data.participantName,
        isHost: data.isHost || false,
      },
    },
    ws
  );

  // Send current participants list to new participant
  const currentParticipants = [];
  if (meetings.has(meetingId)) {
    meetings.get(meetingId).forEach((participantWs) => {
      if (participantWs !== ws && participants.has(participantWs)) {
        const participant = participants.get(participantWs);
        currentParticipants.push({
          participantId: participant.id,
          participantName: participant.name,
        });
      }
    });
  }

  ws.send(
    JSON.stringify({
      type: "meeting-participants",
      meetingId,
      data: { participants: currentParticipants },
    })
  );
}

function forwardToParticipant(message) {
  const { meetingId, toParticipant } = message;

  if (!meetings.has(meetingId)) {
    console.log("❌ Meeting not found:", meetingId);
    return;
  }

  // Find target participant
  let targetWs = null;
  meetings.get(meetingId).forEach((ws) => {
    const participant = participants.get(ws);
    if (participant && participant.id === toParticipant) {
      targetWs = ws;
    }
  });

  if (targetWs && targetWs.readyState === WebSocket.OPEN) {
    targetWs.send(JSON.stringify(message));
    console.log(`📤 Forwarded ${message.type} to ${toParticipant}`);
  } else {
    console.log(`❌ Participant ${toParticipant} not found or disconnected`);
  }
}

function broadcastToMeeting(meetingId, message, excludeWs = null) {
  if (!meetings.has(meetingId)) {
    console.log("❌ Meeting not found for broadcast:", meetingId);
    return;
  }

  let sentCount = 0;
  meetings.get(meetingId).forEach((ws) => {
    if (ws !== excludeWs && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
      sentCount++;
    }
  });

  console.log(
    `📢 Broadcasted ${message.type} to ${sentCount} participants in meeting ${meetingId}`
  );
}

function handleClientDisconnect(ws) {
  const participant = participants.get(ws);
  if (participant) {
    const { id, meetingId, name } = participant;

    // Remove from meeting
    if (meetings.has(meetingId)) {
      meetings.get(meetingId).delete(ws);

      // Notify other participants
      broadcastToMeeting(meetingId, {
        type: "participant-left",
        meetingId,
        fromParticipant: id,
        data: { participantId: id },
      });

      // Clean up empty meetings
      if (meetings.get(meetingId).size === 0) {
        meetings.delete(meetingId);
        console.log(`🗑️ Cleaned up empty meeting ${meetingId}`);
      }
    }

    participants.delete(ws);
    console.log(`👋 ${name} left meeting ${meetingId}`);
  }
}

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    activeMeetings: meetings.size,
    activeParticipants: participants.size,
    timestamp: new Date().toISOString(),
  });
});

// Get meeting info
app.get("/meeting/:meetingId", (req, res) => {
  const { meetingId } = req.params;
  const meeting = meetings.get(meetingId);

  if (!meeting) {
    return res.status(404).json({ error: "Meeting not found" });
  }

  const participantsList = [];
  meeting.forEach((ws) => {
    const participant = participants.get(ws);
    if (participant) {
      participantsList.push({
        id: participant.id,
        name: participant.name,
      });
    }
  });

  res.json({
    meetingId,
    participantCount: meeting.size,
    participants: participantsList,
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🎯 WebRTC Signaling Server running on port ${PORT}`);
  console.log(`📡 WebSocket endpoint: ws://localhost:${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("🛑 Shutting down signaling server...");
  server.close(() => {
    console.log("✅ Server shut down gracefully");
    process.exit(0);
  });
});
