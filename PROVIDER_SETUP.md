# KRUSHYAI · OpenRouter + Pro billing setup

KRUSHYAI supports **per-user OpenRouter OAuth** for cloud inference. Each user connects their own OpenRouter account; paid model usage is billed to that OpenRouter account. A server-side `OPENROUTER_API_KEY` remains an optional fallback for development/admin use.

## OpenRouter user connection

The KRUSHYAI UI uses OpenRouter OAuth with PKCE. Users click **Connect OpenRouter**, authorize on OpenRouter, and return to KRUSHYAI.

Current free profiles use live `:free` routes when available. OpenRouter currently lists 50 free-model requests/day for a free account and 20 requests/minute; KRUSHYAI also applies its own workspace quota. Paid profiles use the user's OpenRouter credits/billing. Verify current model availability before changing slugs.

## Optional server fallback

Add this only if you want KRUSHYAI to have a server-side fallback:

| Name | Value | Environments |
| --- | --- | --- |
| `OPENROUTER_API_KEY` | Private OpenRouter key | Production, Preview, Development |

Never use a `NEXT_PUBLIC_` prefix for this key and never commit it.

## KRUSHY model overrides

OpenRouter model IDs use the exact `provider/model` slug shown in the current OpenRouter catalog. KRUSHYAI supports optional `KRUSHY_MODEL_MAP` JSON overrides.

Example:

```json
{
  "slot-4-opus": "meta-llama/llama-4-maverick",
  "slot-5-fable": "qwen/qwen4-max",
  "slot-10-max": "deepseek/deepseek-v4-pro-0813"
}
```

## Supabase

Required server/client environment variables:

| Name | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser/auth key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only subscription writes |

Never expose the service-role key to the browser.

## Moneris Pro billing

KRUSHY Pro uses Moneris recurring subscriptions. Moneris Hosted Tokenization keeps card data inside a Moneris-controlled iframe and returns a temporary token to KRUSHYAI; KRUSHYAI sends that token server-side to create the recurring subscription.

Moneris requires a merchant account and a Hosted Tokenization profile. Create/configure the profile in the Merchant Resource Center and register the KRUSHYAI source domain.

Required Vercel variables:

| Name | Purpose |
| --- | --- |
| `MONERIS_MERCHANT_ID` | 13-character merchant ID |
| `MONERIS_API_KEY` | Server-only Moneris API key |
| `MONERIS_API_BASE_URL` | `https://api.sb.moneris.io` for QA/testing; `https://api.moneris.io` for production |
| `MONERIS_API_VERSION` | Current Moneris API version used by the endpoint |
| `MONERIS_CALLBACK_URL` | `https://krushy-ai.vercel.app/api/pro/webhook/moneris` |
| `MONERIS_WEBHOOK_SECRET` | Optional secret checked by the KRUSHY webhook |
| `KRUSHY_PRO_MONTHLY_CAD` | Your approved monthly CAD price |
| `NEXT_PUBLIC_MONERIS_HOSTED_TOKEN_PROFILE_ID` | Hosted Tokenization profile ID |
| `NEXT_PUBLIC_MONERIS_ENV` | `qa` or `production` |

**Do not enable production billing until the adult/legal merchant account holder has completed Moneris onboarding and testing.**

### QA checkout

Use the Moneris QA Merchant Resource Center and QA Hosted Tokenization host while testing:

`https://esqa.moneris.com/HPPtoken/index.php`

The KRUSHY UI sends `tokenize` to the iframe and accepts messages only from the matching Moneris origin.

### Production checkout

After QA testing and store activation, switch:

- `NEXT_PUBLIC_MONERIS_ENV=production`
- `MONERIS_API_BASE_URL=https://api.moneris.io`
- production Hosted Tokenization profile ID
- production merchant credentials

Moneris documents recurring subscriptions with `paymentInformation=FIRST` and `paymentIndicator=RECURRING`. The initial subscription request can omit `oneTimeAmount` so Moneris validates the payment method rather than charging the recurring amount immediately.

## Test

1. Sign in to KRUSHYAI.
2. Connect OpenRouter.
3. Select a FREE profile and send a message.
4. Sign in and open **Start KRUSHY PRO**.
5. In QA, enter a Moneris test card in the hosted frame.
6. Submit the tokenization request.
7. Confirm Supabase `subscriptions.status=active`.
8. Confirm a PRO profile is unlocked.

## Important

- Never store raw card numbers, CVD, or expiry in KRUSHYAI.
- Never commit Moneris or OpenRouter secrets.
- The hosted iframe is intentionally controlled by Moneris.
- If a model slug becomes unavailable, update `KRUSHY_MODEL_MAP` rather than hardcoding a replacement into user credentials.
