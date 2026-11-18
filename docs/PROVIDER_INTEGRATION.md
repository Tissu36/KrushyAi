# Provider integration and live verification

## Recommended architecture for KRUSHY AI

The current chat route speaks the OpenAI-compatible Chat Completions protocol. The free-only setup uses **OpenRouter** directly at `https://openrouter.ai/api/v1`; stable KRUSHY slot IDs map to OpenRouter model IDs ending in `:free`. No LiteLLM deployment or paid provider key is required for this setup.

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

## Image input for Slots 3 and 7

The chat route accepts OpenAI-compatible user content arrays containing text blocks and `image_url` blocks with base64 data URLs. The browser validates PNG, JPEG, WebP, and GIF uploads, downsizes them to a maximum 2048-pixel long edge, converts them to WebP, and targets a 4 MB total image payload. GIF uploads are flattened to a still image during canvas conversion.

- Image requests are accepted only for `slot-3-multimodal`, `slot-7-vision`, or `krushy-max`.
- Selecting an image while a text-only slot is active switches to a configured vision slot when available. The Code workspace switches back to Chat for image requests.
- KRUSHY MAX filters its specialist pool to configured Slot 3 / Slot 7 vision candidates for image analysis, then synthesizes their text responses.
- The API validates data-URL MIME types, base64 format, and a 4 MB aggregate image limit before forwarding the content array to the OpenAI-compatible gateway.
- Your LiteLLM model/provider must actually support image input. A text-only model alias or unsupported provider adapter cannot become vision-capable merely because the request uses the standard content format.

Assistant responses expose `X-Krushy-Model-Used` and `X-Krushy-Fallback-Attempted`; the chat footer displays those values, including the synthesis model selected by KRUSHY MAX.

## Configure the gateway

Set these as server-side environment variables (Vercel Project Settings or local `.env.local`). The repository's `.env.example` contains the ten free-only model IDs and fallback map:

```dotenv
KRUSHY_MODEL_BASE_URL=https://openrouter.ai/api/v1
KRUSHY_MODEL_API_KEY=your_openrouter_api_key
# Copy KRUSHY_MODEL_MAP and KRUSHY_MODEL_FALLBACK_MAP from .env.example
```

The ten stable slot keys are `slot-1-flagship`, `slot-2-writing`, `slot-3-multimodal`, `slot-4-coding`, `slot-5-fast`, `slot-6-research`, `slot-7-vision`, `slot-8-agents`, `slot-9-math-science`, and `slot-10-backup`. Values are exact model aliases configured in the gateway. The catalog records preferred upstream IDs and fallback suggestions; the chat route derives conventional provider aliases from those suggestions and retries on eligible pre-stream failures. For custom gateway aliases, set KRUSHY_MODEL_FALLBACK_MAP. Never prefix secrets with `NEXT_PUBLIC_`, commit them, or paste them into chat.

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


## Free tier limits and Kimi note

All ten example endpoints use OpenRouter model IDs ending in `:free`, which have $0 prompt and completion pricing and do not require purchasing credits. OpenRouter currently documents a free-account limit of 50 requests per day (and 20 requests per minute); individual upstream providers can impose stricter limits or availability changes. Do not promise unlimited usage or production uptime. Do not configure a paid model ID in the free-only map.

Kimi's consumer app may offer a limited free allowance, but Kimi K3.1 Pro API access is pay-as-you-go. Slot 4 therefore uses free Cohere North Mini Code and Particle-1 endpoints as substitutes for the user's Kimi coding-agent target.
