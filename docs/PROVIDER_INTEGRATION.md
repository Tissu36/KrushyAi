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

Use exact provider IDs, not marketing nicknames or guessed suffixes. The current catalog records `claude-fable-5`, `claude-opus-5`, `claude-sonnet-5`, `gemini-4-carbon`, and `gemini-3.8-flash` as target IDs. Availability can still depend on provider account, region, gateway support, and API product. The `.env.example` uses Gemini 3.8 Flash and Claude Opus/Sonnet targets as a conservative starting configuration. Carbon and Fable are not assumed to be available just because they appear in the catalog.

## Configure the gateway

Set these as server-side environment variables (Vercel Project Settings or local `.env.local`):

```dotenv
KRUSHY_MODEL_BASE_URL=https://your-private-litellm-host/v1
KRUSHY_MODEL_API_KEY=your_gateway_key
KRUSHY_MODEL_MAP={"slot-1-flagship":"provider/model-id","slot-2-writing":"provider/model-id"}
```

The ten stable slot keys are `slot-1-flagship`, `slot-2-writing`, `slot-3-multimodal`, `slot-4-coding`, `slot-5-fast`, `slot-6-research`, `slot-7-vision`, `slot-8-agents`, `slot-9-math-science`, and `slot-10-backup`. Values are exact model aliases configured in the gateway. The catalog records preferred upstream IDs and suggested fallbacks for operator reference; these fallback lists are not automatic retries. The current route uses the one alias configured for each slot. Never prefix secrets with `NEXT_PUBLIC_`, commit them, or paste them into chat.

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
