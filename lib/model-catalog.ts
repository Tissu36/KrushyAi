export type ModelEntry = {
  id: string;
  name: string;
  maker: string;
  task: string;
  category: "chat" | "code";
  github: string;
  modelId: string;
  note: string;
};

export const MODEL_CATALOG: ModelEntry[] = [
  { id: "gpt-oss-20b", name: "GPT-OSS 20B", maker: "OpenAI", task: "Reasoning + general chat", category: "chat", github: "https://github.com/openai/gpt-oss", modelId: "openai/gpt-oss-20b", note: "Smaller open-weight reasoning model" },
  { id: "qwen-general", name: "Qwen3.8 27B", maker: "Qwen", task: "Advanced general + agentic chat", category: "chat", github: "https://github.com/QwenLM/Qwen3.8", modelId: "Qwen/Qwen3.8-27B", note: "Latest Qwen open model family; substantial GPU memory required" },
  { id: "gemma-general", name: "Gemma 4", maker: "Google", task: "General + multimodal", category: "chat", github: "https://github.com/google-deepmind/gemma", modelId: "google/gemma-4-31B-it", note: "Open-weight family; gated terms may apply" },
  { id: "llama4-scout", name: "Llama 4 Scout", maker: "Meta", task: "Long-context general chat", category: "chat", github: "https://github.com/meta-llama/llama", modelId: "meta-llama/Llama-4-Scout-17B-16E-Instruct", note: "Large MoE; Meta license and access requirements apply" },
  { id: "deepseek-v3", name: "DeepSeek V3", maker: "DeepSeek", task: "Advanced reasoning + chat", category: "chat", github: "https://github.com/deepseek-ai/DeepSeek-V3", modelId: "deepseek-ai/DeepSeek-V3", note: "Very large MoE; requires substantial hosted compute" },
  { id: "qwen-coder-next", name: "Qwen3-Coder-Next", maker: "Qwen", task: "Agentic coding + repo work", category: "code", github: "https://github.com/QwenLM/Qwen3-Coder", modelId: "Qwen/Qwen3-Coder-Next", note: "Primary coding specialist; 256K context listed by project" },
  { id: "qwen-coder-30b", name: "Qwen3-Coder 30B A3B", maker: "Qwen", task: "Coding + tool use", category: "code", github: "https://github.com/QwenLM/Qwen3-Coder", modelId: "Qwen/Qwen3-Coder-30B-A3B-Instruct", note: "MoE coding model; substantial compute" },
  { id: "deepseek-coder-lite", name: "DeepSeek Coder V2 Lite", maker: "DeepSeek", task: "Code generation + debugging", category: "code", github: "https://github.com/deepseek-ai/DeepSeek-Coder-V2", modelId: "deepseek-ai/DeepSeek-Coder-V2-Lite-Instruct", note: "16B total / 2.4B active; 128K context in project docs" },
  { id: "gpt-oss-code", name: "GPT-OSS 20B Code", maker: "OpenAI", task: "Code + reasoning", category: "code", github: "https://github.com/openai/gpt-oss", modelId: "openai/gpt-oss-20b", note: "Dual-purpose open-weight model" },
  { id: "gemma-code", name: "Gemma 4 Code", maker: "Google", task: "Code + multimodal", category: "code", github: "https://github.com/google-deepmind/gemma", modelId: "google/gemma-4-31B-it", note: "General model used as a coding candidate; evaluate before relying on it" },
];

export function getConfiguredModelMap(): Record<string, string> {
  try {
    const parsed = JSON.parse(process.env.KRUSHY_MODEL_MAP || "{}");
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const allowed = new Set(MODEL_CATALOG.map((m) => m.id));
    return Object.fromEntries(Object.entries(parsed).filter(([key, value]) => allowed.has(key) && typeof value === "string" && value.trim()));
  } catch {
    return {};
  }
}
