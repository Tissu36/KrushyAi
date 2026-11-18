import { NextRequest } from "next/server";
import { MODEL_CATALOG, getConfiguredModelMap, type ModelEntry } from "@/lib/model-catalog";
import { buildAgentInstructions } from "@/lib/agent-core";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };
type CompletionResult = { value: Response | string; modelUsed: string; fallbackAttempted: boolean };

class UpstreamError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "UpstreamError";
  }
}

function sse(text: string, modelUsed = "krushy-max", fallbackAttempted = false) {
  const payload = JSON.stringify({ choices: [{ delta: { content: text } }] });
  const body = `data: ${payload}\n\ndata: [DONE]\n\n`;
  return new Response(body, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Krushy-Model-Used": modelUsed,
      "X-Krushy-Fallback-Attempted": String(fallbackAttempted),
    },
  });
}

function gatewayFallbackAlias(modelId: string): string | null {
  if (modelId.startsWith("claude-")) return `anthropic/${modelId}`;
  if (modelId.startsWith("gemini-")) return `gemini/${modelId}`;
  if (modelId.startsWith("gpt-")) return `openai/${modelId}`;
  return null;
}

/**
 * Optional per-slot override for installations whose LiteLLM aliases differ from
 * the conventional provider/model form. Example:
 * KRUSHY_MODEL_FALLBACK_MAP={"slot-1-flagship":["my-opus-alias","my-flash-alias"]}
 */
function getFallbackAliases(entry: ModelEntry, primary: string): string[] {
  let overrides: Record<string, unknown> = {};
  try {
    const parsed = JSON.parse(process.env.KRUSHY_MODEL_FALLBACK_MAP || "{}");
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) overrides = parsed;
  } catch {
    // Ignore malformed optional overrides and use catalog suggestions.
  }

  const override = overrides[entry.id];
  const suggestions = Array.isArray(override)
    ? override.filter((value): value is string => typeof value === "string" && Boolean(value.trim()))
    : entry.fallbackModelIds.map(gatewayFallbackAlias).filter((value): value is string => Boolean(value));

  return [...new Set(suggestions.map((value) => value.trim()).filter((value) => value && value !== primary))];
}

function retryDelayMs(headers: Headers): number {
  const retryAfter = headers.get("retry-after");
  const reset = headers.get("x-ratelimit-reset-requests");
  const value = retryAfter || reset;
  if (!value) return 0;

  const trimmed = value.trim();
  let milliseconds: number;
  if (/^\d+(\.\d+)?$/.test(trimmed)) {
    const numeric = Number(trimmed);
    // Rate-limit reset headers are sometimes Unix timestamps rather than durations.
    milliseconds = numeric > 1_000_000_000 ? Math.max(0, numeric * 1000 - Date.now()) : numeric * 1000;
  } else if (/^\d+(\.\d+)?\s*ms$/i.test(trimmed)) {
    milliseconds = Number.parseFloat(trimmed);
  } else if (/^\d+(\.\d+)?\s*s$/i.test(trimmed)) {
    milliseconds = Number.parseFloat(trimmed) * 1000;
  } else {
    const date = Date.parse(trimmed);
    milliseconds = Number.isNaN(date) ? 0 : Math.max(0, date - Date.now());
  }

  return Number.isFinite(milliseconds) ? Math.max(0, milliseconds) : 0;
}

function wait(ms: number, signal: AbortSignal): Promise<void> {
  if (ms <= 0) return Promise.resolve();
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(signal.reason || new Error("Request aborted."));
      return;
    }
    const timer = setTimeout(done, ms);
    function done() {
      signal.removeEventListener("abort", abort);
      resolve();
    }
    function abort() {
      clearTimeout(timer);
      signal.removeEventListener("abort", abort);
      reject(signal.reason || new Error("Request aborted."));
    }
    signal.addEventListener("abort", abort, { once: true });
  });
}

async function requestOnce(modelId: string, messages: ChatMessage[], signal: AbortSignal, stream: boolean): Promise<Response | string> {
  const base = process.env.KRUSHY_MODEL_BASE_URL?.replace(/\/$/, "");
  if (!base) throw new UpstreamError("KRUSHY_MODEL_BASE_URL is not configured.", 503);

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (process.env.KRUSHY_MODEL_API_KEY) headers.Authorization = `Bearer ${process.env.KRUSHY_MODEL_API_KEY}`;

  const response = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers,
    body: JSON.stringify({ model: modelId, messages, stream }),
    signal,
  });

  if (!response.ok) {
    // Consume the error body so the connection can be reused, but do not expose
    // gateway response text or internal provider details to the browser.
    await response.text().catch(() => "");
    if (response.status === 429 || response.status >= 500) {
      const error = new UpstreamError(`Upstream model returned HTTP ${response.status}.`, response.status);
      Object.assign(error, { retryDelay: retryDelayMs(response.headers) });
      throw error;
    }
    // 400/401/403/404 and all other 4xx statuses fail immediately without failover.
    throw new UpstreamError(`Upstream model rejected the request (HTTP ${response.status}).`, response.status);
  }

  if (stream) return response;
  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (typeof content !== "string" || !content.trim()) throw new UpstreamError("A model returned an empty answer.", 502);
  return content as string;
}

async function completeWithFailover(
  entry: ModelEntry,
  primaryModel: string,
  messages: ChatMessage[],
  signal: AbortSignal,
  stream: boolean,
): Promise<CompletionResult> {
  const candidates = [primaryModel, ...getFallbackAliases(entry, primaryModel)];
  let fallbackAttempted = false;
  let lastError: UpstreamError | null = null;

  for (let index = 0; index < candidates.length; index++) {
    const modelId = candidates[index];
    if (index > 0) fallbackAttempted = true;
    try {
      return {
        value: await requestOnce(modelId, messages, signal, stream),
        modelUsed: index === 0 ? entry.modelId : (entry.fallbackModelIds[candidates.slice(1).indexOf(modelId)] || `fallback-${index}`),
        fallbackAttempted,
      };
    } catch (error) {
      if (!(error instanceof UpstreamError)) throw error;
      lastError = error;
      const retryable = error.status === 429 || error.status >= 500;
      const hasFallback = index < candidates.length - 1;
      if (!retryable || !hasFallback || signal.aborted) throw error;

      const delay = Number((error as UpstreamError & { retryDelay?: number }).retryDelay || 0);
      // Never hold the user for a long upstream cooldown; skip the wait and fail over.
      if (delay > 0 && delay <= 2500) await wait(delay, signal);
    }
  }

  throw lastError || new UpstreamError("No configured model could answer the request.", 503);
}

function responseHeaders(modelUsed: string, fallbackAttempted: boolean) {
  return {
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    "X-Accel-Buffering": "no",
    "X-Krushy-Model-Used": modelUsed,
    "X-Krushy-Fallback-Attempted": String(fallbackAttempted),
  };
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
    const category = body.mode === "code" ? "code" : "chat";
    const entry = MODEL_CATALOG.find((m) => m.id === selected && m.category === category);
    if (selected !== "krushy-max" && !entry) return Response.json({ error: "That model is not available in this workspace mode." }, { status: 400 });

    if (selected === "krushy-max") {
      const candidates = MODEL_CATALOG.filter((m) => m.category === category && map[m.id]).slice(0, 5);
      if (candidates.length < 2) return Response.json({ error: `KRUSHY MAX needs at least two configured ${category} models. Add model IDs to KRUSHY_MODEL_MAP in Vercel.` }, { status: 503 });

      const userPrompt = messages[messages.length - 1].content;
      const previous = messages.slice(0, -1);
      const outputs = await Promise.allSettled(candidates.map(async (model) => {
        const result = await completeWithFailover(model, map[model.id], [
          { role: "system", content: model.systemPrompt + "\n\n" + buildAgentInstructions(category, model.name) + "\nWork independently on the user's request. Do not mention other models or claim access to tools you do not have." },
          ...previous,
          { role: "user", content: userPrompt },
        ], req.signal, false);
        return { name: model.name, answer: result.value as string, fallbackAttempted: result.fallbackAttempted };
      }));
      const usable = outputs.filter((x): x is PromiseFulfilledResult<{ name: string; answer: string; fallbackAttempted: boolean }> => x.status === "fulfilled").map((x) => x.value);
      if (!usable.length) return Response.json({ error: "None of the KRUSHY MAX specialist models responded. Check your model gateway and model IDs." }, { status: 502 });

      const judgeEntry = candidates[0];
      const judge = map[judgeEntry.id];
      const synthesis = await completeWithFailover(judgeEntry, judge, [
        { role: "system", content: "You are KRUSHY MAX, the final synthesis intelligence. " + buildAgentInstructions(category, "KRUSHY MAX") + " Compare the independent specialist drafts, identify errors and contradictions, keep the strongest reasoning, and produce one coherent, accurate, complete answer. Do not simply concatenate drafts or invent consensus. Mention uncertainty when the drafts do not establish an answer." },
        { role: "user", content: `Workspace: ${category}\nUser request:\n${userPrompt}\n\nIndependent specialist drafts:\n${usable.map((x, i) => `DRAFT ${i + 1} — ${x.name}\n${x.answer}`).join("\n\n")}` },
      ], req.signal, false);
      return sse(synthesis.value as string, "krushy-max", synthesis.fallbackAttempted || usable.some((item) => item.fallbackAttempted));
    }

    if (!entry || !map[entry.id]) return Response.json({ error: `${entry?.name || "This model"} is not connected yet. Configure it in KRUSHY_MODEL_MAP and make sure your model gateway serves it.` }, { status: 503 });
    const sharedGuidance = " Be candid and helpful, avoid unnecessary refusals, be accurate about uncertainty, and do not claim to have executed code, browsed, or changed files unless you actually have. Do not provide actionable instructions for serious real-world harm or privacy invasion.";
    const result = await completeWithFailover(entry, map[entry.id], [
      { role: "system", content: entry.systemPrompt + "\n\n" + buildAgentInstructions(category, entry.name) + sharedGuidance },
      ...messages,
    ], req.signal, true) as CompletionResult;

    // The upstream stream is returned untouched. Once its body starts flowing, we
    // never splice in another model; mid-stream failures terminate this response.
    return new Response((result.value as Response).body, {
      headers: responseHeaders(result.modelUsed, result.fallbackAttempted),
    });
  } catch (error) {
    if (error instanceof UpstreamError) {
      const status = error.status >= 400 && error.status <= 599 ? error.status : 502;
      return Response.json({ error: error.message }, { status });
    }
    return Response.json({ error: error instanceof Error ? error.message : "KRUSHY AI could not process that request." }, { status: 500 });
  }
}
