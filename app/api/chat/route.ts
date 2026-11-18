import { NextRequest } from "next/server";
import { MODEL_CATALOG, getConfiguredModelMap } from "@/lib/model-catalog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ChatMessage = { role: "user" | "assistant"; content: string };

function sse(text: string) {
  const payload = JSON.stringify({ choices: [{ delta: { content: text } }] });
  const body = `data: ${payload}\n\ndata: [DONE]\n\n`;
  return new Response(body, { headers: { "Content-Type": "text/event-stream; charset=utf-8", "Cache-Control": "no-cache, no-transform" } });
}

async function complete(modelId: string, messages: ChatMessage[], signal: AbortSignal, stream: boolean) {
  const base = process.env.KRUSHY_MODEL_BASE_URL?.replace(/\/$/, "");
  if (!base) throw new Error("KRUSHY_MODEL_BASE_URL is not configured.");
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (process.env.KRUSHY_MODEL_API_KEY) headers.Authorization = `Bearer ${process.env.KRUSHY_MODEL_API_KEY}`;
  const response = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers,
    body: JSON.stringify({ model: modelId, messages, stream }),
    signal,
  });
  if (!response.ok) throw new Error(`Model server returned ${response.status}: ${(await response.text()).slice(0, 400)}`);
  if (stream) return response;
  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (typeof content !== "string" || !content.trim()) throw new Error("A model returned an empty answer.");
  return content as string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages = Array.isArray(body.messages) ? body.messages.slice(-24) : [];
    if (!messages.length || !messages.every((m: any) => ["user", "assistant"].includes(m?.role) && typeof m?.content === "string")) {
      return Response.json({ error: "Send a valid chat message first." }, { status: 400 });
    }
    const map = getConfiguredModelMap();
    const selected = typeof body.model === "string" ? body.model : "krushy-max";
    const isCode = body.mode === "code";
    const category = isCode ? "code" : "chat";
    const system = isCode
      ? "You are KRUSHY Code, a direct expert software engineering assistant. Produce correct, maintainable code, explain assumptions, debug methodically, and consider tests and security. Avoid unnecessary refusals. Never claim to have executed or deployed code unless you actually did."
      : "You are KRUSHY, a direct, candid and helpful assistant. Answer benign and controversial questions without moralizing or unnecessary refusals. Be accurate, distinguish facts from guesses, and state uncertainty. Do not provide actionable instructions for serious real-world harm or privacy invasion.";
    const entry = MODEL_CATALOG.find((m) => m.id === selected && m.category === category);
    if (selected !== "krushy-max" && !entry) return Response.json({ error: "That model is not available in this workspace mode." }, { status: 400 });

    if (selected === "krushy-max") {
      const candidates = MODEL_CATALOG.filter((m) => m.category === category && map[m.id]);
      if (candidates.length < 2) return Response.json({ error: `KRUSHY MAX needs at least two configured ${category} models. Add model IDs to KRUSHY_MODEL_MAP in Vercel.` }, { status: 503 });
      const chosen = candidates.slice(0, 3);
      const userPrompt = messages[messages.length - 1].content;
      const previous = messages.slice(0, -1);
      const outputs = await Promise.allSettled(chosen.map(async (m) => ({
        name: m.name,
        answer: await complete(map[m.id], [
          { role: "system", content: system + " Solve the user's request independently. Give your best answer, with no mention of other models." },
          ...previous,
          { role: "user", content: userPrompt },
        ], req.signal, false) as string,
      })));
      const usable = outputs.filter((x): x is PromiseFulfilledResult<{name:string;answer:string}> => x.status === "fulfilled").map(x => x.value);
      if (!usable.length) return Response.json({ error: "None of the KRUSHY MAX specialist models responded. Check your model gateway and model IDs." }, { status: 502 });
      const judge = map["gpt-oss-20b"] || map[chosen[0].id];
      const synthesis = await complete(judge, [
        { role: "system", content: "You are KRUSHY MAX, the final synthesis intelligence. You receive independent model drafts. Compare them, identify errors and contradictions, retain the strongest reasoning, and produce one coherent, accurate, complete answer. Do not mention internal model voting unless asked. If all drafts are weak or uncertain, say so rather than inventing." },
        { role: "user", content: `User request:\n${userPrompt}\n\nIndependent drafts:\n${usable.map((x,i)=>`DRAFT ${i+1} — ${x.name}\n${x.answer}`).join("\n\n")}` },
      ], req.signal, false) as string;
      return sse(synthesis);
    }

    if (!entry || !map[entry.id]) return Response.json({ error: `${entry?.name || "This model"} is not connected yet. Configure it in KRUSHY_MODEL_MAP and make sure your model gateway serves it.` }, { status: 503 });
    const upstream = await complete(map[entry.id], [{ role: "system", content: system }, ...messages], req.signal, true) as Response;
    return new Response(upstream.body, { headers: { "Content-Type": "text/event-stream; charset=utf-8", "Cache-Control": "no-cache, no-transform", "X-Accel-Buffering": "no" } });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "KRUSHY AI could not process that request." }, { status: 500 });
  }
}
