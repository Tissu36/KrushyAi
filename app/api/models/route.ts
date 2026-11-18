import { MODEL_CATALOG, getConfiguredModelMap } from "@/lib/model-catalog";
export const dynamic = "force-dynamic";

export async function GET() {
  const map = getConfiguredModelMap();
  const connected = MODEL_CATALOG.map((m) => ({
    ...m,
    configured: Boolean(map[m.id]),
    tag: m.plan === "pro" ? (map[m.id] ? "PRO PLAN · ROUTE CONFIGURED" : "PRO PLAN · PROVIDER NOT CONNECTED") : map[m.id] ? "FREE PLAN · ROUTE CONFIGURED · API BILLING MAY APPLY" : "FREE PLAN · PROVIDER NOT CONNECTED",
  }));
  const chatCount = connected.filter((m) => (m.category === "chat" || m.category === "both") && m.configured).length;
  const codeCount = connected.filter((m) => (m.category === "code" || m.category === "both") && m.configured).length;
  const models = connected;
  return Response.json({
    models,
    plans: {
      free: { dailyMessageLimit: 20, unlimitedMessages: false, modelCount: MODEL_CATALOG.length },
      pro: { modelCount: MODEL_CATALOG.filter((m) => m.plan === "pro").length, unlimitedMessages: true, dailyMessageLimit: null },
      accountLimitActive: false,
      accountLimitNote: "The current preview uses a browser-local daily counter. Secure account-wide limits require authentication and persistent usage storage.",
      proPreviewEnabled: process.env.KRUSHY_PRO_PREVIEW === "true",
    },
    counts: { chat: chatCount, code: codeCount },
    maxReady: false,
    gatewayReady: Boolean(process.env.KRUSHY_MODEL_BASE_URL && (!process.env.KRUSHY_MODEL_BASE_URL.includes("openrouter.ai") || process.env.KRUSHY_MODEL_API_KEY)),
    providerConnection: { connected: Boolean(process.env.KRUSHY_MODEL_BASE_URL && (!process.env.KRUSHY_MODEL_BASE_URL.includes("openrouter.ai") || process.env.KRUSHY_MODEL_API_KEY)), gateway: process.env.KRUSHY_MODEL_BASE_URL ? (process.env.KRUSHY_MODEL_BASE_URL.includes("openrouter.ai") ? "OpenRouter" : "Custom OpenAI-compatible gateway") : null, credentialsPresent: Boolean(process.env.KRUSHY_MODEL_API_KEY) },
  }, { headers: { "Cache-Control": "no-store" } });
}