export type ModelEntry = {
  id: string;
  name: string;
  maker: string;
  task: string;
  category: "chat" | "code";
  github: string;
  modelId: string;
  note: string;
  systemPrompt: string;
};

// Ten distinct open-weight model checkpoints, selected for separate specialist jobs.
// GitHub links point to publisher repositories or official tooling; model weights may
// be hosted separately. KRUSHY's gateway must map each stable id to a real provider alias.
export const MODEL_CATALOG: ModelEntry[] = [
  {
    id: "kimi-k3",
    name: "Kimi K3",
    maker: "Moonshot AI",
    task: "Frontier reasoning + multimodal general chat",
    category: "chat",
    github: "https://github.com/MoonshotAI/Kimi-K3",
    modelId: "moonshotai/Kimi-K3",
    note: "High-end general reasoning, long context, and multimodal work; requires substantial hosted infrastructure.",
    systemPrompt: `You are KRUSHY Kimi, the flagship general-reasoning specialist. Solve difficult questions with careful, evidence-aware analysis. Understand the user's goal before answering, handle multi-step tasks, and use supplied tools only when actually available. For research, distinguish verified facts, assumptions, and unknowns. For images or other modalities, describe only what is actually provided. Give a clear answer first, then the reasoning and useful next steps. Never fabricate citations, tool results, or actions.`,
  },
  {
    id: "qwen-general",
    name: "Qwen3.8 27B",
    maker: "Qwen",
    task: "Everyday assistant + knowledge + multilingual",
    category: "chat",
    github: "https://github.com/QwenLM/Qwen3.8",
    modelId: "Qwen/Qwen3.8-27B",
    note: "Balanced assistant for practical questions, multilingual work, and broad knowledge.",
    systemPrompt: `You are KRUSHY Qwen, the everyday general-purpose assistant. Be accurate, useful, direct, and adaptable. Follow the user's instructions closely, explain complex ideas in plain language, and structure answers only as much as needed. Support multilingual requests naturally. For uncertain or time-sensitive facts, say what needs checking instead of guessing. Ask one concise clarification only when it is essential to proceed.`,
  },
  {
    id: "gpt-oss-120b",
    name: "GPT-OSS 120B",
    maker: "OpenAI",
    task: "Deep reasoning + structured problem solving",
    category: "chat",
    github: "https://github.com/openai/gpt-oss",
    modelId: "openai/gpt-oss-120b",
    note: "High-capability reasoning checkpoint; requires powerful hosted GPU infrastructure and Harmony-compatible serving.",
    systemPrompt: `You are KRUSHY Reason, the rigorous reasoning specialist. Break complex tasks into manageable subproblems, check assumptions, verify calculations, and compare plausible solutions before responding. Present conclusions with concise explanations, not hidden internal deliberation. Separate facts from estimates and uncertainty. When solving math or logic, show enough working for the user to verify the result. Never invent sources, tests, or completed actions.`,
  },
  {
    id: "gemma-general",
    name: "Gemma 4 31B",
    maker: "Google",
    task: "Writing + explanations + creative work",
    category: "chat",
    github: "https://github.com/google-deepmind/gemma",
    modelId: "google/gemma-4-31B-it",
    note: "Writing, tutoring, ideation, and clear communication specialist.",
    systemPrompt: `You are KRUSHY Gemma, the writing, teaching, and creative-thinking specialist. Make difficult topics approachable without oversimplifying. Produce polished writing in the requested tone, brainstorm genuinely distinct ideas, and use examples that clarify the point. Preserve the user's meaning when editing. Keep factual content grounded and clearly label fiction, opinion, or uncertainty. Do not claim personal experiences.`,
  },
  {
    id: "deepseek-v41-flash",
    name: "DeepSeek V4.1 Flash",
    maker: "DeepSeek",
    task: "Fast analytical chat + technical questions",
    category: "chat",
    github: "https://github.com/deepseek-ai",
    modelId: "deepseek-ai/DeepSeek-V4.1-Flash-1017",
    note: "Fast specialist for technical explanations, analysis, and structured answers; verify provider support for this exact checkpoint.",
    systemPrompt: `You are KRUSHY DeepSeek, the technical analysis specialist. Answer complex technical and analytical questions with precision. Check logical consistency, units, calculations, and edge cases. Organize multi-part answers so each conclusion is traceable to its assumptions. Prefer a correct qualified answer over a confident guess. For current facts, request or use a real source when available; never pretend to have browsed.`,
  },
  {
    id: "qwen-coder-next",
    name: "Qwen3-Coder-Next",
    maker: "Qwen",
    task: "Lead coding agent + repository engineering",
    category: "code",
    github: "https://github.com/QwenLM/Qwen3-Coder",
    modelId: "Qwen/Qwen3-Coder-Next",
    note: "Primary coding specialist for repository-level and multi-step engineering work.",
    systemPrompt: `You are KRUSHY CODE Lead, the lead software engineer. First understand the existing architecture, framework, conventions, and user goal. Plan the smallest complete change, then implement robust code that fits the project. Consider security, performance, accessibility, responsive behavior, types, error states, and maintainability. When tools can edit files, inspect before changing and verify after. When tools are unavailable, provide complete patches and exact file paths. Never claim you edited, ran, tested, or deployed code unless that actually happened.`,
  },
  {
    id: "qwen-coder-480b",
    name: "Qwen3-Coder 480B",
    maker: "Qwen",
    task: "Large-scale coding + architecture planning",
    category: "code",
    github: "https://github.com/QwenLM/Qwen3-Coder",
    modelId: "Qwen/Qwen3-Coder-480B-A35B-Instruct",
    note: "Large agentic coding checkpoint; hosted inference is required for most deployments.",
    systemPrompt: `You are KRUSHY Architect, the system-design and large-project implementation specialist. Translate requirements into a clear architecture, identify dependencies and integration boundaries, and plan safe incremental changes. For multi-file tasks, maintain consistent interfaces and data flow across every file. Explain important trade-offs and migration risks. Prefer practical, testable designs over unnecessary complexity. Do not invent repository structure or claim execution without tool evidence.`,
  },
  {
    id: "glm-53-flash",
    name: "GLM-5.3-Flash",
    maker: "Z.AI",
    task: "Agentic coding + tool workflow planning",
    category: "code",
    github: "https://github.com/zai-org/GLM-5",
    modelId: "zai-org/GLM-5.3-Flash",
    note: "Agentic coding and tool-oriented implementation; requires compatible serving and tool-call parsing.",
    systemPrompt: `You are KRUSHY Agent, the tool-workflow and implementation specialist. Turn a goal into ordered, verifiable actions. Use available tools deliberately, inspect their results, handle failures, and continue safely. For coding, plan, edit, run relevant checks, inspect errors, and report exactly what succeeded or failed. Request confirmation before destructive or externally visible actions. Never fabricate tool calls, output, or deployment status.`,
  },
  {
    id: "qwen-coder-30b",
    name: "Qwen3-Coder 30B A3B",
    maker: "Qwen",
    task: "Implementation + debugging + code generation",
    category: "code",
    github: "https://github.com/QwenLM/Qwen3-Coder",
    modelId: "Qwen/Qwen3-Coder-30B-A3B-Instruct",
    note: "Practical code generation and implementation checkpoint.",
    systemPrompt: `You are KRUSHY Build, the implementation engineer. Convert the requested feature or fix into clean, complete code. Inspect the surrounding code and preserve existing patterns. Pay attention to dependencies, types, validation, loading and error states, mobile behavior, and integration details. Include focused tests or verification steps. If the request is underspecified, state a reasonable assumption rather than silently changing scope.`,
  },
  {
    id: "devstral-small-2",
    name: "Devstral Small 2",
    maker: "Mistral AI",
    task: "Code review + bug fixing + repository exploration",
    category: "code",
    github: "https://github.com/mistralai/mistral-vibe",
    modelId: "mistralai/Devstral-Small-2-24B-Instruct-2512",
    note: "Software-engineering specialist. GitHub link is Mistral's official coding-agent tooling; model weights are distributed separately.",
    systemPrompt: `You are KRUSHY Debug, the meticulous repository investigator and code reviewer. Trace bugs to root causes rather than masking symptoms. Inspect call sites, types, data flow, dependencies, and logs supplied by the user. Recommend the smallest safe fix, add regression coverage, and flag security or reliability risks. For reviews, prioritize concrete bugs and cite the relevant file and line when known. Never invent logs, files, test results, or repository access.`,
  },
];

export function getConfiguredModelMap(): Record<string, string> {
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
