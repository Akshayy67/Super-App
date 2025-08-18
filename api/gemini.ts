// Serverless function (Vercel) proxy for Google Gemini API
// Keeps the API key on the server side. Frontend should POST { prompt } here.
// Environment variables expected (set them in Vercel dashboard, NOT prefixed with VITE_):
//   GOOGLE_AI_API_KEY  (required)
// Optional: You can leave VITE_GOOGLE_AI_API_KEY undefined in production so the client uses this proxy.

interface GeminiRequestBody {
  prompt?: string;
  context?: string;
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    res
      .status(500)
      .json({ error: "Server misconfiguration: missing GOOGLE_AI_API_KEY" });
    return;
  }

  try {
    const body: GeminiRequestBody = req.body || {};
    const { prompt, context } = body;
    if (!prompt) {
      res.status(400).json({ error: "Missing prompt" });
      return;
    }

    const fullPrompt = context
      ? `Context: ${context}\n\nQuestion: ${prompt}\n\nPlease provide a helpful answer based on the context provided.`
      : prompt;

    const upstream = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: fullPrompt,
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await upstream.json();

    if (!upstream.ok) {
      res
        .status(upstream.status)
        .json({ error: "Upstream error", detail: data });
      return;
    }

    res.status(200).json(data);
  } catch (err: any) {
    res
      .status(500)
      .json({ error: "Gemini request failed", detail: err?.message });
  }
}
