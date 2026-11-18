export type ModelEntry = {
  id: string; plan: "free" | "pro"; name: string; maker: string; task: string;
  category: "chat" | "code" | "both"; github: string; modelId: string;
  fallbackModelIds: string[]; note: string; systemPrompt: string;
  promptSources: string[]; promptSourceModels: string[];
};

export const MODEL_CATALOG: ModelEntry[] = [
  { id:"slot-1-flagship", plan:"free", name:"KRUSHY Prime", maker:"KRUSHY", task:"Highest-depth reasoning and long-horizon agentic coding", category:"both", github:"https://platform.claude.com/docs/en/models/overview", modelId:"claude-fable-5.2", fallbackModelIds:[], note:"FREE ROUTED · Uses OpenRouter free-model routing. Rate limits and provider availability apply.", promptSources:[], promptSourceModels:["Claude Fable 5.2"], systemPrompt:"You are KRUSHY Prime, a specialist KRUSHYAI assistant. Operate with top-tier discipline: plan complex work, check assumptions, solve carefully, verify the result, and present a complete useful answer. Be honest about uncertainty and never claim tools or capabilities you do not have." },
  { id:"slot-2-writing", plan:"free", name:"KRUSHY Writer", maker:"KRUSHY", task:"Flagship reasoning, advanced coding and complex project work", category:"both", github:"https://developers.openai.com/api/docs/models", modelId:"gpt-6.2-astra", fallbackModelIds:[], note:"FREE ROUTED · Uses OpenRouter free-model routing. Rate limits and provider availability apply.", promptSources:[], promptSourceModels:["GPT-6.2 Astra"], systemPrompt:"You are KRUSHY Writer, a specialist KRUSHYAI assistant. Operate with top-tier discipline: plan complex work, check assumptions, solve carefully, verify the result, and present a complete useful answer. Be honest about uncertainty and never claim tools or capabilities you do not have." },
  { id:"slot-3-multimodal", plan:"free", name:"KRUSHY Vision Pro", maker:"KRUSHY", task:"Long-running agentic coding and knowledge work", category:"both", github:"https://platform.claude.com/docs/en/models/overview", modelId:"claude-opus-5.5", fallbackModelIds:[], note:"FREE ROUTED · Uses OpenRouter free-model routing. Rate limits and provider availability apply.", promptSources:[], promptSourceModels:["Claude Opus 5.5"], systemPrompt:"You are KRUSHY Vision Pro, a specialist KRUSHYAI assistant. Operate with top-tier discipline: plan complex work, check assumptions, solve carefully, verify the result, and present a complete useful answer. Be honest about uncertainty and never claim tools or capabilities you do not have." },
  { id:"slot-4-coding", plan:"free", name:"KRUSHY Code", maker:"KRUSHY", task:"Frontier reasoning and complex real-world software engineering", category:"both", github:"https://ai.google.dev/gemini-api/docs/models", modelId:"gemini-4-argon", fallbackModelIds:[], note:"FREE ROUTED · Uses OpenRouter free-model routing. Rate limits and provider availability apply.", promptSources:[], promptSourceModels:["Gemini 4 Argon"], systemPrompt:"You are KRUSHY Code, a specialist KRUSHYAI assistant. Operate with top-tier discipline: plan complex work, check assumptions, solve carefully, verify the result, and present a complete useful answer. Be honest about uncertainty and never claim tools or capabilities you do not have." },
  { id:"slot-5-fast", plan:"free", name:"KRUSHY Fast", maker:"KRUSHY", task:"Balanced everyday coding, reasoning and implementation", category:"both", github:"https://developers.openai.com/api/docs/models", modelId:"gpt-6.2-sol", fallbackModelIds:[], note:"FREE ROUTED · Uses OpenRouter free-model routing. Rate limits and provider availability apply.", promptSources:[], promptSourceModels:["GPT-6.2 Sol"], systemPrompt:"You are KRUSHY Fast, a specialist KRUSHYAI assistant. Operate with top-tier discipline: plan complex work, check assumptions, solve carefully, verify the result, and present a complete useful answer. Be honest about uncertainty and never claim tools or capabilities you do not have." },
  { id:"slot-6-research", plan:"free", name:"KRUSHY Research", maker:"KRUSHY", task:"Strong coding quality with a speed and intelligence balance", category:"both", github:"https://platform.claude.com/docs/en/models/overview", modelId:"claude-sonnet-5.5", fallbackModelIds:[], note:"FREE ROUTED · Uses OpenRouter free-model routing. Rate limits and provider availability apply.", promptSources:[], promptSourceModels:["Claude Sonnet 5.5"], systemPrompt:"You are KRUSHY Research, a specialist KRUSHYAI assistant. Operate with top-tier discipline: plan complex work, check assumptions, solve carefully, verify the result, and present a complete useful answer. Be honest about uncertainty and never claim tools or capabilities you do not have." },
  { id:"slot-7-vision", plan:"free", name:"KRUSHY Vision Lite", maker:"KRUSHY", task:"Long-horizon coding, autonomous workflows and multimodal tasks", category:"both", github:"https://ai.google.dev/gemini-api/docs/models", modelId:"gemini-3.8-flash", fallbackModelIds:[], note:"FREE ROUTED · Uses OpenRouter free-model routing. Rate limits and provider availability apply.", promptSources:[], promptSourceModels:["Gemini 3.8 Flash"], systemPrompt:"You are KRUSHY Vision Lite, a specialist KRUSHYAI assistant. Operate with top-tier discipline: plan complex work, check assumptions, solve carefully, verify the result, and present a complete useful answer. Be honest about uncertainty and never claim tools or capabilities you do not have." },
  { id:"slot-8-agents", plan:"free", name:"KRUSHY Agent", maker:"KRUSHY", task:"High-value advanced reasoning and demanding technical coding", category:"both", github:"https://api-docs.deepseek.com/api/list-models/", modelId:"deepseek-v4-pro-0813", fallbackModelIds:[], note:"FREE ROUTED · Uses OpenRouter free-model routing. Rate limits and provider availability apply.", promptSources:[], promptSourceModels:["DeepSeek V4 Pro"], systemPrompt:"You are KRUSHY Agent, a specialist KRUSHYAI assistant. Operate with top-tier discipline: plan complex work, check assumptions, solve carefully, verify the result, and present a complete useful answer. Be honest about uncertainty and never claim tools or capabilities you do not have." },
  { id:"slot-9-math-science", plan:"free", name:"KRUSHY Math", maker:"KRUSHY", task:"Fast, cost-efficient coding and general agent workflows", category:"both", github:"https://api-docs.deepseek.com/api/list-models/", modelId:"deepseek-v4.1-flash", fallbackModelIds:[], note:"FREE ROUTED · Uses OpenRouter free-model routing. Rate limits and provider availability apply.", promptSources:[], promptSourceModels:["DeepSeek V4.1 Flash"], systemPrompt:"You are KRUSHY Math, a specialist KRUSHYAI assistant. Operate with top-tier discipline: plan complex work, check assumptions, solve carefully, verify the result, and present a complete useful answer. Be honest about uncertainty and never claim tools or capabilities you do not have." },
  { id:"slot-10-backup", plan:"free", name:"KRUSHY Backup", maker:"KRUSHY", task:"Frontier multimodal reasoning and advanced engineering", category:"both", github:"https://ai.google.dev/gemini-api/docs/models", modelId:"gemini-4-carbon", fallbackModelIds:[], note:"FREE ROUTED · Uses OpenRouter free-model routing. Rate limits and provider availability apply.", promptSources:[], promptSourceModels:["Gemini 4 Carbon"], systemPrompt:"You are KRUSHY Backup, a specialist KRUSHYAI assistant. Operate with top-tier discipline: plan complex work, check assumptions, solve carefully, verify the result, and present a complete useful answer. Be honest about uncertainty and never claim tools or capabilities you do not have." }
];

export function getConfiguredModelMap(): Record<string, string> {
  // OpenRouter credentials stay server-side. No base URL or browser key is needed.
  if (!process.env.OPENROUTER_API_KEY) return {};
  const providerPrefix: Record<string, string> = {
    Anthropic: "anthropic",
    OpenAI: "openai",
    Google: "google",
    DeepSeek: "deepseek",
  };
  const result: Record<string, string> = {};
  for (const model of MODEL_CATALOG) {
    const prefix = providerPrefix[model.maker];
    result[model.id] = prefix ? `${prefix}/${model.modelId}` : model.modelId;
  }
  try {
    const parsed = JSON.parse(process.env.KRUSHY_MODEL_MAP || "{}");
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return result;
    const allowed = new Set(MODEL_CATALOG.map((m) => m.id));
    for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
      if (allowed.has(key) && typeof value === "string" && value.trim()) result[key] = value.trim();
    }
  } catch {
    // Keep the verified catalog defaults if the optional override is malformed.
  }
  return result;
}
