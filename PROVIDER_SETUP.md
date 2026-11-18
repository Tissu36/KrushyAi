# KRUSHYAI · OpenRouter setup

KRUSHYAI sends model requests from its Next.js server through the official OpenRouter TypeScript SDK. Your API key is never sent to the browser and must never be committed to GitHub.

## 1. Create an API key

Create a key at https://openrouter.ai/keys.

## 2. Add it to Vercel

In Vercel, open **krushy-ai → Settings → Environment Variables** and add:

| Name | Value | Environments |
| --- | --- | --- |
| `OPENROUTER_API_KEY` | Your private OpenRouter key | Production, Preview, Development |

Do not use a `NEXT_PUBLIC_` prefix. Do not put the key in source code, GitHub, or a browser setting.

## 3. Configure real model slugs

OpenRouter model IDs use the exact `provider/model` slug shown at https://openrouter.ai/models.

KRUSHYAI uses `KRUSHY_MODEL_MAP` for optional per-profile overrides. Set it as a JSON object in Vercel when a profile's catalog default is unavailable. Example:

```json
{
  "slot-1-flagship": "anthropic/claude-opus-5.5",
  "slot-5-fast": "openai/gpt-6.2-sol"
}
```

Use slugs that actually appear in the OpenRouter model catalog and are enabled for your account. The example is illustrative; verify each slug before using it. Existing per-environment overrides remain in effect.

## 4. Redeploy and test

After saving the key, redeploy the project (or push a new commit). Open KRUSHYAI, select a connected model profile, and send:

`Reply with exactly: OpenRouter is connected.`

A successful response confirms the full browser → KRUSHYAI server → OpenRouter → model → browser path.

## Local development

Create a local `.env.local` file (never commit it) containing:

```bash
OPENROUTER_API_KEY=your_private_key_here
```

Then run:

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Errors

- **503 / key not configured:** add `OPENROUTER_API_KEY` to the Vercel environment and redeploy.
- **401:** the key is invalid, revoked, or copied incorrectly.
- **402:** OpenRouter credits or spend limit are insufficient.
- **403:** the account cannot use the selected model.
- **404:** the configured model slug does not exist.
- **429:** rate limit reached; wait and retry.
- **5xx:** OpenRouter or the upstream model provider is temporarily unavailable.

## Billing and access

KRUSHY Free and KRUSHY Pro are KRUSHYAI workspace tiers. They do not make upstream inference free. OpenRouter charges according to the selected model's current pricing and your account settings. Set a spend limit in OpenRouter before testing paid models.

The KRUSHY Pro preview switch is not subscription billing or production entitlement enforcement.
