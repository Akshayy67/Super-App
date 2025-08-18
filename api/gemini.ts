// Serverless function (Vercel) proxy for Google Gemini API
// Keeps the API key on the server side. Frontend should POST { prompt } here.
// Environment variables expected (set them in Vercel dashboard, NOT prefixed with VITE_):
//   GOOGLE_AI_API_KEY  (required)
// Optional: You can leave VITE_GOOGLE_AI_API_KEY undefined in production so the client uses this proxy.

interface GeminiRequestBody {
  prompt?: string;
  context?: string;
  model?: string; // optional override
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
    const body: GeminiRequestBody = (req.body || {}) as GeminiRequestBody;
    const { prompt, context, model } = body;
    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      res.status(400).json({ error: "Missing prompt" });
      return;
    }

    const fullPrompt = context
      ? `Context: ${context}\n\nQuestion: ${prompt}\n\nPlease provide a helpful answer based on the context provided.`
      : prompt;

    // Preferred models ordered by availability / access; allow override via body.model or env GEMINI_MODEL
    const configuredModel = process.env.GEMINI_MODEL?.trim();
    const modelCandidates = [
      model?.trim(), // explicit request
      configuredModel, // env override
      "gemini-2.0-flash", // newest fast multimodal
      "gemini-2.0-flash-exp", // experimental variant if enabled
      "gemini-1.5-flash-latest",
      "gemini-1.5-flash",
      "gemini-1.5-pro-latest", // higher tier
      "gemini-pro", // legacy fallback
    ].filter(Boolean) as string[];

    let lastError: any = null;
    for (const m of modelCandidates) {
      try {
        console.log(`[gemini] attempting model=${m}`);
        const upstream = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${apiKey}`,
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

        console.log(
          `[gemini] model=${m} status=${upstream.status} keys=` +
            Object.keys(data || {}).slice(0, 5).join(",")
        );

        if (upstream.status === 403) {
          // Permission / model access denied – try next model
          lastError = { status: 403, detail: data };
          continue;
        }

        if (!upstream.ok) {
          lastError = { status: upstream.status, detail: data };
          continue; // attempt next candidate
        }

        // Success
        res.status(200).json({ ...data, modelUsed: m });
        return;
      } catch (innerErr: any) {
        lastError = innerErr;
        continue;
      }
    }

    // All attempts failed
    const status = lastError?.status || 502;
    console.error("[gemini] all attempts failed", {
      status,
      lastError: lastError?.detail || lastError?.message || lastError,
      tried: modelCandidates,
    });
    res.status(status).json({
      error: "All model attempts failed",
      detail: lastError?.detail || lastError?.message || lastError,
      tried: modelCandidates,
    });
  } catch (err: any) {
    console.error("[gemini] unhandled error", err);
    res
      .status(500)
      .json({ error: "Gemini request failed", detail: err?.message });
  }
}
