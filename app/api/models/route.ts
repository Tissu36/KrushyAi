const featured = [
{ id:"openai/gpt-6-astra", name:"GPT-6 Astra", maker:"OpenAI", tag:"Frontier", task:"Deep reasoning" },
{ id:"openai/gpt-6.1-sol", name:"GPT-6.1 Sol", maker:"OpenAI", tag:"Balanced", task:"Everyday + coding" },
{ id:"openai/gpt-6-luna", name:"GPT-6 Luna", maker:"OpenAI", tag:"Fast", task:"Fast responses" },
{ id:"anthropic/claude-opus-5.5", name:"Claude Opus 5.5", maker:"Anthropic", tag:"Premium", task:"Complex coding" },
{ id:"anthropic/claude-sonnet-5.5", name:"Claude Sonnet 5.5", maker:"Anthropic", tag:"Coding", task:"Software engineering" },
{ id:"google/gemini-4-carbon", name:"Gemini 4 Carbon", maker:"Google", tag:"Multimodal", task:"Reasoning + vision" },
{ id:"google/gemini-4-argon", name:"Gemini 4 Argon", maker:"Google", tag:"Advanced", task:"Long-context work" },
{ id:"x-ai/grok-4.7", name:"Grok 4.7", maker:"xAI", tag:"Reasoning", task:"Research + analysis" },
{ id:"deepseek/deepseek-v4.1-flash", name:"DeepSeek V4.1 Flash", maker:"DeepSeek", tag:"Value", task:"Fast coding" },
{ id:"qwen/qwen3.8-max", name:"Qwen 3.8 Max", maker:"Qwen", tag:"Coding", task:"Code + math" },
{ id:"z-ai/glm-5.3", name:"GLM 5.3", maker:"Z.ai", tag:"Versatile", task:"Agentic tasks" }
];
export async function GET() { return Response.json({ models: featured }); }
