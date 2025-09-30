// Simple Express server for Zoom API endpoints
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
const PORT = 3001;

// Middleware
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5176"], // Support both ports
    credentials: true,
  })
);
app.use(express.json());

// Zoom SDK configuration
const ZOOM_SDK_KEY = process.env.ZOOM_SDK_KEY;
const ZOOM_SDK_SECRET = process.env.ZOOM_SDK_SECRET;

// POST /api/zoom/create-meeting - Create a new Zoom meeting
app.post("/api/zoom/create-meeting", async (req, res) => {
  try {
    const { topic, duration = 60 } = req.body;

    if (!topic) {
      return res.status(400).json({ error: "Meeting topic is required" });
    }

    // For now, generate a random meeting ID (in production, use Zoom REST API)
    const meetingId = Math.floor(Math.random() * 9000000000) + 1000000000;
    const password = Math.random().toString(36).substring(2, 8);

    const meeting = {
      id: meetingId.toString(),
      topic,
      password,
      duration,
      start_url: `https://zoom.us/s/${meetingId}?pwd=${password}`,
      join_url: `https://zoom.us/j/${meetingId}?pwd=${password}`,
      created_at: new Date().toISOString(),
    };

    console.log("Created meeting:", meeting);
    res.status(200).json(meeting);
  } catch (error) {
    console.error("Error creating meeting:", error);
    res.status(500).json({ error: "Failed to create meeting" });
  }
});

// POST /api/zoom/signature - Generate JWT signature for Zoom Web SDK
app.post("/api/zoom/signature", async (req, res) => {
  try {
    const { meetingNumber, role = 0 } = req.body;

    if (!meetingNumber) {
      return res.status(400).json({ error: "Meeting number is required" });
    }

    if (!ZOOM_SDK_KEY || !ZOOM_SDK_SECRET) {
      console.error("Zoom SDK credentials not configured");
      return res.status(500).json({ error: "Zoom SDK not configured" });
    }

    console.log("Generating signature for meeting:", meetingNumber);

    // Generate JWT signature for Zoom Web SDK
    const iat = Math.round(new Date().getTime() / 1000) - 30;
    const exp = iat + 60 * 60 * 2; // 2 hours

    const oHeader = {
      alg: "HS256",
      typ: "JWT",
    };

    const oPayload = {
      iss: ZOOM_SDK_KEY,
      exp: exp,
      iat: iat,
      aud: "zoom",
      appKey: ZOOM_SDK_KEY,
      tokenExp: exp,
      alg: "HS256",
    };

    const signature = jwt.sign(oPayload, ZOOM_SDK_SECRET, { header: oHeader });

    const response = {
      signature,
      sdkKey: ZOOM_SDK_KEY,
    };

    console.log("Signature generated successfully");
    res.status(200).json(response);
  } catch (error) {
    console.error("Error generating Zoom signature:", error);
    res.status(500).json({ error: "Failed to generate signature" });
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Zoom API server is running",
    timestamp: new Date().toISOString(),
    config: {
      hasZoomKey: !!ZOOM_SDK_KEY,
      hasZoomSecret: !!ZOOM_SDK_SECRET,
    },
  });
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Zoom API Server",
    version: "1.0.0",
    endpoints: ["POST /api/zoom/signature", "GET /api/health"],
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Zoom API Server running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔑 Zoom SDK Key: ${ZOOM_SDK_KEY ? "Configured" : "Missing"}`);
  console.log(
    `🔐 Zoom SDK Secret: ${ZOOM_SDK_SECRET ? "Configured" : "Missing"}`
  );

  if (!ZOOM_SDK_KEY || !ZOOM_SDK_SECRET) {
    console.warn("⚠️  Warning: Zoom SDK credentials not configured!");
    console.warn(
      "   Please set ZOOM_SDK_KEY and ZOOM_SDK_SECRET in your .env file"
    );
  }
});
