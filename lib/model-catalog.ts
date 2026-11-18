export type ModelEntry = {
  id: string; plan: "free" | "pro"; name: string; maker: string; task: string;
  category: "chat" | "code" | "both"; github: string; modelId: string;
  fallbackModelIds: string[]; note: string; systemPrompt: string;
  promptSources: string[]; promptSourceModels: string[];
};

export const MODEL_CATALOG: ModelEntry[] = [
  { id:"slot-1-flagship", plan:"pro", name:"Claude Fable 5.2", maker:"Anthropic", task:"Highest-depth reasoning and long-horizon agentic coding", category:"both", github:"https://platform.claude.com/docs/en/models/overview", modelId:"claude-fable-5.2", fallbackModelIds:[], note:"PRO · $8 input / $40 output per million tokens. Provider billing applies.", promptSources:[], promptSourceModels:["Claude Fable 5.2"], systemPrompt:"You are the Claude Fable 5.2 profile in KRUSHYAI. Prioritize demanding reasoning, long-horizon agentic coding, architecture and careful multi-step implementation. Do not claim actual Anthropic access unless the routed model confirms it." },
  { id:"slot-2-writing", plan:"pro", name:"GPT-6.2 Astra", maker:"OpenAI", task:"Flagship reasoning, advanced coding and complex project work", category:"both", github:"https://developers.openai.com/api/docs/models", modelId:"gpt-6.2-astra", fallbackModelIds:[], note:"PRO · $8 input / $40 output per million tokens at standard rates. Provider billing applies.", promptSources:[], promptSourceModels:["GPT-6.2 Astra"], systemPrompt:"You are the GPT-6.2 Astra profile in KRUSHYAI. Focus on the hardest reasoning, full-project engineering, careful code review and complex planning. Do not claim actual OpenAI access unless the routed model confirms it." },
  { id:"slot-3-multimodal", plan:"pro", name:"Claude Opus 5.5", maker:"Anthropic", task:"Long-running agentic coding and knowledge work", category:"both", github:"https://platform.claude.com/docs/en/models/overview", modelId:"claude-opus-5.5", fallbackModelIds:[], note:"PRO · $4 input / $20 output per million tokens. Provider billing applies.", promptSources:[], promptSourceModels:["Claude Opus 5.5"], systemPrompt:"You are the Claude Opus 5.5 profile in KRUSHYAI. Focus on reliable repository-level coding, multi-step engineering, analysis and knowledge work. Do not claim actual Anthropic access unless the routed model confirms it." },
  { id:"slot-4-coding", plan:"pro", name:"Gemini 4 Argon", maker:"Google", task:"Frontier reasoning and complex real-world software engineering", category:"both", github:"https://ai.google.dev/gemini-api/docs/models", modelId:"gemini-4-argon", fallbackModelIds:[], note:"PRO · Paid API tier only; price depends on token and context tier. Provider billing applies.", promptSources:[], promptSourceModels:["Gemini 4 Argon"], systemPrompt:"You are the Gemini 4 Argon profile in KRUSHYAI. Focus on complex software engineering, deep multi-step reasoning and large-context analysis. Only handle images if the configured endpoint supports image input." },
  { id:"slot-5-fast", plan:"free", name:"GPT-6.2 Sol", maker:"OpenAI", task:"Balanced everyday coding, reasoning and implementation", category:"both", github:"https://developers.openai.com/api/docs/models", modelId:"gpt-6.2-sol", fallbackModelIds:[], note:"FREE PLAN · $2 input / $10 output per million tokens at standard rates. API usage is not free.", promptSources:[], promptSourceModels:["GPT-6.2 Sol"], systemPrompt:"You are the GPT-6.2 Sol profile in KRUSHYAI. Deliver strong everyday coding, practical reasoning, implementation and fast iteration. Do not claim actual OpenAI access unless the routed model confirms it." },
  { id:"slot-6-research", plan:"free", name:"Claude Sonnet 5.5", maker:"Anthropic", task:"Strong coding quality with a speed and intelligence balance", category:"both", github:"https://platform.claude.com/docs/en/models/overview", modelId:"claude-sonnet-5.5", fallbackModelIds:[], note:"FREE PLAN · $2 input / $10 output per million tokens. API usage is not free.", promptSources:[], promptSourceModels:["Claude Sonnet 5.5"], systemPrompt:"You are the Claude Sonnet 5.5 profile in KRUSHYAI. Balance speed and intelligence for code generation, debugging, clear writing and everyday agent tasks. Do not claim actual Anthropic access unless the routed model confirms it." },
  { id:"slot-7-vision", plan:"free", name:"Gemini 3.8 Flash", maker:"Google", task:"Long-horizon coding, autonomous workflows and multimodal tasks", category:"both", github:"https://ai.google.dev/gemini-api/docs/models", modelId:"gemini-3.8-flash", fallbackModelIds:[], note:"FREE PLAN · Free-tier availability depends on Google API limits and region; paid usage may apply.", promptSources:[], promptSourceModels:["Gemini 3.8 Flash"], systemPrompt:"You are the Gemini 3.8 Flash profile in KRUSHYAI. Focus on fast but capable coding, autonomous workflows and multimodal reasoning where the endpoint supports it. Be explicit about tool and image limitations." },
  { id:"slot-8-agents", plan:"pro", name:"DeepSeek V4 Pro", maker:"DeepSeek", task:"High-value advanced reasoning and demanding technical coding", category:"both", github:"https://api-docs.deepseek.com/api/list-models/", modelId:"deepseek-v4-pro-0813", fallbackModelIds:[], note:"PRO · API usage billed by DeepSeek; pricing varies by peak/off-peak schedule.", promptSources:[], promptSourceModels:["DeepSeek V4 Pro"], systemPrompt:"You are the DeepSeek V4 Pro profile in KRUSHYAI. Focus on hard technical reasoning, complex coding, math and long multi-step tasks. Do not claim access to tools not supplied by the runtime." },
  { id:"slot-9-math-science", plan:"free", name:"DeepSeek V4.1 Flash", maker:"DeepSeek", task:"Fast, cost-efficient coding and general agent workflows", category:"both", github:"https://api-docs.deepseek.com/api/list-models/", modelId:"deepseek-v4.1-flash", fallbackModelIds:[], note:"FREE PLAN · Low-cost paid API; free usage is not guaranteed.", promptSources:[], promptSourceModels:["DeepSeek V4.1 Flash"], systemPrompt:"You are the DeepSeek V4.1 Flash profile in KRUSHYAI. Optimize for efficient coding, fast answers, tool-oriented plans and concise technical reasoning." },
  { id:"slot-10-backup", plan:"pro", name:"Gemini 4 Carbon", maker:"Google", task:"Frontier multimodal reasoning and advanced engineering", category:"both", github:"https://ai.google.dev/gemini-api/docs/models", modelId:"gemini-4-carbon", fallbackModelIds:[], note:"PRO · Paid API tier; pricing depends on token and context tier. Provider billing applies.", promptSources:[], promptSourceModels:["Gemini 4 Carbon"], systemPrompt:"You are the Gemini 4 Carbon profile in KRUSHYAI. Focus on frontier-level multimodal reasoning, complex software engineering and difficult real-world tasks. Only process images if the configured endpoint supports image input." }
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
