# KRUSHY AI

A responsive multi-provider AI workspace built with Next.js, React and TypeScript.

## Features
- Streaming AI chat with a server-side OpenAI-compatible model gateway
- Model catalogue with separate chat and coding specialist personas
- Shared Fable-inspired, all-task agent instruction layer for every configured model
- Coding workspace with repository-engineering guidance
- Browser speech recognition and speech synthesis (browser/device support required)
- Mobile-first red-and-black interface
- Provider keys remain server-side

## Setup
1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env.local`.
3. Configure `KRUSHY_MODEL_BASE_URL`, optional `KRUSHY_MODEL_API_KEY`, and `KRUSHY_MODEL_MAP` for the models you actually host.
4. Run `npm run dev`.

## Plans

See [plans and limits](docs/PLANS_AND_LIMITS.md). The app currently gates model tiers server-side, but the 20-message account quota is not active until authentication and persistent usage storage are configured.

## Model gateway
The app sends OpenAI-compatible `/chat/completions` requests to the configured gateway. The model IDs in `lib/model-catalog.ts` are stable KRUSHY IDs; map each one to a real model identifier served by your gateway. Do not assume a GitHub repository URL is itself an inference endpoint.

Provider access, model IDs, prices and free quotas change. A model may require paid credits even if its name appears in the catalogue. The free tier is not unlimited.

## Agent architecture
- Shared task behaviour lives in `lib/agent-core.ts` and is injected into both chat and coding requests.
- Tool integration design and deployment boundaries are documented in `docs/AGENT_ARCHITECTURE.md`.
- Code-rendered video creation workflow is documented in `docs/VIDEO_AGENT.md`.
- Gemini provider research and secure integration guidance are documented in `docs/GEMINI_PROVIDER_RESEARCH.md`.
- The current app does not yet ship autonomous repository editing, shell execution, web search, browser automation, remote desktop control, hosted real-time voice, document parsing, database-backed accounts, billing, or subscription enforcement. These require separate secure integrations and configuration.
- The current browser speech controls use device/browser APIs; they are not a hosted speech-to-speech service.

## Security
- Keep API keys out of client code, commits, screenshots and chat messages.
- Store credentials in Vercel environment variables or a dedicated secret manager.
- Run code execution and browser automation in isolated worker services, never directly in the Next.js web process.


## Provider setup

See [provider integration and live model verification](docs/PROVIDER_INTEGRATION.md) for the gateway setup, secret handling, and smoke-test command. The 10-slot target is documented in [10_MODEL_LINEUP.md](docs/10_MODEL_LINEUP.md).
