import { MODEL_CATALOG, getConfiguredModelMap } from "@/lib/model-catalog";
export const dynamic = "force-dynamic";

export async function GET() {
  const map = getConfiguredModelMap();
  const connected = MODEL_CATALOG.map((m) => ({ ...m, configured: Boolean(map[m.id]), tag: map[m.id] ? "Configured — live test not run" : "Not configured" }));
  const chatCount = connected.filter((m) => m.category === "chat" && m.configured).length;
  const codeCount = connected.filter((m) => m.category === "code" && m.configured).length;
  const models = [
    { id: "krushy-max", name: "KRUSHY MAX", maker: "KRUSHY", task: "Multi-model consensus + synthesis", category: "both", configured: chatCount >= 2 && codeCount >= 2, tag: chatCount >= 2 && codeCount >= 2 ? "MAX configured — live test not run" : "Needs 2+ models per mode" },
    ...connected,
  ];
  return Response.json({ models, counts: { chat: chatCount, code: codeCount }, maxReady: chatCount >= 2 && codeCount >= 2, gatewayReady: Boolean(process.env.KRUSHY_MODEL_BASE_URL) }, { headers: { "Cache-Control": "no-store" } });
}
