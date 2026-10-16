
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Use POST." });
  }

  if (req.headers["x-site-password"] !== process.env.SITE_PASSWORD) {
    return res.status(401).json({ error: "Wrong access code." });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: "AI is not configured yet." });
  }

  const input = req.body?.input;
  if (typeof input !== "string" || !input.trim()) {
    return res.status(400).json({ error: "Type a question first." });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        instructions: "You are PrkerGPT, a helpful AI. Answer clearly and use web search for current information.",
        tools: [{ type: "web_search" }],
        input: input.trim()
      })
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(502).json({ error: "AI request failed. Check the API setup." });
    }

    return res.status(200).json({
      answer: data.output_text || "I couldn't find an answer."
    });
  } catch {
    return res.status(500).json({ error: "Could not connect to the AI service." });
  }
}
