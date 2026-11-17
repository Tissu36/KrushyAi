const featured = [
  { id:"gemini-3.8-flash", name:"Gemini 3.8 Flash", maker:"Google", tag:"Recommended", task:"Chat, reasoning + coding" },
  { id:"gemini-3.1-flash-lite", name:"Gemini 3.1 Flash-Lite", maker:"Google", tag:"Fast", task:"Quick answers + lightweight tasks" }
];
export async function GET() { return Response.json({ provider: "Google Gemini", models: featured }); }