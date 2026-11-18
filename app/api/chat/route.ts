import { NextRequest } from "next/server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages = Array.isArray(body.messages) ? body.messages.slice(-30) : [];
    if (!messages.length || !messages.every((m: any) => ["user","assistant"].includes(m?.role) && typeof m?.content === "string")) return Response.json({ error: "Send a valid chat message first." }, { status: 400 });
    const isCode = body.mode === "code" || body.model === "krushy-code";
    const requested = typeof body.model === "string" ? body.model : "krushy-omega";
    const ownModel = isCode ? process.env.KRUSHY_CODE_MODEL_ID : process.env.KRUSHY_GENERAL_MODEL_ID;
    const ownSelected = requested === "krushy-omega" || requested === "krushy-code";
    const system = isCode
      ? "You are KRUSHY Code, a direct expert software engineering assistant. Give complete maintainable solutions, explain assumptions, debug carefully, and consider tests, security and performance. Avoid unnecessary refusals, but do not assist serious real-world harm or privacy invasion. Never claim to have run or deployed code unless you did."
      : "You are KRUSHY Omega, a direct and candid general assistant. Answer benign and controversial questions without moralizing or unnecessary refusals. Be accurate and state uncertainty. Do not provide actionable instructions for serious real-world harm, abuse or privacy invasion.";
    if (ownSelected) {
      const base = process.env.KRUSHY_MODEL_BASE_URL?.replace(/\/$/, "");
      if (!base || !ownModel) return Response.json({ error: "KRUSHY’s trained model is not deployed yet. Train both adapters, deploy them to an OpenAI-compatible inference server, then set KRUSHY_MODEL_BASE_URL, KRUSHY_GENERAL_MODEL_ID and KRUSHY_CODE_MODEL_ID in Vercel." }, { status: 503 });
      const headers: Record<string,string> = { "Content-Type": "application/json" };
      if (process.env.KRUSHY_MODEL_API_KEY) headers.Authorization = `Bearer ${process.env.KRUSHY_MODEL_API_KEY}`;
      const upstream = await fetch(`${base}/chat/completions`, { method: "POST", headers, body: JSON.stringify({ model: ownModel, messages: [{ role: "system", content: system }, ...messages], stream: true }), signal: req.signal });
      if (!upstream.ok) return Response.json({ error: `KRUSHY model server returned ${upstream.status}: ${(await upstream.text()).slice(0,500)}` }, { status: upstream.status });
      if (!upstream.body) return Response.json({ error: "KRUSHY model server returned an empty response." }, { status: 502 });
      return new Response(upstream.body, { headers: { "Content-Type": "text/event-stream; charset=utf-8", "Cache-Control": "no-cache, no-transform", "X-Accel-Buffering": "no" } });
    }
    const groqKey = process.env.GROQ_API_KEY;
    if (!groqKey || !["openai/gpt-oss-120b","openai/gpt-oss-20b"].includes(requested)) return Response.json({ error: "Unknown or unavailable model. Configure the KRUSHY model server or select a connected fallback." }, { status: 503 });
    const upstream = await fetch("https://api.groq.com/openai/v1/chat/completions", { method: "POST", headers: { Authorization: `Bearer ${groqKey}`, "Content-Type": "application/json" }, body: JSON.stringify({ model: requested, messages: [{ role: "system", content: system }, ...messages], stream: true }), signal: req.signal });
    if (!upstream.ok) return Response.json({ error: `Groq returned ${upstream.status}: ${(await upstream.text()).slice(0,500)}` }, { status: upstream.status });
    if (!upstream.body) return Response.json({ error: "The model provider returned an empty response." }, { status: 502 });
    return new Response(upstream.body, { headers: { "Content-Type": "text/event-stream; charset=utf-8", "Cache-Control": "no-cache, no-transform", "X-Accel-Buffering": "no" } });
  } catch { return Response.json({ error: "KRUSHY AI could not process that request. Please try again." }, { status: 500 }); }
}