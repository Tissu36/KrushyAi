export const dynamic = "force-dynamic";
export async function GET() {
  const ownReady = Boolean(process.env.KRUSHY_MODEL_BASE_URL && process.env.KRUSHY_GENERAL_MODEL_ID && process.env.KRUSHY_CODE_MODEL_ID);
  const groqReady = Boolean(process.env.GROQ_API_KEY);
  const ownTag = ownReady ? "Own model · online" : "Training required";
  const models = [
    { id: "krushy-omega", name: "KRUSHY Ω", maker: "KRUSHY", tag: ownTag, task: "General chat + reasoning", category: "general" },
    { id: "krushy-code", name: "KRUSHY CODE", maker: "KRUSHY", tag: ownTag, task: "Programming + debugging", category: "coding" },
    ...(groqReady ? [
      { id: "openai/gpt-oss-120b", name: "GPT-OSS 120B", maker: "Groq", tag: "Fallback", task: "Reasoning + coding", category: "general" },
      { id: "openai/gpt-oss-20b", name: "GPT-OSS 20B", maker: "Groq", tag: "Fast fallback", task: "Quick chat + coding", category: "general" },
    ] : []),
  ];
  return Response.json({ models, ownModelReady: ownReady, providers: [{ name: "KRUSHY model server", connected: ownReady }, { name: "Groq fallback", connected: groqReady }], message: ownReady ? undefined : "KRUSHY models are listed but not live yet. Train and deploy both adapters, then configure the model-server environment variables." }, { headers: { "Cache-Control": "no-store" } });
}