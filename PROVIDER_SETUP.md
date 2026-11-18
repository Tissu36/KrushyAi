# KRUSHYAI provider setup

KRUSHYAI uses a server-side OpenAI-compatible gateway. The model catalog is not a provider connection by itself. No model can answer until a gateway URL and secret API key are configured in the Vercel project.

## Recommended single-gateway setup: OpenRouter

1. Create an OpenRouter account and generate an API key.
2. Open the KRUSHYAI project in Vercel → Settings → Environment Variables.
3. Add these variables to **Production** and **Preview**:

| Variable | Value |
| --- | --- |
| `KRUSHY_MODEL_BASE_URL` | `https://openrouter.ai/api/v1` |
| `KRUSHY_MODEL_API_KEY` | Your private OpenRouter API key |

4. Save the variables and redeploy the project.
5. Open KRUSHYAI and send a small test prompt. The model selector reports that a route is configured when the gateway credentials exist; the first successful response is the actual end-to-end connection test.

The catalog supplies provider model IDs and maps them to OpenRouter provider namespaces. If OpenRouter changes a model slug or a route is unavailable on your account, set `KRUSHY_MODEL_MAP` to a JSON object that overrides only the affected slots. Example:

```json
{
  "slot-1-flagship": "anthropic/claude-fable-5-2",
  "slot-2-writing": "openai/gpt-6.2-astra"
}
```

Never put the API key in client-side code, GitHub, chat messages, or `NEXT_PUBLIC_*` variables. Keep it server-side as `KRUSHY_MODEL_API_KEY`.

## Cost and plans

KRUSHY Free and KRUSHY Pro are KRUSHYAI access tiers, not promises that upstream inference is free. OpenRouter/provider charges can apply to every request, including requests made from Free-plan model slots. Check provider pricing and set a usage limit before using paid models.

- **KRUSHY Free:** GPT-6.2 Sol, Claude Sonnet 5.5, Gemini 3.8 Flash, DeepSeek V4.1 Flash.
- **KRUSHY Pro:** Claude Fable 5.2, GPT-6.2 Astra, Claude Opus 5.5, Gemini 4 Argon, DeepSeek V4 Pro, Gemini 4 Carbon.

Pro model requests remain gated by the KRUSHY Pro entitlement setting. Do not set `KRUSHY_PRO_PREVIEW=true` for a public production site; it is a development preview switch, not subscription billing or authentication.

## What is and is not active

- Model cards can be browsed before connecting a provider.
- A configured route means the server has gateway settings; it is not a successful health check.
- A model is confirmed in use only after the API returns a successful completion and the response reports the routed model.
- Workspace file editing, secure terminal execution, and autonomous project operations are separate capabilities and are not implied by connecting a chat model.
