// Serverless function (Vercel) proxy for OpenAI Chat Completions
// Keeps the API key on the server side. Frontend should POST { prompt } here.
// Environment variables expected (set them in Vercel dashboard, NOT prefixed with VITE_):
//   OPENAI_API_KEY  (required)

interface OpenAIRequestBody {
  prompt?: string;
  model?: string; // optional override
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    res
      .status(500)
      .json({ error: "Server misconfiguration: missing OPENAI_API_KEY" });
    return;
  }

  try {
    const body: OpenAIRequestBody = (req.body || {}) as OpenAIRequestBody;
    const { prompt, model } = body;
    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      res.status(400).json({ error: "Missing prompt" });
      return;
    }

    const upstream = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model?.trim() || "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    const data = await upstream.json();
    if (!upstream.ok) {
      res.status(upstream.status).json({ error: "Upstream error", detail: data });
      return;
    }

    res.status(200).json(data);
  } catch (err: any) {
    res.status(500).json({ error: "OpenAI request failed", detail: err?.message });
  }
}

