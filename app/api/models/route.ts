const catalogue = [
  { id:"openai/gpt-oss-120b", name:"GPT-OSS 120B", maker:"Groq", tag:"Free tier", task:"Reasoning + coding", category:"general" },
  { id:"openai/gpt-oss-20b", name:"GPT-OSS 20B", maker:"Groq", tag:"Fast", task:"Quick chat + coding", category:"general" },
  { id:"gpt-6.2-astra", name:"GPT-6.2 Astra", maker:"OpenAI", tag:"Flagship", task:"Advanced reasoning + coding", category:"general" },
  { id:"gpt-6.2-sol", name:"GPT-6.2 Sol", maker:"OpenAI", tag:"Balanced", task:"Chat + coding", category:"general" },
  { id:"gpt-6.1-terra", name:"GPT-6.1 Terra", maker:"OpenAI", tag:"Fast", task:"Everyday tasks", category:"general" },
  { id:"claude-opus-5-5", name:"Claude Opus 5.5", maker:"Anthropic", tag:"Flagship", task:"Complex coding + agents", category:"coding" },
  { id:"claude-sonnet-5", name:"Claude Sonnet 5", maker:"Anthropic", tag:"Coding", task:"Software engineering", category:"coding" },
  { id:"claude-haiku-4-5-20251001", name:"Claude Haiku 4.5", maker:"Anthropic", tag:"Fast", task:"Fast assistance", category:"general" },
  { id:"gemini-3.8-flash", name:"Gemini 3.8 Flash", maker:"Google", tag:"Fast", task:"Multimodal + coding", category:"general" },
  { id:"gemini-3.1-pro-preview", name:"Gemini 3.1 Pro", maker:"Google", tag:"Reasoning", task:"Complex analysis + coding", category:"coding" },
  { id:"deepseek-v4-pro", name:"DeepSeek V4 Pro", maker:"DeepSeek", tag:"Reasoning", task:"Advanced coding + math", category:"coding" },
  { id:"deepseek-v4", name:"DeepSeek V4", maker:"DeepSeek", tag:"Fast", task:"Everyday coding", category:"coding" },
  { id:"grok-4.6", name:"Grok 4.6", maker:"xAI", tag:"Flagship", task:"Reasoning + coding", category:"general" },
  { id:"grok-4.3", name:"Grok 4.3", maker:"xAI", tag:"Fast", task:"Chat + coding", category:"general" },
  { id:"mistral-large-2512", name:"Mistral Large", maker:"Mistral", tag:"Flagship", task:"Reasoning + coding", category:"general" },
  { id:"codestral-latest", name:"Codestral", maker:"Mistral", tag:"Coding", task:"Code completion + debugging", category:"coding" },
  { id:"gpt-oss-120b", name:"GPT-OSS 120B", maker:"Cerebras", tag:"Fast inference", task:"Reasoning + coding", category:"general" }
];
const providerKeys: Record<string,string> = {
  Groq:"GROQ_API_KEY", OpenAI:"OPENAI_API_KEY", Anthropic:"ANTHROPIC_API_KEY",
  Google:"GOOGLE_API_KEY", DeepSeek:"DEEPSEEK_API_KEY", "xAI":"XAI_API_KEY",
  Mistral:"MISTRAL_API_KEY", Cerebras:"CEREBRAS_API_KEY"
};
export const dynamic = "force-dynamic";
export async function GET() {
  const connected = catalogue.filter(m => Boolean(process.env[providerKeys[m.maker]]));
  return Response.json({
    models: connected,
    providers: Object.entries(providerKeys).map(([name, env]) => ({ name, connected: Boolean(process.env[env]), env })),
    message: connected.length ? undefined : "Connect a provider API key in your hosting environment to enable AI responses."
  }, { headers: { "Cache-Control": "no-store" }});
}
