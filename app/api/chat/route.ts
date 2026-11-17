import { NextRequest } from "next/server";
export const runtime = "nodejs";
const allowed = new Set(["gemini-3.8-flash", "gemini-3.1-flash-lite"]);

export async function POST(req: NextRequest) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return Response.json({ error: "KRUSHY AI needs a Gemini API key. Add GEMINI_API_KEY in Vercel → Settings → Environment Variables." }, { status: 503 });
  try {
    const body = await req.json();
    const model = typeof body.model === "string" && allowed.has(body.model) ? body.model : "gemini-3.8-flash";
    const messages = Array.isArray(body.messages) ? body.messages.slice(-30) : [];
    if (!messages.length) return Response.json({ error: "Send a message first." }, { status: 400 });
    const system = body.mode === "code"
      ? "You are KRUSHY AI Code Studio, an expert senior software engineer. Help plan, write, review, debug and explain production-quality code. Give complete runnable code and clear file paths. Be explicit about assumptions. You do not have repository write, shell or browser tools in this chat; never claim to have edited files, deployed code or run tests unless that actually happened."
      : "You are KRUSHY AI, a clear, capable assistant. Be accurate, direct and useful. If unsure, say so.";
    const contents = messages.map((m: { role: string; content: string }) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: String(m.content ?? "") }] }));
    const upstream = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST", headers: { "x-goog-api-key": key, "Content-Type": "application/json" },
      body: JSON.stringify({ systemInstruction: { parts: [{ text: system }] }, contents, generationConfig: { temperature: 0.7 } })
    });
    const data = await upstream.json().catch(() => ({}));
    if (!upstream.ok) return Response.json({ error: `Gemini provider error (${upstream.status}): ${data?.error?.message || "Gemini request failed."}` }, { status: upstream.status });
    const answer = (data?.candidates?.[0]?.content?.parts || []).map((p: { text?: string }) => p.text || "").join("");
    if (!answer) return Response.json({ error: "Gemini returned an empty response. Try again." }, { status: 502 });
    const payload = `data: ${JSON.stringify({ choices: [{ delta: { content: answer } }] })}\n\ndata: [DONE]\n\n`;
    return new Response(payload, { headers: { "Content-Type": "text/event-stream; charset=utf-8", "Cache-Control": "no-cache, no-transform" } });
  } catch { return Response.json({ error: "Could not process that message. Please try again." }, { status: 500 }); }
}