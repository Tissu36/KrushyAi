import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Provider = {
  id: string;
  name: string;
  baseUrl: string;
  env: string;
  models: { id: string; name: string; tag: string; task: string }[];
};

// Only expose models when their provider key exists on the server.
// All endpoints below use the OpenAI-compatible Chat Completions protocol.
const providers: Provider[] = [
  { id: "groq", name: "Groq", baseUrl: "https://api.groq.com/openai/v1", env: "GROQ_API_KEY", models: [
    { id: "openai/gpt-oss-120b", name: "GPT-OSS 120B", tag: "Free tier", task: "Reasoning + coding" },
    { id: "openai/gpt-oss-20b", name: "GPT-OSS 20B", tag: "Fast", task: "Quick chat + coding" }
  ]},
  { id: "openai", name: "OpenAI", baseUrl: "https://api.openai.com/v1", env: "OPENAI_API_KEY", models: [
    { id: "gpt-6.2-astra", name: "GPT-6.2 Astra", tag: "Flagship", task: "Advanced reasoning + coding" },
    { id: "gpt-6.2-sol", name: "GPT-6.2 Sol", tag: "Balanced", task: "Chat + coding" },
    { id: "gpt-6.1-terra", name: "GPT-6.1 Terra", tag: "Fast", task: "Everyday tasks" }
  ]},
  { id: "anthropic", name: "Anthropic", baseUrl: "https://api.anthropic.com/v1", env: "ANTHROPIC_API_KEY", models: [
    { id: "claude-opus-5-5", name: "Claude Opus 5.5", tag: "Flagship", task: "Complex coding + agents" },
    { id: "claude-sonnet-5", name: "Claude Sonnet 5", tag: "Coding", task: "Software engineering" },
    { id: "claude-haiku-4-5-20251001", name: "Claude Haiku 4.5", tag: "Fast", task: "Fast assistance" }
  ]},
  { id: "google", name: "Google", baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai", env: "GOOGLE_API_KEY", models: [
    { id: "gemini-3.8-flash", name: "Gemini 3.8 Flash", tag: "Fast", task: "Multimodal + coding" },
    { id: "gemini-3.1-pro-preview", name: "Gemini 3.1 Pro", tag: "Reasoning", task: "Complex analysis + coding" }
  ]},
  { id: "deepseek", name: "DeepSeek", baseUrl: "https://api.deepseek.com/v1", env: "DEEPSEEK_API_KEY", models: [
    { id: "deepseek-v4-pro", name: "DeepSeek V4 Pro", tag: "Reasoning", task: "Advanced coding + math" },
    { id: "deepseek-v4", name: "DeepSeek V4", tag: "Fast", task: "Everyday coding" }
  ]},
  { id: "xai", name: "xAI", baseUrl: "https://api.x.ai/v1", env: "XAI_API_KEY", models: [
    { id: "grok-4.6", name: "Grok 4.6", tag: "Flagship", task: "Reasoning + coding" },
    { id: "grok-4.3", name: "Grok 4.3", tag: "Fast", task: "Chat + coding" }
  ]},
  { id: "mistral", name: "Mistral", baseUrl: "https://api.mistral.ai/v1", env: "MISTRAL_API_KEY", models: [
    { id: "mistral-large-2512", name: "Mistral Large", tag: "Flagship", task: "Reasoning + coding" },
    { id: "codestral-latest", name: "Codestral", tag: "Coding", task: "Code completion + debugging" }
  ]},
  { id: "cerebras", name: "Cerebras", baseUrl: "https://api.cerebras.ai/v1", env: "CEREBRAS_API_KEY", models: [
    { id: "gpt-oss-120b", name: "GPT-OSS 120B", tag: "Fast inference", task: "Reasoning + coding" }
  ]}
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const requestedModel = typeof body.model === "string" ? body.model : "openai/gpt-oss-120b";
    const provider = providers.find(p => p.models.some(m => m.id === requestedModel));
    if (!provider) return Response.json({ error: "That model is not in KRUSHY AI's supported model catalogue." }, { status: 400 });
    const key = process.env[provider.env];
    if (!key) return Response.json({ error: `${provider.name} is not connected yet. Add ${provider.env} in your hosting environment variables, then redeploy. API keys must stay server-side.` }, { status: 503 });

    const messages = Array.isArray(body.messages) ? body.messages.slice(-30) : [];
    if (!messages.length || !messages.every((m: any) => ["user", "assistant"].includes(m?.role) && typeof m?.content === "string")) {
      return Response.json({ error: "Send a valid chat message first." }, { status: 400 });
    }
    const system = body.mode === "code"
      ? "You are KRUSHY AI Code Studio, an expert senior software engineer and coding partner. Produce complete, runnable solutions with file paths, explain important decisions, debug carefully, review for security and performance, and state assumptions. Never claim to have edited a repository, run code, or deployed anything unless tools actually did it. When asked for a project, give a coherent implementation rather than fragments."
      : "You are KRUSHY AI, a highly capable general assistant. Be accurate, direct, thoughtful and useful. Do not invent facts or claim tools or capabilities you do not have.";

    if (provider.id === "anthropic") {
      const anthropic = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "Content-Type": "application/json" },
        body: JSON.stringify({
          model: requestedModel,
          max_tokens: 8192,
          system,
          messages,
          stream: true
        }),
        signal: req.signal
      });
      if (!anthropic.ok) {
        const detail = await anthropic.text();
        return Response.json({ error: `Anthropic returned ${anthropic.status}: ${detail.slice(0, 700)}` }, { status: anthropic.status });
      }
      if (!anthropic.body) return Response.json({ error: "Anthropic returned an empty response." }, { status: 502 });
      const decoder = new TextDecoder();
      const encoder = new TextEncoder();
      let buffer = "";
      const stream = new ReadableStream({
        async start(controller) {
          const reader = anthropic.body!.getReader();
          try {
            while (true) {
              const { value, done } = await reader.read();
              if (done) break;
              buffer += decoder.decode(value, { stream: true });
              const events = buffer.split("\\n\\n");
              buffer = events.pop() || "";
              for (const event of events) {
                const dataLine = event.split("\\n").find(line => line.startsWith("data:"));
                if (!dataLine) continue;
                try {
                  const payload = JSON.parse(dataLine.slice(5).trim());
                  if (payload.type === "content_block_delta" && payload.delta?.type === "text_delta") {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ choices: [{ delta: { content: payload.delta.text } }] })}\\n\\n`));
                  }
                } catch {}
              }
            }
            controller.enqueue(encoder.encode("data: [DONE]\\n\\n"));
            controller.close();
          } catch (error) {
            controller.error(error);
          } finally {
            reader.releaseLock();
          }
        }
      });
      return new Response(stream, { headers: { "Content-Type": "text/event-stream; charset=utf-8", "Cache-Control": "no-cache, no-transform", "X-Accel-Buffering": "no" } });
    }

    const upstream = await fetch(`${provider.baseUrl}/chat/completions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: requestedModel,
        messages: [{ role: "system", content: system }, ...messages],
        stream: true
      }),
      signal: req.signal
    });
    if (!upstream.ok) {
      const detail = await upstream.text();
      return Response.json({ error: `${provider.name} returned ${upstream.status}: ${detail.slice(0, 700)}` }, { status: upstream.status });
    }
    if (!upstream.body) return Response.json({ error: "The AI provider returned an empty response." }, { status: 502 });
    return new Response(upstream.body, { headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no"
    }});
  } catch {
    return Response.json({ error: "KRUSHY AI could not process that request. Please try again." }, { status: 500 });
  }
}
