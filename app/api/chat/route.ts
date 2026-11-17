import { NextRequest } from "next/server";
export const runtime = "nodejs";
const allowed = new Set(["openai/gpt-oss-120b", "openai/gpt-oss-20b"]);

export async function POST(req: NextRequest) {
  const key = process.env.GROQ_API_KEY;
  if (!key) return Response.json({ error: "KRUSHY AI needs a Groq API key. Add GROQ_API_KEY in Vercel → Settings → Environment Variables." }, { status: 503 });
  try {
    const body = await req.json();
    const model = typeof body.model === "string" && allowed.has(body.model) ? body.model : "openai/gpt-oss-120b";
    const messages = Array.isArray(body.messages) ? body.messages.slice(-30) : [];
    if (!messages.length) return Response.json({ error: "Send a message first." }, { status: 400 });
    const system = body.mode === "code"
      ? "You are KRUSHY AI Code Studio, an expert senior software engineer. Help plan, write, review, debug and explain production-quality code. Give complete runnable code and clear file paths. Be explicit about assumptions. You do not have repository write, shell or browser tools in this chat; never claim to have edited files, deployed code or run tests unless that actually happened."
      : "You are KRUSHY AI, a clear, capable assistant. Be accurate, direct and useful. If unsure, say so.";
    const upstream = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model, messages: [{ role: "system", content: system }, ...messages], stream: true, temperature: 0.7 })
    });
    if (!upstream.ok) { const detail = await upstream.text(); return Response.json({ error: `Groq provider error (${upstream.status}): ${detail.slice(0, 500)}` }, { status: upstream.status }); }
    return new Response(upstream.body, { headers: { "Content-Type": "text/event-stream; charset=utf-8", "Cache-Control": "no-cache, no-transform", Connection: "keep-alive" } });
  } catch { return Response.json({ error: "Could not process that message. Please try again." }, { status: 500 }); }
}