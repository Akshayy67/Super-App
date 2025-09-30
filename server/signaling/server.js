// Enhanced WebSocket signaling server for WebRTC
// Features: Meeting management, participant tracking, connection monitoring
// Usage:
//   npm install ws
//   node server.js
//
// Set PORT via env if needed. Defaults to 8080.

const WebSocket = require("ws");

const PORT = process.env.PORT || 8081;

// meetings: Map<meetingId, { participants: Map<participantId, ws>, createdAt: Date, settings: {} }>
const meetings = new Map();

// Connection tracking
const connections = new Map(); // ws -> { meetingId, participantId, connectedAt }

// Statistics
let totalConnections = 0;
let totalMeetings = 0;

function getOrCreateMeeting(meetingId) {
  if (!meetings.has(meetingId)) {
    totalMeetings++;
    meetings.set(meetingId, {
      participants: new Map(),
      createdAt: new Date(),
      settings: {
        allowScreenShare: true,
        allowChat: true,
        maxParticipants: 50,
      },
    });
    console.log(
      `[signaling] Created new meeting: ${meetingId} (Total: ${totalMeetings})`
    );
  }
  return meetings.get(meetingId);
}

function removeClient(ws) {
  const connectionInfo = connections.get(ws);
  if (!connectionInfo) return;

  const { meetingId, participantId } = connectionInfo;
  connections.delete(ws);

  const meeting = meetings.get(meetingId);
  if (!meeting) return;

  meeting.participants.delete(participantId);
  console.log(
    `[signaling] Removed participant ${participantId} from meeting ${meetingId}`
  );

  // Cleanup empty meeting
  if (meeting.participants.size === 0) {
    meetings.delete(meetingId);
    console.log(`[signaling] Deleted empty meeting: ${meetingId}`);
  }
}

// Get server statistics
function getServerStats() {
  const activeMeetings = meetings.size;
  const totalParticipants = Array.from(meetings.values()).reduce(
    (sum, meeting) => sum + meeting.participants.size,
    0
  );

  return {
    activeMeetings,
    totalParticipants,
    totalConnections,
    totalMeetings,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  };
}

const wss = new WebSocket.Server({ port: PORT }, () => {
  console.log(`[signaling] WebSocket server listening on ws://0.0.0.0:${PORT}`);
});

wss.on("connection", (ws) => {
  totalConnections++;
  console.log(
    `[signaling] Client connected (Total connections: ${totalConnections})`
  );

  ws.on("message", (raw) => {
    try {
      const message = JSON.parse(raw.toString());
      const { type, meetingId, fromParticipant, toParticipant, data } = message;

      // Track the meeting and participant for this socket
      if (meetingId && fromParticipant) {
        ws.meetingId = meetingId;
        ws.participantId = fromParticipant;
        const meeting = getOrCreateMeeting(meetingId);
        meeting.participants.set(fromParticipant, ws);

        // Track connection info
        connections.set(ws, {
          meetingId,
          participantId: fromParticipant,
          connectedAt: new Date(),
        });
      }

      // Respond to ping
      if (type === "ping") {
        const resp = {
          type: "pong",
          meetingId: meetingId || "system",
          fromParticipant: "server",
          timestamp: new Date().toISOString(),
        };
        try {
          ws.send(JSON.stringify(resp));
        } catch {}
        return;
      }

      // Handle server stats request
      if (type === "server-stats") {
        const stats = getServerStats();
        const resp = {
          type: "server-stats-response",
          meetingId: "system",
          fromParticipant: "server",
          data: stats,
          timestamp: new Date().toISOString(),
        };
        try {
          ws.send(JSON.stringify(resp));
        } catch {}
        return;
      }

      // When a client joins, send them the list of existing participants
      if (type === "join-meeting" && meetingId && fromParticipant) {
        const meeting = getOrCreateMeeting(meetingId);
        const existing = Array.from(meeting.participants.keys())
          .filter((pid) => pid !== fromParticipant)
          .map((pid) => ({ participantId: pid, participantName: pid }));

        const response = {
          type: "meeting-participants",
          meetingId,
          fromParticipant: "server",
          toParticipant: fromParticipant,
          data: { participants: existing },
          timestamp: new Date().toISOString(),
        };
        try {
          ws.send(JSON.stringify(response));
        } catch {}
        // Also inform others someone joined (optional)
        broadcastExcept(meetingId, fromParticipant, {
          type: "participant-joined",
          meetingId,
          fromParticipant,
          data: {
            participantId: fromParticipant,
            participantName: fromParticipant,
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Route messages
      if (meetingId) {
        if (toParticipant) {
          // Targeted delivery
          const meeting = getOrCreateMeeting(meetingId);
          const target = meeting.participants.get(toParticipant);
          if (target && target.readyState === WebSocket.OPEN) {
            target.send(raw.toString());
          }
        } else {
          // Broadcast to other participants in the meeting
          broadcastExcept(meetingId, fromParticipant, raw.toString());
        }
      }
    } catch (err) {
      console.error("[signaling] Error handling message:", err);
    }
  });

  ws.on("close", () => {
    console.log("[signaling] Client disconnected");
    const { meetingId, participantId } = ws;
    if (meetingId && participantId) {
      removeClient(ws);
      // Notify others
      broadcastExcept(
        meetingId,
        participantId,
        JSON.stringify({
          type: "participant-left",
          meetingId,
          fromParticipant: participantId,
          data: { participantId },
          timestamp: new Date().toISOString(),
        })
      );
    }
  });

  ws.on("error", (err) => {
    console.error("[signaling] Socket error:", err);
  });
});

function broadcastExcept(meetingId, exceptParticipantId, payload) {
  const meeting = meetings.get(meetingId);
  if (!meeting) return;
  const msg = typeof payload === "string" ? payload : JSON.stringify(payload);
  meeting.participants.forEach((client, pid) => {
    if (pid === exceptParticipantId) return;
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(msg);
      } catch {}
    }
  });
}

process.on("SIGINT", () => {
  console.log("\n[signaling] Shutting down...");
  wss.close(() => process.exit(0));
});
