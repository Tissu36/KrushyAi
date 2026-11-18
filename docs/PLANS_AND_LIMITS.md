# KRUSHY AI plans and model access

## FREE
- 3 starter models: Google Gemma 4 26B A4B, LiquidAI LFM3-1.7B, and Cohere North Mini Code.
- Free model IDs are OpenRouter free endpoints and can be rate-limited or unavailable.
- Intended product allowance: 20 messages per account per day.

## PRO
- The remaining specialist slots (reasoning, writing, multimodal, research, vision, agents, math and backup).
- KRUSHY MAX multi-model synthesis.
- Pro models are hidden from execution on the server unless a future authenticated entitlement check explicitly grants access.

## Important implementation status
The current repository has no sign-up/login system and no persistent database. Therefore it cannot honestly enforce a 20-message-per-account quota yet. A browser counter or caller-supplied user ID is not secure and can be reset or forged. The API currently exposes the 3 FREE model slots and rejects PRO model requests server-side. The plans.accountLimitActive field remains false until authentication provides a verified account ID and persistent storage (for example, Redis/Postgres) records daily usage. Do not advertise the 20/day cap as active until that backend is connected.

## Provider limits
OpenRouter's own free-model quota is separate from KRUSHY's intended product quota. Provider limits can be shared by every KRUSHY user when the app uses one server-side API key. See the [current OpenRouter free model list](https://openrouter.ai/collections/free-models).
