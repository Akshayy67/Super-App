// Serverless function (Vercel) proxy for Google Vision OCR
// Frontend should POST { imageBase64 } (a data URL or base64 string)
// Environment variables (server side):
//   GOOGLE_API_KEY (preferred) OR fallback to GOOGLE_AI_API_KEY

interface VisionRequestBody {
  imageBase64?: string; // data URL OR raw base64
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.GOOGLE_API_KEY || process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    res
      .status(500)
      .json({ error: "Server misconfiguration: missing GOOGLE_API_KEY" });
    return;
  }

  try {
    const body: VisionRequestBody = req.body || {};
    let { imageBase64 } = body;
    if (!imageBase64) {
      res.status(400).json({ error: "Missing imageBase64" });
      return;
    }

    // If a data URL, strip prefix
    const base64Content = imageBase64.includes(",")
      ? imageBase64.split(",")[1]
      : imageBase64;

    const upstream = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requests: [
            {
              image: { content: base64Content },
              features: [{ type: "TEXT_DETECTION", maxResults: 1 }],
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
      .json({ error: "Vision request failed", detail: err?.message });
  }
}
