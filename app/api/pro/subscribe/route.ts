import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/supabase-server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export async function POST(req: Request) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Sign in to KRUSHYAI before subscribing." }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const temporaryToken = typeof body.temporaryToken === "string" ? body.temporaryToken.trim() : "";
  const paymentMethodId = typeof body.paymentMethodId === "string" ? body.paymentMethodId.trim() : "";
  if (!temporaryToken && !paymentMethodId) {
    return NextResponse.json({ error: "A Moneris temporary token or Payment Method ID is required." }, { status: 400 });
  }

  const db = getSupabaseAdminClient();
  if (!db) return NextResponse.json({ error: "KRUSHYAI billing is not configured yet." }, { status: 503 });

  const merchantId = process.env.MONERIS_MERCHANT_ID;
  const apiKey = process.env.MONERIS_API_KEY;
  const baseUrl = process.env.MONERIS_API_BASE_URL || "https://api.sb.moneris.io";
  const callbackUrl = process.env.MONERIS_CALLBACK_URL || `${process.env.NEXT_PUBLIC_SITE_URL || ""}/api/pro/webhook/moneris`;
  const amount = process.env.KRUSHY_PRO_MONTHLY_CAD || "9.99";

  if (!merchantId || !apiKey || !callbackUrl) {
    return NextResponse.json({
      error: "Moneris billing is not configured. Add MONERIS_MERCHANT_ID, MONERIS_API_KEY, MONERIS_CALLBACK_URL and KRUSHY_PRO_MONTHLY_CAD in Vercel.",
      code: "BILLING_NOT_CONFIGURED",
    }, { status: 503 });
  }

  const cents = Math.round(Number(amount) * 100);
  if (!Number.isFinite(cents) || cents <= 0) {
    return NextResponse.json({ error: "Invalid KRUSHY_PRO_MONTHLY_CAD value." }, { status: 500 });
  }

  const payload = {
    idempotencyKey: crypto.randomUUID(),
    orderId: `krushy-pro-${user.id}-${Date.now()}`,
    invoiceNumber: `KJ-${Date.now()}`,
    subscriptionType: "RECURRING",
    billingDetails: {
      billingIntervalUnit: "MONTH",
      billingIntervalFrequency: "1",
      billingIntervalCount: "12",
      billingStartDate: new Date().toISOString().slice(0, 10),
      billingAmount: { amount: String(cents), currency: "CAD" },
    },
    callbackUrl,
    customData: { userId: user.id, plan: "pro" },
    ...(temporaryToken
      ? {
          paymentMethod: {
            paymentMethodSource: "TEMPORARY_TOKEN",
            temporaryToken,
            credentialOnFileInformation: {
              paymentInformation: "FIRST",
              paymentIndicator: "RECURRING",
            },
          },
        }
      : {
          paymentMethod: {
            paymentMethodSource: "PAYMENT_METHOD_ID",
            paymentMethodId,
          },
        }),
  };

  const response = await fetch(`${baseUrl}/subscriptions`, {
    method: "POST",
    headers: {
      "Api-Version": process.env.MONERIS_API_VERSION || "2026-08-14",
      "X-Merchant-Id": merchantId,
      "X-API-Key": apiKey,
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    return NextResponse.json({ error: result?.message || "Moneris could not create the subscription.", details: result }, { status: response.status });
  }

  const providerSubscriptionId = String(result?.subscriptionId ?? result?.id ?? result?.subscription?.id ?? "");
  if (!providerSubscriptionId) {
    return NextResponse.json({ error: "Moneris created the request but did not return a subscription ID." }, { status: 502 });
  }

  const periodEnd = new Date();
  periodEnd.setMonth(periodEnd.getMonth() + 1);

  const { error } = await db.from("subscriptions").upsert({
    user_id: user.id,
    provider: "moneris",
    provider_subscription_id: providerSubscriptionId,
    status: "active",
    plan: "pro",
    current_period_start: new Date().toISOString(),
    current_period_end: periodEnd.toISOString(),
    updated_at: new Date().toISOString(),
  }, { onConflict: "provider_subscription_id" });

  if (error) return NextResponse.json({ error: "Subscription was created but KRUSHY could not save the entitlement." }, { status: 500 });

  return NextResponse.json({ ok: true, pro: true, subscriptionId: providerSubscriptionId });
}
