import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export async function POST(req: Request) {
  const expected = process.env.MONERIS_WEBHOOK_SECRET;
  if (!expected) return NextResponse.json({ error: "Moneris webhook verification is not configured." }, { status: 503 });
  const supplied = req.headers.get("x-krushy-webhook-secret");
  if (!supplied || supplied !== expected) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const customData = body?.customData ?? body?.subscription?.customData ?? {};
  const userId = customData.userId;
  const providerSubscriptionId =
    body?.subscriptionId ??
    body?.id ??
    body?.subscription?.id ??
    body?.transactionDetails?.subscriptionId;

  if (!userId || !providerSubscriptionId) {
    return NextResponse.json({ received: true, ignored: true });
  }

  const statusRaw = String(
    body?.status ??
    body?.subscriptionStatus ??
    body?.subscription?.status ??
    "",
  ).toLowerCase();

  if (!statusRaw) return NextResponse.json({ received: true, ignored: true, reason: "Missing subscription status." });

  const status =
    statusRaw.includes("cancel") ? "canceled" :
    statusRaw.includes("past") || statusRaw.includes("fail") || statusRaw.includes("declin") ? "past_due" :
    statusRaw.includes("expir") ? "expired" :
    statusRaw.includes("trial") ? "trialing" :
    statusRaw.includes("active") || statusRaw.includes("approved") ? "active" :
    "inactive";

  const db = getSupabaseAdminClient();
  if (!db) return NextResponse.json({ error: "Server database is not configured" }, { status: 503 });

  const now = new Date();
  const periodEnd = body?.currentPeriodEnd ?? body?.subscription?.currentPeriodEnd ?? null;

  const { error } = await db.from("subscriptions").upsert({
    user_id: userId,
    provider: "moneris",
    provider_subscription_id: String(providerSubscriptionId),
    status,
    plan: "pro",
    current_period_start: body?.currentPeriodStart ?? now.toISOString(),
    current_period_end: periodEnd,
    cancel_at_period_end: Boolean(body?.cancelAtPeriodEnd),
    updated_at: now.toISOString(),
  }, { onConflict: "provider_subscription_id" });

  if (error) return NextResponse.json({ error: "Database update failed" }, { status: 500 });
  return NextResponse.json({ received: true });
}
