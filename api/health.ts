// Health check endpoint (GET /api/health)
// Provides non-sensitive diagnostics to help debug 500 errors.
export default async function handler(req: any, res: any) {
  if (req.method && req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  res.status(200).json({
    ok: true,
    time: new Date().toISOString(),
    env: {
      GOOGLE_AI_API_KEY: !!process.env.GOOGLE_AI_API_KEY,
      GEMINI_MODEL: !!process.env.GEMINI_MODEL,
    },
  });
}
