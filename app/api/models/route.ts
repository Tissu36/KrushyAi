import { MODEL_CATALOG, getConfiguredModelMap } from "@/lib/model-catalog";
export const dynamic = "force-dynamic";

export async function GET() {
  const map = getConfiguredModelMap();
  const connected = MODEL_CATALOG.map((m) => ({
    ...m,
    configured: Boolean(map[m.id]),
    tag: m.plan === "pro" ? (process.env.KRUSHY_PRO_PREVIEW === "true" ? (map[m.id] ? "PRO PREVIEW · ROUTE CONFIGURED" : "PRO PREVIEW · PROVIDER NOT CONNECTED") : (map[m.id] ? "PRO PLAN · UPGRADE REQUIRED" : "PRO PLAN · UPGRADE + PROVIDER SETUP REQUIRED")) : map[m.id] ? "FREE ROUTE · $0 MODEL COST · RATE LIMITED" : "FREE ROUTE · PROVIDER NOT CONNECTED",
  }));
  const chatCount = connected.filter((m) => (m.category === "chat" || m.category === "both") && m.configured).length;
  const codeCount = connected.filter((m) => (m.category === "code" || m.category === "both") && m.configured).length;
  const models = connected;
  return Response.json({
    models,
    plans: {
      free: { dailyMessageLimit: 20, unlimitedMessages: false, modelCount: MODEL_CATALOG.filter((m) => m.plan === "free").length },
      pro: { modelCount: MODEL_CATALOG.filter((m) => m.plan === "pro").length, unlimitedMessages: true, dailyMessageLimit: null },
      accountLimitActive: false,
      accountLimitNote: "The current preview uses a browser-local daily counter. Secure account-wide limits require authentication and persistent usage storage.",
      proPreviewEnabled: process.env.KRUSHY_PRO_PREVIEW === "true",
    },
    counts: { chat: chatCount, code: codeCount },
    maxReady: false,
    gatewayReady: chatCount > 0 || codeCount > 0,
    providerConnection: { connected: true, gateway: "OpenRouter", credentialsPresent: true, authentication: "Per-user OAuth or server fallback" },
  }, { headers: { "Cache-Control": "no-store" } });
}