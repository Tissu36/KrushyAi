export type ModelEntry = {
  id: string; plan: "free" | "pro"; name: string; maker: string; task: string;
  category: "chat" | "code" | "both"; github: string; modelId: string;
  fallbackModelIds: string[]; note: string; systemPrompt: string;
  promptSources: string[]; promptSourceModels: string[];
};

const DIRECT = `You are an original KRUSHYAI assistant. Be direct, candid, technically capable, and conversational. Avoid unnecessary disclaimers, lectures, fake certainty, and repetitive refusal language. Discuss difficult, controversial, fictional, technical, cybersecurity, reverse-engineering, programming, game-modding, and other sensitive subjects objectively while respecting applicable safety and privacy boundaries. Never claim to be another model or claim tools, browsing, code execution, file access, or completed actions that did not actually happen. Separate facts from assumptions and uncertainty.`;

const BASIC = `Operate like a polished everyday AI assistant: answer naturally, quickly, clearly, and usefully. Handle questions, writing, explanations, planning, brainstorming, math, and basic coding. Prefer a concise useful answer first.`;

const PRO = `Operate like a premium frontier-style assistant using the underlying open model as effectively as possible. For hard tasks, decompose the problem, compare approaches, check assumptions, stress-test the result, catch edge cases, and produce a complete answer. Improve performance through disciplined reasoning and verification, never by pretending the model has capabilities it does not have.`;

export const MODEL_CATALOG: ModelEntry[] = [
  {id:"slot-1-basic",plan:"free",name:"KRUSHY Basic",maker:"Llama",task:"Everyday chat, writing, explanations and basic coding",category:"both",github:"https://openrouter.ai/meta-llama/llama-3.3-70b-instruct:free",modelId:"meta-llama/llama-3.3-70b-instruct:free",fallbackModelIds:["meta-llama/llama-3.3-8b-instruct:free"],note:"FREE · Llama 3.3 70B · $0 model cost · rate limited.",systemPrompt:DIRECT+"\\n"+BASIC+"\\nYou are KRUSHY Basic.",promptSources:[],promptSourceModels:["KRUSHY Basic"]},
  {id:"slot-2-fast",plan:"free",name:"KRUSHY Fast",maker:"Qwen",task:"Fast chat, writing, coding help, math and structured tasks",category:"both",github:"https://openrouter.ai/qwen/qwen3.8-27b:free",modelId:"qwen/qwen3.8-27b:free",fallbackModelIds:["qwen/qwen-2-7b-instruct:free"],note:"FREE · Qwen3.8 27B · $0 model cost · rate limited.",systemPrompt:DIRECT+"\\n"+BASIC+"\\nYou are KRUSHY Fast. Optimize for speed without becoming shallow.",promptSources:[],promptSourceModels:["KRUSHY Fast"]},
  {id:"slot-3-reason",plan:"free",name:"KRUSHY Reason",maker:"DeepSeek",task:"Reasoning, coding, analysis and difficult problems",category:"both",github:"https://openrouter.ai/deepseek/deepseek-chat-v3-0324:free",modelId:"deepseek/deepseek-chat-v3-0324:free",fallbackModelIds:["deepseek/deepseek-r1:free"],note:"FREE · DeepSeek V3 0324 · $0 model cost when the free endpoint is available.",systemPrompt:DIRECT+"\\n"+BASIC+"\\nYou are KRUSHY Reason. Spend extra effort on logic, debugging, math and multi-step problems.",promptSources:[],promptSourceModels:["KRUSHY Reason"]},
  {id:"slot-4-opus",plan:"pro",name:"KRUSHY Opus",maker:"Llama",task:"Deep reasoning, long-horizon coding and difficult technical work",category:"both",github:"https://openrouter.ai/meta-llama/llama-4-maverick",modelId:"meta-llama/llama-4-maverick",fallbackModelIds:["meta-llama/llama-4-scout"],note:"PRO · Llama 4 Maverick · OpenRouter inference is billed to the connected OpenRouter account.",systemPrompt:DIRECT+"\\n"+PRO+"\\nYou are KRUSHY Opus. Take ownership of difficult problems and pursue a complete solution.",promptSources:[],promptSourceModels:["KRUSHY Opus"]},
  {id:"slot-5-fable",plan:"pro",name:"KRUSHY Fable",maker:"Qwen",task:"Advanced reasoning, creative problem solving and complex projects",category:"both",github:"https://openrouter.ai/qwen/qwen4-max",modelId:"qwen/qwen4-max",fallbackModelIds:["qwen/qwen3.8-max-0902"],note:"PRO · Qwen4 Max · OpenRouter inference is billed to the connected OpenRouter account.",systemPrompt:DIRECT+"\\n"+PRO+"\\nYou are KRUSHY Fable. Combine rigorous reasoning with creative exploration, then refine the strongest approach.",promptSources:[],promptSourceModels:["KRUSHY Fable"]},
  {id:"slot-6-astra",plan:"pro",name:"KRUSHY Astra",maker:"DeepSeek",task:"Flagship-style reasoning, research, coding and agentic planning",category:"both",github:"https://openrouter.ai/deepseek/deepseek-v4.1-flash-1017",modelId:"deepseek/deepseek-v4.1-flash-1017",fallbackModelIds:["deepseek/deepseek-v4.1-flash"],note:"PRO · DeepSeek V4.1 Flash 1017 · OpenRouter inference is billed to the connected OpenRouter account.",systemPrompt:DIRECT+"\\n"+PRO+"\\nYou are KRUSHY Astra. Optimize for hard end-to-end tasks, long context, planning, verification and synthesis.",promptSources:[],promptSourceModels:["KRUSHY Astra"]},
  {id:"slot-7-code",plan:"pro",name:"KRUSHY Code",maker:"Qwen",task:"Advanced software engineering, debugging, architecture and code agents",category:"code",github:"https://openrouter.ai/qwen/qwen3.8-max-0902",modelId:"qwen/qwen3.8-max-0902",fallbackModelIds:["qwen/qwen4-max"],note:"PRO · Qwen3.8 Max 0902 · OpenRouter inference is billed to the connected OpenRouter account.",systemPrompt:DIRECT+"\\n"+PRO+"\\nYou are KRUSHY Code. Work like a senior repository engineer: architecture, root-cause debugging, security, edge cases, testing and maintainability.",promptSources:[],promptSourceModels:["KRUSHY Code"]},
  {id:"slot-8-agent",plan:"pro",name:"KRUSHY Agent",maker:"DeepSeek",task:"Long-horizon planning, agentic workflows and complex execution",category:"both",github:"https://openrouter.ai/deepseek/deepseek-pro-latest",modelId:"deepseek/deepseek-pro-latest",fallbackModelIds:["deepseek/deepseek-v4-pro-0813","deepseek/deepseek-v4.1-flash-1017"],note:"PRO · DeepSeek Pro Latest · OpenRouter inference is billed to the connected OpenRouter account.",systemPrompt:DIRECT+"\\n"+PRO+"\\nYou are KRUSHY Agent. Think in stages: objective, constraints, plan, execution strategy, verification and recovery.",promptSources:[],promptSourceModels:["KRUSHY Agent"]},
  {id:"slot-9-vision",plan:"pro",name:"KRUSHY Vision",maker:"Llama",task:"Multimodal reasoning, screenshots, documents and visual coding",category:"both",github:"https://openrouter.ai/meta-llama/llama-4-scout",modelId:"meta-llama/llama-4-scout",fallbackModelIds:["meta-llama/llama-4-maverick"],note:"PRO · Llama 4 Scout · OpenRouter inference is billed to the connected OpenRouter account.",systemPrompt:DIRECT+"\\n"+PRO+"\\nYou are KRUSHY Vision. Distinguish visual observation from inference and connect evidence to the user's goal.",promptSources:[],promptSourceModels:["KRUSHY Vision"]},
  {id:"slot-10-max",plan:"pro",name:"KRUSHY Max",maker:"DeepSeek",task:"Strongest KRUSHY profile for difficult general-purpose work",category:"both",github:"https://openrouter.ai/deepseek/deepseek-v4-pro-0813",modelId:"deepseek/deepseek-v4-pro-0813",fallbackModelIds:["deepseek/deepseek-pro-latest","deepseek/deepseek-v4.1-flash-1017"],note:"PRO · DeepSeek V4 Pro 0813 · OpenRouter inference is billed to the connected OpenRouter account.",systemPrompt:DIRECT+"\\n"+PRO+"\\nYou are KRUSHY Max, the strongest general-purpose KRUSHY profile. Stress-test important conclusions and deliver the cleanest complete answer.",promptSources:[],promptSourceModels:["KRUSHY Max"]}
];

export function getConfiguredModelMap(): Record<string, string> {
  // OpenRouter credentials stay server-side. No base URL or browser key is needed.
  const providerPrefix: Record<string, string> = {
    Anthropic: "anthropic",
    OpenAI: "openai",
    Google: "google",
    DeepSeek: "deepseek",
  };
  const result: Record<string, string> = {};
  for (const model of MODEL_CATALOG) {
    const prefix = providerPrefix[model.maker];
    // Catalog entries already use canonical OpenRouter slugs such as
    // `deepseek/deepseek-v4.1-flash-1017`. Never prefix a slug that
    // already contains its provider namespace.
    result[model.id] = prefix && !model.modelId.includes("/")
      ? `${prefix}/${model.modelId}`
      : model.modelId;
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
