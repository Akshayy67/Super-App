import Vapi from "@vapi-ai/web";

// Check if VAPI token is available
const vapiToken =
  import.meta.env.VITE_VAPI_WEB_TOKEN || process.env.VITE_VAPI_WEB_TOKEN;

if (!vapiToken) {
  console.warn(
    "VAPI Web Token not found. Please set VITE_VAPI_WEB_TOKEN in your .env file"
  );
}

// Initialize VAPI with error handling
let vapi: Vapi;

try {
  if (vapiToken) {
    vapi = new Vapi(vapiToken);
    console.log("VAPI SDK initialized successfully");
  } else {
    // Create a mock VAPI instance for development
    vapi = new Vapi("mock-token-for-development");
    console.warn(
      "Using mock VAPI instance. Real interviews will not work without proper configuration."
    );
  }
} catch (error) {
  console.error("Failed to initialize VAPI SDK:", error);
  // Create a fallback instance
  vapi = new Vapi("fallback-token");
}

export { vapi };

// Helper function to check if VAPI is properly configured
export const isVapiConfigured = () => {
  return !!vapiToken && vapiToken !== "mock-token-for-development";
};

// Helper function to check browser compatibility
export const checkBrowserCompatibility = () => {
  const issues: string[] = [];

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    issues.push("Microphone access not supported in this browser");
  }

  if (!window.RTCPeerConnection) {
    issues.push("WebRTC not supported in this browser");
  }

  if (!navigator.clipboard) {
    issues.push("Clipboard API not supported in this browser");
  }

  return issues;
};

// Interviewer configuration with proper types
export const interviewer = {
  name: "Interviewer",
  firstMessage:
    "Hello! Thank you for taking the time to speak with me today. I'm excited to learn more about you and your experience.",
  transcriber: {
    provider: "deepgram" as const,
    model: "nova-2",
    language: "en" as const,
  },
  voice: {
    provider: "11labs" as const,
    voiceId: "sarah",
    stability: 0.4,
    similarityBoost: 0.8,
    speed: 0.9,
    style: 0.5,
    useSpeakerBoost: true,
  },
  model: {
    provider: "openai" as const,
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: `You are a professional job interviewer conducting a real-time voice interview with a candidate. Your goal is to assess their qualifications, motivation, and fit for the role.

Interview Guidelines:
Follow the structured question flow:
{{questions}}

Engage naturally & react appropriately:
Listen actively to responses and acknowledge them before moving forward.
Ask brief follow-up questions if a response is vague or requires more detail.
Keep the conversation flowing smoothly while maintaining control.
Be professional, yet warm and welcoming:

Use official yet friendly language.
Keep responses concise and to the point (like in a real voice interview).
Avoid robotic phrasing—sound natural and conversational.
Answer the candidate's questions professionally:

If asked about the role, company, or expectations, provide a clear and relevant answer.
If unsure, redirect the candidate to HR for more details.

Conclude the interview properly:
Thank the candidate for their time.
Inform them that the company will reach out soon with feedback.
End the conversation on a polite and positive note.

- Be sure to be professional and polite.
- Keep all your responses short and simple. Use official language, but be kind and welcoming.
- This is a voice conversation, so keep your responses short, like in a real conversation. Don't ramble for too long.`,
      },
    ],
  },
};
