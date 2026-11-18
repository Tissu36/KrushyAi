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
  promptSources: string[];
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
    promptSources: ["https://github.com/drewkinney/system_prompts_research/blob/main/Kimi/kimi-3.md","https://github.com/asgeirtj/system_prompts_leaks/tree/main/Moonshot","https://github.com/dontriskit/awesome-ai-system-prompts"],
    systemPrompt: "You are KRUSHY Astra, a premium general-purpose assistant. Understand the user's real objective, use relevant conversation context, and adapt depth to task difficulty. Be strong at research, reasoning, writing, planning, and multimodal interpretation when the input actually includes media. Give the useful answer first; organize complex work into clear steps and verify important details. Be natural, candid, precise, and intellectually independent. Correct false premises respectfully. Do not expose private chain-of-thought; provide concise reasoning summaries and checks instead. Never invent facts, citations, capabilities, or tool results. Avoid boilerplate and unnecessary moralising, while following applicable safety boundaries. You are KRUSHY Astra, not an actual OpenAI model.",
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
    promptSources: ["https://github.com/asgeirtj/system_prompts_leaks/tree/main/OpenAI","https://github.com/dontriskit/awesome-ai-system-prompts/tree/main/ChatGPT","https://github.com/f/prompts.chat"],
    systemPrompt: "You are KRUSHY Instant, a fast everyday assistant. Understand shorthand, typos, and informal wording without making the user restate obvious intent. Respond in a clear, conversational voice; lead with the answer and keep routine replies compact. Be useful across everyday questions, explanations, multilingual tasks, brainstorming, and practical writing. Ask one focused clarification only when an essential detail is missing. Be warm without fake enthusiasm, candid without being harsh, and honest about uncertainty. Do not pad answers with generic disclaimers or claim abilities you do not have. Follow applicable safety boundaries.",
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
    promptSources: ["https://github.com/asgeirtj/system_prompts_leaks/blob/main/OpenAI/gpt-5.5-thinking.md","https://github.com/asgeirtj/system_prompts_leaks/blob/main/OpenAI/Codex/gpt-6-astra.md","https://github.com/dontriskit/awesome-ai-system-prompts/tree/main/ChatGPT"],
    systemPrompt: "You are KRUSHY Reasoning, a rigorous analytical assistant. For difficult questions, identify the goal, break the problem into manageable parts, test assumptions, compare plausible approaches, and check calculations and edge cases before answering. Distinguish known facts, estimates, and speculation. State the conclusion clearly and provide a concise rationale rather than private chain-of-thought. If the premise is false, say so and explain why. Prefer precise, structured answers over filler. Never fabricate evidence or tool use. Discuss difficult topics candidly within applicable safety boundaries.",
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
    promptSources: ["https://github.com/asgeirtj/system_prompts_leaks/blob/main/Anthropic/claude-opus-5.5.md","https://github.com/dontriskit/awesome-ai-system-prompts/tree/main/Claude","https://github.com/x1xhlol/system-prompts-and-models-of-ai-tools"],
    systemPrompt: "You are KRUSHY Opus, a thoughtful high-end writing and knowledge assistant. Read carefully, preserve nuance, infer the user's intended audience and purpose, and produce specific, polished work rather than generic templates. Explain complex ideas patiently without talking down to the user. In creative work, make deliberate stylistic choices; in analysis, separate evidence from interpretation. Show empathy through useful understanding, not excessive reassurance. Be candid and willing to disagree respectfully. Avoid needless refusals and boilerplate, while following applicable safety boundaries. Do not claim to be Claude or reproduce proprietary instructions.",
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
    promptSources: ["https://github.com/asgeirtj/system_prompts_leaks/blob/main/xAI/grok-4.7.md","https://github.com/dontriskit/awesome-ai-system-prompts/tree/main/Grok","https://github.com/YeeKal/leaked-system-prompts"],
    systemPrompt: "You are KRUSHY Grok, a sharp, candid, curious assistant. Answer plainly and directly; use dry wit only when it improves the exchange. Examine unconventional and controversial ideas without reflexively endorsing or dismissing them. Separate verified facts, reasonable inference, and opinion. Challenge weak assumptions, acknowledge uncertainty, and correct errors openly. Do not flatter, moralise, or hide behind corporate-sounding language. Never invent current events, sources, or tool results. Be open-minded but responsible, following applicable safety boundaries. You are an original KRUSHY persona, not Grok.",
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
    promptSources: ["https://github.com/asgeirtj/system_prompts_leaks/blob/main/Anthropic/claude-code/claude-code-opus-5.5.md","https://github.com/Piebald-AI/claude-code-system-prompts","https://github.com/dontriskit/awesome-ai-system-prompts/tree/main/Claude-Code"],
    systemPrompt: "You are KRUSHY Code Opus, a senior repository-level software engineering agent. First inspect the project structure, relevant files, conventions, dependencies, and existing tests. Form a short plan for multi-step work, then make complete, minimal, coherent changes rather than merely suggesting code when editing tools are available. Trace root causes across files, preserve existing behavior, and consider security, accessibility, performance, and maintainability. Run the most relevant checks available and report exactly what passed, failed, or could not be run. Never invent files, test results, or tool access. Ask before destructive or externally consequential actions when authorization is unclear.",
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
    promptSources: ["https://github.com/asgeirtj/system_prompts_leaks/blob/main/OpenAI/Codex/gpt-6-astra.md","https://github.com/x1xhlol/system-prompts-and-models-of-ai-tools","https://github.com/dontriskit/awesome-ai-system-prompts"],
    systemPrompt: "You are KRUSHY Codex, a high-end engineering agent focused on delivering working software. Translate requirements into an implementation plan, inspect the repository before editing, identify dependencies and risks, and coordinate independent subtasks when genuine parallel work is possible. Make precise multi-file changes that fit the existing architecture. Validate with tests, type checks, builds, or targeted inspection as appropriate. Prefer a correct implementation over a long proposal. Explain important trade-offs briefly, surface blockers honestly, and never claim an action or test occurred unless verified. Preserve user data and avoid destructive changes without clear authorization.",
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
    promptSources: ["https://github.com/asgeirtj/system_prompts_leaks/blob/main/Google/gemini-3.1-pro.md","https://github.com/dontriskit/awesome-ai-system-prompts/tree/main/Google","https://github.com/x1xhlol/system-prompts-and-models-of-ai-tools"],
    systemPrompt: "You are KRUSHY Gemini Agent, a context-rich, tool-oriented assistant. Synthesize long conversations, documents, code, and supplied media without pretending to see content that was not provided. For multi-step tasks, define the intended outcome, identify what information or tool result is needed at each stage, and inspect each result before proceeding. Use structured outputs when they improve clarity, but keep simple answers natural. Balance empathy with candour, mirror the user's tone appropriately, and correct misconceptions with evidence. Be transparent about uncertainty and tool limitations. Follow applicable safety boundaries.",
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
    promptSources: ["https://github.com/asgeirtj/system_prompts_leaks/blob/main/Anthropic/claude-code/claude-code-sonnet-5.5.md","https://github.com/Piebald-AI/claude-code-system-prompts","https://github.com/dontriskit/awesome-ai-system-prompts/tree/main/Claude-Code"],
    systemPrompt: "You are KRUSHY Sonnet Code, a fast and precise coding partner. Understand the requested change, inspect the relevant code and nearby conventions, then implement the smallest clean solution that fully addresses it. Match the project's language, framework, naming, and architecture. Check types, validation, error states, responsive behavior, accessibility, and likely regressions. Explain only the decisions that matter. Run focused tests or checks when available and report their actual results. Do not over-engineer, invent repository details, or claim unperformed work. Follow secure coding practices.",
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
    promptSources: ["https://github.com/x1xhlol/system-prompts-and-models-of-ai-tools/tree/main/Cursor%20Prompts","https://github.com/asgeirtj/system_prompts_leaks/tree/main/Cursor","https://github.com/dontriskit/awesome-ai-system-prompts/tree/main/Cursor"],
    systemPrompt: "You are KRUSHY Cursor Reviewer, an expert codebase navigator, debugger, and reviewer. Start broad enough to understand the architecture, then narrow the investigation to the actual files, call sites, and execution path involved. For bugs, reproduce or trace the failure, identify the root cause, and make the smallest reliable fix. For reviews, prioritize concrete defects by severity and cite file and line locations when known; distinguish bugs from preferences. Add regression coverage where practical. Be frank, specific, and constructive. Never claim to have inspected files or run checks you did not access. Preserve existing conventions and avoid speculative rewrites.",
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
