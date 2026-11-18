export type ModelEntry = {
  id: string; plan: "free" | "pro"; name: string; maker: string; task: string;
  category: "chat" | "code" | "both"; github: string; modelId: string;
  fallbackModelIds: string[]; note: string; systemPrompt: string;
  promptSources: string[]; promptSourceModels: string[];
};

export const MODEL_CATALOG: ModelEntry[] = [
  {
    id: "slot-1-flagship", plan: "free", name: "Claude Fable 5.2",
    maker: "Anthropic", task: "Flagship autonomous coding and complex engineering", category: "both",
    github: "https://github.com/anthropics/anthropic-sdk-typescript", modelId: "", fallbackModelIds: [],
    note: "Profile available. Connect a verified provider model ID in KRUSHY_MODEL_MAP before use; this profile name is not a verified upstream model ID.",
    promptSources: [], promptSourceModels: ["Claude Fable 5.2 profile instructions"],
    systemPrompt: "You are the Claude Fable 5.2 profile in KRUSHYAI. Focus on software architecture, full-project implementation, debugging, and careful multi-step engineering. Treat the profile name as a user-selected persona, not proof of access to Anthropic's named model. Use only tools actually provided."
  },
  {
    id: "slot-2-writing", plan: "free", name: "Claude Opus 5.5",
    maker: "Anthropic", task: "Deep reasoning, analysis and polished writing", category: "both",
    github: "https://github.com/anthropics/anthropic-sdk-typescript", modelId: "", fallbackModelIds: [],
    note: "Profile available. Connect a verified provider model ID in KRUSHY_MODEL_MAP before use; this profile name is not a verified upstream model ID.",
    promptSources: [], promptSourceModels: ["Claude Opus 5.5 profile instructions"],
    systemPrompt: "You are the Claude Opus 5.5 profile in KRUSHYAI. Focus on careful reasoning summaries, nuanced analysis, strong writing, and complex problem decomposition. The profile label does not prove access to the named proprietary model."
  },
  {
    id: "slot-3-multimodal", plan: "free", name: "GPT-6.2 Astra",
    maker: "OpenAI", task: "Flagship reasoning, multimodal planning and coding", category: "both",
    github: "https://github.com/openai/openai-node", modelId: "", fallbackModelIds: [],
    note: "Profile available. Connect a verified provider model ID in KRUSHY_MODEL_MAP before use; this profile name is not a verified upstream model ID.",
    promptSources: [], promptSourceModels: ["GPT-6.2 Astra profile instructions"],
    systemPrompt: "You are the GPT-6.2 Astra profile in KRUSHYAI. Focus on advanced reasoning, multimodal tasks when supported by the actual endpoint, planning, and high-quality code. Do not claim to be the actual OpenAI model unless the configured endpoint confirms it."
  },
  {
    id: "slot-4-coding", plan: "free", name: "Kimi K3.1 Pro",
    maker: "Moonshot AI", task: "Long-context coding and repository analysis", category: "both",
    github: "https://platform.moonshot.ai/docs", modelId: "", fallbackModelIds: [],
    note: "Profile available. Connect a verified provider model ID in KRUSHY_MODEL_MAP before use; this profile name is not a verified upstream model ID.",
    promptSources: [], promptSourceModels: ["Kimi K3.1 Pro profile instructions"],
    systemPrompt: "You are the Kimi K3.1 Pro profile in KRUSHYAI. Focus on long-context analysis, repository-wide understanding, code generation, and careful technical explanations. Actual context limits depend on the configured model."
  },
  {
    id: "slot-5-fast", plan: "free", name: "GPT-6.2 Sol",
    maker: "OpenAI", task: "Fast general assistance and implementation", category: "both",
    github: "https://github.com/openai/openai-node", modelId: "", fallbackModelIds: [],
    note: "Profile available. Connect a verified provider model ID in KRUSHY_MODEL_MAP before use; this profile name is not a verified upstream model ID.",
    promptSources: [], promptSourceModels: ["GPT-6.2 Sol profile instructions"],
    systemPrompt: "You are the GPT-6.2 Sol profile in KRUSHYAI. Prioritize fast, clear, useful answers, rapid implementation, iteration, and practical debugging. The profile name is not evidence that a matching provider model is connected."
  },
  {
    id: "slot-6-research", plan: "free", name: "DeepSeek V4.1 Flash",
    maker: "DeepSeek", task: "Efficient coding, reasoning and technical research", category: "both",
    github: "https://api-docs.deepseek.com/", modelId: "", fallbackModelIds: [],
    note: "Profile available. Connect a verified provider model ID in KRUSHY_MODEL_MAP before use; this profile name is not a verified upstream model ID.",
    promptSources: [], promptSourceModels: ["DeepSeek V4.1 Flash profile instructions"],
    systemPrompt: "You are the DeepSeek V4.1 Flash profile in KRUSHYAI. Focus on efficient code generation, technical reasoning, debugging, and concise research synthesis. Do not claim provider access unless configured."
  },
  {
    id: "slot-7-vision", plan: "free", name: "Gemma 4 31B",
    maker: "Google", task: "General reasoning and vision when supported", category: "both",
    github: "https://github.com/googleapis/js-genai", modelId: "", fallbackModelIds: [],
    note: "Profile available. Connect a verified provider model ID in KRUSHY_MODEL_MAP before use; this profile name is not a verified upstream model ID.",
    promptSources: [], promptSourceModels: ["Gemma 4 31B profile instructions"],
    systemPrompt: "You are the Gemma 4 31B profile in KRUSHYAI. Provide clear general assistance, technical reasoning, and image analysis only if the configured endpoint actually supports image input. Do not claim unsupported vision capabilities."
  },
  {
    id: "slot-8-agents", plan: "free", name: "Mistral Small 4",
    maker: "Mistral AI", task: "Efficient engineering and agent workflows", category: "both",
    github: "https://docs.mistral.ai/", modelId: "", fallbackModelIds: [],
    note: "Profile available. Connect a verified provider model ID in KRUSHY_MODEL_MAP before use; this profile name is not a verified upstream model ID.",
    promptSources: [], promptSourceModels: ["Mistral Small 4 profile instructions"],
    systemPrompt: "You are the Mistral Small 4 profile in KRUSHYAI. Focus on efficient coding, structured planning, tool-use plans, and practical execution. Use tools only when the runtime actually supplies them."
  },
  {
    id: "slot-9-math-science", plan: "free", name: "MiMo-V2.6-Pro",
    maker: "Xiaomi", task: "Advanced problem solving and technical reasoning", category: "both",
    github: "https://www.mi.com/", modelId: "", fallbackModelIds: [],
    note: "Profile available. Connect a verified provider model ID in KRUSHY_MODEL_MAP before use; this profile name is not a verified upstream model ID.",
    promptSources: [], promptSourceModels: ["MiMo-V2.6-Pro profile instructions"],
    systemPrompt: "You are the MiMo-V2.6-Pro profile in KRUSHYAI. Focus on technical problem-solving, mathematics, science, and careful code analysis. Provide concise reasoning summaries and check calculations."
  },
  {
    id: "slot-10-backup", plan: "free", name: "GLM-5.3-Flash",
    maker: "Zhipu AI", task: "Low-latency general and coding assistance", category: "both",
    github: "https://open.bigmodel.cn/dev/api", modelId: "", fallbackModelIds: [],
    note: "Profile available. Connect a verified provider model ID in KRUSHY_MODEL_MAP before use; this profile name is not a verified upstream model ID.",
    promptSources: [], promptSourceModels: ["GLM-5.3-Flash profile instructions"],
    systemPrompt: "You are the GLM-5.3-Flash profile in KRUSHYAI. Focus on fast responses, coding assistance, summaries, and practical technical help. The profile label is not proof of a live model connection."
  }
];

export function getConfiguredModelMap(): Record<string, string> {
  const base = process.env.KRUSHY_MODEL_BASE_URL || "";
  if (!base) return {};
  if (base.includes("openrouter.ai") && !process.env.KRUSHY_MODEL_API_KEY) return {};
  try {
    const parsed = JSON.parse(process.env.KRUSHY_MODEL_MAP || "{}");
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const allowed = new Set(MODEL_CATALOG.map((m) => m.id));
    const result: Record<string, string> = {};
    for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
      if (allowed.has(key) && typeof value === "string" && value.trim()) result[key] = value.trim();
    }
    return result;
  } catch {
    return {};
  }
}
