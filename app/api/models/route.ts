import { MODEL_CATALOG, getConfiguredModelMap } from "@/lib/model-catalog";
export const dynamic = "force-dynamic";

export async function GET() {
  const map = getConfiguredModelMap();
  const connected = MODEL_CATALOG.map((m) => ({
    ...m,
    configured: m.plan === "free" && Boolean(map[m.id]),
    tag: m.plan === "pro" ? "PRO · Upgrade required" : map[m.id] ? "FREE · Connected" : "FREE · Not configured",
  }));
  const chatCount = connected.filter((m) => m.category === "chat" && m.configured).length;
  const codeCount = connected.filter((m) => m.category === "code" && m.configured).length;
  const models = [
    { id: "krushy-max", name: "KRUSHY MAX", maker: "KRUSHY", task: "Multi-model consensus + synthesis", category: "both", plan: "pro", configured: false, tag: "PRO · Upgrade required" },
    ...connected,
  ];
  return Response.json({
    models,
    plans: {
      free: { dailyMessageLimit: 20, modelCount: 3 },
      pro: { modelCount: MODEL_CATALOG.filter((m) => m.plan === "pro").length + 1 },
      accountLimitActive: false,
      accountLimitNote: "Account-based daily limits activate after authentication and persistent usage storage are configured.",
    },
    counts: { chat: chatCount, code: codeCount },
    maxReady: false,
    gatewayReady: Boolean(process.env.KRUSHY_MODEL_BASE_URL),
  }, { headers: { "Cache-Control": "no-store" } });
}