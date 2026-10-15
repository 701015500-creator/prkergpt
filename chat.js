export default async function handler(req, res) {
  if (req.method !== "POST") { res.setHeader("Allow","POST"); return res.status(405).json({error:"Use POST for chat requests."}); }
  const expected = process.env.SITE_PASSWORD;
  if (!expected || req.headers["x-site-password"] !== expected) return res.status(401).json({error:"Wrong access code."});
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(503).json({error:"AI service not configured. Add OPENAI_API_KEY in Vercel project settings."});
  const input = typeof req.body?.input === "string" ? req.body.input.trim() : "";
  if (!input) return res.status(400).json({error:"Type a question first."});
  if (input.length > 6000) return res.status(413).json({error:"Keep your message under 6,000 characters."});
  const history = (Array.isArray(req.body?.history) ? req.body.history : []).slice(-8)
    .filter(m => m && ["user","assistant"].includes(m.role) && typeof m.content === "string")
    .map(m => ({role:m.role,content:m.content.slice(0,6000)}));
  try {
    const r = await fetch("https://api.openai.com/v1/responses", {method:"POST",headers:{"Authorization":`Bearer ${apiKey}`,"Content-Type":"application/json"},body:JSON.stringify({
      model:process.env.OPENAI_MODEL || "gpt-4.1-mini",
      instructions:"You are PrkerGPT, a helpful, friendly AI assistant. Answer clearly. Use web search for current facts, recent events, or when sources would improve the answer. Be honest about uncertainty and keep answers age-appropriate.",
      tools:[{type:"web_search"}],input:[...history,{role:"user",content:input}]
    })});
    const data = await r.json();
    if (!r.ok) { console.error("AI provider error",r.status,data?.error?.message||""); return res.status(502).json({error:"AI service error. Check your API key, account, and usage limits."}); }
    let answer = typeof data.output_text === "string" ? data.output_text : "";
    if (!answer && Array.isArray(data.output)) answer=data.output.flatMap(x=>Array.isArray(x.content)?x.content:[]).filter(x=>x.type==="output_text"&&typeof x.text==="string").map(x=>x.text).join("\n");
    return res.status(200).json({answer:answer||"I couldn't find an answer. Try asking another way."});
  } catch(e) { console.error("Chat request failed",e); return res.status(500).json({error:"Could not reach the AI service. Try again."}); }
}