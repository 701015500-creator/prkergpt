
export default async (request) => {
  const json = (data, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { "Content-Type": "application/json" },
    });

  if (request.method !== "POST") {
    return json({ error: "Use POST." }, 405);
  }

  const password = process.env.SITE_PASSWORD;
  const apiKey = process.env.OPENAI_API_KEY;

  if (
    !password ||
    request.headers.get("x-site-password") !== password
  ) {
    return json({ error: "Wrong access code." }, 401);
  }

  if (!apiKey) {
    return json({ error: "AI is not configured yet." }, 503);
  }

  try {
    const body = await request.json();
    const input = body?.input;

    if (typeof input !== "string" || !input.trim()) {
      return json({ error: "Type a question first." }, 400);
    }

    const response = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4.1-mini",
          tools: [{ type: "web_search" }],
          input: input.trim(),
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenAI API error:", data.error?.message);
      return json(
        { error: "The AI request failed. Check your API setup." },
        response.status === 429 ? 429 : 502
      );
    }

    return json({
      reply:
        data.output_text || "Sorry, I couldn't generate a reply.",
    });
  } catch (error) {
    console.error("Chat function error:", error);
    return json({ error: "Something went wrong on the server." }, 500);
  }
};
