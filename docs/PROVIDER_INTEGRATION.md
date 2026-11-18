# Provider integration and live verification

## Recommended architecture for KRUSHY AI

The current chat route speaks the OpenAI-compatible Chat Completions protocol. The lowest-friction way to add Anthropic, OpenAI, Google, and other providers without writing and maintaining three separate request stacks is to put a provider gateway such as **LiteLLM Proxy** behind the existing route. The application then calls one private gateway URL and maps stable KRUSHY slot IDs to gateway aliases.

Alternative: use the **Vercel AI SDK** in the Next.js server route for native provider adapters and streaming. This is a good fit when provider-specific request features, multimodal inputs, or native tool calling must be exposed directly. The Google Gen AI JS SDK is another official option for Gemini Developer API and Vertex AI integrations.

Useful upstreams:

- [Anthropic TypeScript SDK](https://github.com/anthropics/anthropic-sdk-typescript)
- [OpenAI Node SDK](https://github.com/openai/openai-node)
- [Google Gen AI JS SDK](https://github.com/googleapis/js-genai)
- [Vercel AI SDK](https://github.com/vercel/ai)
- [LiteLLM](https://github.com/BerriAI/litellm)

## Important distinction: a repo is not an API

- Official SDKs are client libraries. They still require a valid provider account, API key, model entitlement, and supported model identifier.
- Provider CLIs (Claude Code, Codex, Gemini CLI) are developer applications, not automatically embeddable hosted inference APIs.
- Prompt archives and "awesome" repositories are references. They do not host model weights or grant access to closed models.
- A community integration may describe an unreleased or restricted model. Do not assume its suggested ID works with a public API.

In particular, the supplied Gemini 4 Carbon community index reports restricted rollout rather than general developer API access. Confirm current availability with Google before attempting to connect it. Treat model labels such as "Fable", "Astra", "Sol", "Carbon", and "Flash" as unverified until the provider's official model catalogue or a successful provider response confirms the exact ID and access.

## Configure the gateway

Set these as server-side environment variables (Vercel Project Settings or local `.env.local`):

```dotenv
KRUSHY_MODEL_BASE_URL=https://your-private-litellm-host/v1
KRUSHY_MODEL_API_KEY=your_gateway_key
KRUSHY_MODEL_MAP={"slot-1-flagship":"provider/model-id","slot-2-writing":"provider/model-id"}
```

The map keys must match IDs present in `lib/model-catalog.ts`. Values are exact model aliases configured in the gateway. Never prefix secrets with `NEXT_PUBLIC_`, commit them, or paste them into chat.

For LiteLLM, configure each alias in the proxy's model list and connect the provider credentials through its server environment. The gateway should enforce authentication, rate limits, spend limits, and provider allowlists.

## Live smoke test

The repository includes `scripts/verify-models.mjs`. With Node.js 20+:

```bash
node --env-file=.env.local scripts/verify-models.mjs
```

It sends one tiny, non-streaming chat request to each alias in `KRUSHY_MODEL_MAP`, reports HTTP status and latency, and exits non-zero if any request fails. Each test can incur a small provider charge. Run it locally or in a protected CI job; do not expose a public endpoint that lets anonymous visitors trigger paid health checks.

A passing test proves only that the configured alias responded to that small text request at that moment. It does not prove benchmark rank, multimodal support, tool calling, long context, or production reliability. Test those capabilities separately with representative inputs.

## UI status semantics

- **Not configured**: no gateway alias exists in the server-side map.
- **Configured**: an alias exists, but no recent live test has been run.
- **Live test passed**: a smoke test recently returned a valid response.
- **Unavailable**: the last test failed; keep the raw provider error in server logs only, with secrets redacted.

Do not call a model "Connected" solely because an environment variable is present. A durable live-status badge requires a trusted status store and timestamp; this repo's smoke-test script currently reports results to its operator and does not persist health state.

## Prompt and license notes

Use public prompt repositories as research material, not as a source of proprietary API instructions to impersonate another vendor's model. The Claude prompt archive itself distinguishes claude.ai prompts from API behaviour. Review each repository's license and the original provider terms before copying content.
