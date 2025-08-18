// Serverless function (Vercel) proxy for Anthropic Claude Messages API
// Keeps the API key on the server side. Frontend should POST { prompt } here.
// Environment variables expected (set them in Vercel dashboard, NOT prefixed with VITE_):
//   ANTHROPIC_API_KEY  (required)

interface ClaudeRequestBody {
  prompt?: string;
  model?: string; // optional override
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;
  if (!apiKey) {
    res
      .status(500)
      .json({ error: "Server misconfiguration: missing ANTHROPIC_API_KEY" });
    return;
  }

  try {
    const body: ClaudeRequestBody = (req.body || {}) as ClaudeRequestBody;
    const { prompt, model } = body;
    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      res.status(400).json({ error: "Missing prompt" });
      return;
    }

    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: model?.trim() || "claude-3-haiku-20240307",
        max_tokens: 1000,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    const data = await upstream.json();
    if (!upstream.ok) {
      res.status(upstream.status).json({ error: "Upstream error", detail: data });
      return;
    }

    res.status(200).json(data);
  } catch (err: any) {
    res
      .status(500)
      .json({ error: "Claude request failed", detail: err?.message });
  }
}

