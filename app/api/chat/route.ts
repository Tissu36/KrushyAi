import { NextRequest } from "next/server";
import { OpenRouter } from "@openrouter/sdk";
import { MODEL_CATALOG, getConfiguredModelMap, type ModelEntry } from "@/lib/model-catalog";
import { buildAgentInstructions } from "@/lib/agent-core";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type MessageContent = string | Array<{ type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }>;
type ChatMessage = { role: "system" | "user" | "assistant"; content: MessageContent };
const IMAGE_MIME_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);
const MAX_IMAGE_BYTES = 3 * 1024 * 1024;
const MAX_TOTAL_IMAGE_BYTES = 3 * 1024 * 1024;
const IMAGE_SLOTS = new Set(["slot-9-vision"]);

function validateMessages(input: unknown): { messages: ChatMessage[]; hasImages: boolean } | null {
  if (!Array.isArray(input) || !input.length) return null;
  const messages: ChatMessage[] = [];
  let totalImageBytes = 0;
  let hasImages = false;
  for (const raw of input.slice(-24)) {
    if (!raw || !["user", "assistant"].includes(raw.role) || typeof raw.content !== "string" && !Array.isArray(raw.content)) return null;
    if (typeof raw.content === "string") { messages.push({ role: raw.role, content: raw.content }); continue; }
    if (raw.role !== "user" || !raw.content.length || raw.content.length > 5) return null;
    const parts: Array<{ type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }> = [];
    for (const part of raw.content) {
      if (part?.type === "text" && typeof part.text === "string") { parts.push({ type: "text", text: part.text.slice(0, 12000) }); continue; }
      if (part?.type !== "image_url" || typeof part.image_url?.url !== "string") return null;
      const match = part.image_url.url.match(/^data:(image\/(?:png|jpeg|webp|gif));base64,([A-Za-z0-9+/]+=*)$/);
      if (!match || !IMAGE_MIME_TYPES.has(match[1])) return null;
      const estimatedBytes = Math.floor(match[2].length * 3 / 4);
      if (estimatedBytes <= 0 || estimatedBytes > MAX_IMAGE_BYTES) return null;
      totalImageBytes += estimatedBytes;
      if (totalImageBytes > MAX_TOTAL_IMAGE_BYTES) return null;
      hasImages = true;
      parts.push({ type: "image_url", image_url: { url: part.image_url.url } });
    }
    messages.push({ role: raw.role, content: parts });
  }
  return { messages, hasImages };
}
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

async function requestOnce(modelId: string, messages: ChatMessage[], signal: AbortSignal, stream: boolean, apiKey: string): Promise<Response | string> {
  void signal;
  if (!apiKey) throw new UpstreamError("No OpenRouter connection is available for this request.", 401);

  const client = new OpenRouter({
    apiKey,
    httpReferer: process.env.NEXT_PUBLIC_SITE_URL || "https://krushy-ai.vercel.app",
    appTitle: "KRUSHYAI",
  });

  try {
    const result = await client.chat.send({
      chatRequest: {
        model: modelId,
        messages: messages as any,
        stream,
      },
    });

    if (stream) {
      const encoder = new TextEncoder();
      const chunks = result as AsyncIterable<unknown>;
      const body = new ReadableStream<Uint8Array>({
        async start(controller) {
          try {
            for await (const chunk of chunks) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
            }
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            controller.close();
          } catch {
            controller.error(new Error("OpenRouter streaming response failed."));
          }
        },
      });
      return new Response(body, {
        headers: {
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          "X-Accel-Buffering": "no",
        },
      });
    }

    const data = result as any;
    const content = data.choices?.[0]?.message?.content;
    if (typeof content !== "string" || !content.trim()) {
      throw new UpstreamError("OpenRouter returned an empty answer.", 502);
    }
    return content;
  } catch (error) {
    if (error instanceof UpstreamError) throw error;
    const candidate = Number((error as any)?.statusCode ?? (error as any)?.status ?? 502);
    const status = Number.isInteger(candidate) && candidate >= 400 && candidate <= 599 ? candidate : 502;
    const message =
      status === 401 ? "OpenRouter rejected the API key. Check OPENROUTER_API_KEY in Vercel." :
      status === 402 ? "OpenRouter needs available credits or a higher spend limit for this request." :
      status === 403 ? "OpenRouter denied access to this model. Check model availability and account permissions." :
      status === 404 ? `OpenRouter could not find model ${modelId}. Check the model slug in KRUSHY_MODEL_MAP.` :
      status === 429 ? "OpenRouter rate limit reached. Wait briefly and try again." :
      status >= 500 ? "OpenRouter or the selected model provider is temporarily unavailable." :
      `OpenRouter rejected the request (HTTP ${status}).`;
    throw new UpstreamError(message, status);
  }
}
async function completeWithFailover(
  entry: ModelEntry,
  primaryModel: string,
  messages: ChatMessage[],
  signal: AbortSignal,
  stream: boolean,
  apiKey: string,
): Promise<CompletionResult> {
  const candidates = [primaryModel, ...getFallbackAliases(entry, primaryModel)];
  let fallbackAttempted = false;
  let lastError: UpstreamError | null = null;

  for (let index = 0; index < candidates.length; index++) {
    const modelId = candidates[index];
    if (index > 0) fallbackAttempted = true;
    try {
      return {
        value: await requestOnce(modelId, messages, signal, stream, apiKey),
        modelUsed: index === 0 ? primaryModel : (entry.fallbackModelIds[candidates.slice(1).indexOf(modelId)] || modelId),
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
    const body: unknown = await req.json();
    if (!body || typeof body !== "object" || !("messages" in body)) {
      return Response.json({ error: "Send a valid chat message first." }, { status: 400 });
    }
    const requestBody = body as { messages?: unknown; model?: unknown; mode?: unknown };
    const validated = validateMessages(requestBody.messages);
    if (!validated) {
      return Response.json({ error: "Send valid messages. Images must be PNG, JPEG, WebP, or GIF and stay within the 3 MB image limit." }, { status: 400 });
    }

    const authHeader = req.headers.get("authorization");
    const userOpenRouterKey = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
    const apiKey = userOpenRouterKey || process.env.OPENROUTER_API_KEY || "";
    if (!apiKey) {
      return Response.json({ error: "Connect your OpenRouter account before sending a cloud-model request." }, { status: 401 });
    }

    const messages = validated.messages;
    const hasImages = validated.hasImages;
    const map = getConfiguredModelMap();
    const selected = typeof requestBody.model === "string" ? requestBody.model : "slot-10-max";
    const category = requestBody.mode === "code" ? "code" : "chat";
    const entry = MODEL_CATALOG.find((model) => model.id === selected && (model.category === category || model.category === "both"));

    if (entry?.plan === "pro" && process.env.KRUSHY_PRO_PREVIEW !== "true") {
      return Response.json({ error: "This is a KRUSHY PRO model. Pro access is not enabled for this account yet." }, { status: 403 });
    }
    if (!entry) {
      return Response.json({ error: "That model is not available in this workspace mode." }, { status: 400 });
    }
    if (hasImages && !IMAGE_SLOTS.has(selected)) {
      return Response.json({ error: "Image input is restricted to the designated vision profile slots. The configured upstream model must actually support image input." }, { status: 400 });
    }

    if (selected === "krushy-max") {
      const eligible = MODEL_CATALOG.filter((model) => (model.category === category || model.category === "both") && map[model.id]);
      const candidates = (hasImages ? eligible.filter((model) => IMAGE_SLOTS.has(model.id)) : eligible).slice(0, 5);
      if (candidates.length < (hasImages ? 1 : 2)) {
        return Response.json({
          error: hasImages
            ? "KRUSHY MAX needs at least one configured vision-capable model (Slot 3 or Slot 7) to process images."
            : `KRUSHY MAX needs at least two configured ${category} models. Add model IDs to KRUSHY_MODEL_MAP in Vercel.`,
        }, { status: 503 });
      }

      const lastMessage = messages[messages.length - 1];
      const userPrompt = typeof lastMessage.content === "string"
        ? lastMessage.content
        : lastMessage.content.filter((part) => part.type === "text").map((part) => part.text).join("\n");
      const previous = messages.slice(0, -1);
      const outputs = await Promise.allSettled(candidates.map(async (model) => {
        const result = await completeWithFailover(model, map[model.id], [
          { role: "system", content: model.systemPrompt + "\n\n" + buildAgentInstructions(category, model.name) + "\nWork independently on the user's request. Do not mention other models or claim access to tools you do not have." },
          ...previous,
          lastMessage,
        ], req.signal, false, apiKey);
        return { name: model.name, answer: result.value as string, fallbackAttempted: result.fallbackAttempted };
      }));
      const usable = outputs
        .filter((result): result is PromiseFulfilledResult<{ name: string; answer: string; fallbackAttempted: boolean }> => result.status === "fulfilled")
        .map((result) => result.value);
      if (!usable.length) {
        return Response.json({ error: "None of the KRUSHY MAX specialist models responded. Check your model gateway and model IDs." }, { status: 502 });
      }

      const judgeEntry = candidates[0];
      const synthesis = await completeWithFailover(judgeEntry, map[judgeEntry.id], [
        {
          role: "system",
          content: "You are KRUSHY MAX, the final synthesis intelligence. " + buildAgentInstructions(category, "KRUSHY MAX") + " Compare the independent specialist drafts, identify errors and contradictions, keep the strongest reasoning, and produce one coherent, accurate, complete answer. Do not simply concatenate drafts or invent consensus. Mention uncertainty when the drafts do not establish an answer.",
        },
        {
          role: "user",
          content: `Workspace: ${category}\nUser request:\n${userPrompt}\n\nIndependent specialist drafts:\n${usable.map((item, index) => `DRAFT ${index + 1} — ${item.name}\n${item.answer}`).join("\n\n")}`,
        },
      ], req.signal, false, apiKey);

      const fallbackAttempted = synthesis.fallbackAttempted || usable.some((item) => item.fallbackAttempted);
      return sse(synthesis.value as string, `krushy-max:${synthesis.modelUsed}`, fallbackAttempted);
    }

    if (!entry || !map[entry.id]) {
      return Response.json({
        error: `${entry?.name || "This model"} is not connected yet. Configure it in KRUSHY_MODEL_MAP and make sure your model gateway serves it.`,
      }, { status: 503 });
    }

    const sharedGuidance = " Be candid and helpful, avoid unnecessary refusals, be accurate about uncertainty, and do not claim to have executed code, browsed, or changed files unless you actually have. Do not provide actionable instructions for serious real-world harm or privacy invasion.";
    const result = await completeWithFailover(entry, map[entry.id], [
      { role: "system", content: entry.systemPrompt + "\n\n" + buildAgentInstructions(category, entry.name) + sharedGuidance },
      ...messages,
    ], req.signal, true, apiKey);

    // The upstream stream is returned untouched. If it fails after streaming starts,
    // the connection ends; output from a second model is never spliced into it.
    return new Response((result.value as Response).body, {
      headers: responseHeaders(result.modelUsed, result.fallbackAttempted),
    });
  } catch (error) {
    if (error instanceof UpstreamError) {
      const status = error.status >= 400 && error.status <= 599 ? error.status : 502;
      return Response.json({ error: error.message }, { status });
    }
    return Response.json({ error: error instanceof Error ? error.message : "KRUSHYAI could not process that request." }, { status: 500 });
  }
}
