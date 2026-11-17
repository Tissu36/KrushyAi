const featured = [
  { id:"openai/gpt-oss-120b", name:"GPT-OSS 120B", maker:"OpenAI · Groq", tag:"Best overall", task:"Advanced reasoning + coding" },
  { id:"openai/gpt-oss-20b", name:"GPT-OSS 20B", maker:"OpenAI · Groq", tag:"Fast", task:"Quick chat + coding" }
];
export async function GET() { return Response.json({ provider: "Groq", models: featured }); }