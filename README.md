# PrkerGPT — Vercel setup

This project has a website (`index.html`) and a server-side chat endpoint (`api/chat.js`). The AI key is not included.

## Publish
1. Put these files in a GitHub repository, then import that repository into Vercel.
2. In Vercel Project Settings → Environment Variables, add:
   - `OPENAI_API_KEY` = your private API key
   - `SITE_PASSWORD` = `parkerv4`
   - Optional `OPENAI_MODEL` = `gpt-4.1-mini`
3. Redeploy after adding variables. Open the generated `*.vercel.app` URL.

## Important
- Never put `OPENAI_API_KEY` in the browser files or commit it to Git.
- API usage may cost money and may require billing. Review provider pricing and set limits before sharing.
- `parkerv4` is a shared access code, not a full account system. Anyone who knows it can use the app; use stronger authentication and rate limiting for a public production site.
- Web search is enabled via the Responses API web_search tool.
