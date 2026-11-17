const featured = [
{ id:"openai/gpt-6.2-astra", name:"GPT-6.2 Astra", maker:"OpenAI", tag:"Frontier", task:"Deep reasoning + engineering" },
{ id:"openai/gpt-6.2-sol", name:"GPT-6.2 Sol", maker:"OpenAI", tag:"Balanced", task:"Everyday + coding" },
{ id:"anthropic/claude-opus-5.5", name:"Claude Opus 5.5", maker:"Anthropic", tag:"Premium", task:"Complex coding + agents" },
{ id:"anthropic/claude-sonnet-5.5", name:"Claude Sonnet 5.5", maker:"Anthropic", tag:"Coding", task:"Build features + debug" },
{ id:"google/gemini-4-carbon", name:"Gemini 4 Carbon", maker:"Google", tag:"Multimodal", task:"Reasoning + vision" },
{ id:"google/gemini-4-hydrogen", name:"Gemini 4 Hydrogen", maker:"Google", tag:"Fast", task:"Agentic workflows" },
{ id:"x-ai/grok-4.3", name:"Grok 4.3", maker:"xAI", tag:"Reasoning", task:"Research + analysis" },
{ id:"deepseek/deepseek-v4.1-flash", name:"DeepSeek V4.1 Flash", maker:"DeepSeek", tag:"Value", task:"Fast coding + reasoning" },
{ id:"qwen/qwen4-max", name:"Qwen 4 Max", maker:"Qwen", tag:"Advanced", task:"Code + math + vision" },
{ id:"z-ai/glm-5.3", name:"GLM 5.3", maker:"Z.ai", tag:"Coding", task:"Software engineering" },
{ id:"tencent/hy4", name:"Tencent Hy4", maker:"Tencent", tag:"Agentic", task:"Code + agent workflows" }
];
export async function GET() { return Response.json({ models: featured }); }
