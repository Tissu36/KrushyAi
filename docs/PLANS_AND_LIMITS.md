# KRUSHY AI plans and model access

## FREE
- 3 starter models: Google Gemma 4 26B A4B, LiquidAI LFM3-1.7B, and Cohere North Mini Code.
- Free model IDs are OpenRouter free endpoints and can be rate-limited or unavailable.
- Intended product allowance: 20 messages per account per day.

## PRO
- The remaining specialist slots (reasoning, writing, multimodal, research, vision, agents, math and backup).
- KRUSHY MAX multi-model synthesis.
- Intended product allowance: unlimited messages (no user-facing token meter or token quota).
- Pro models are hidden from execution on the server unless a future authenticated entitlement check explicitly grants access.

## Important implementation status
The current repository has no sign-up/login system and no persistent database. The app now has a browser-local 20-message daily counter for testing, but it is not a secure per-account quota and can be reset or bypassed. The API currently exposes the 3 FREE model slots and rejects PRO model requests server-side. The plan metadata describes PRO as unlimited messages, but this is a target entitlement, not an active account benefit until authentication, subscription entitlement checks, and abuse protection are implemented. The plans.accountLimitActive field remains false until authentication provides a verified account ID and persistent storage (for example, Redis/Postgres) records daily usage. Do not advertise the 20/day cap as active until that backend is connected.

## Provider limits
OpenRouter's own free-model quota is separate from KRUSHY's intended product quota. Provider limits can be shared by every KRUSHY user when the app uses one server-side API key. See the [current OpenRouter free model list](https://openrouter.ai/collections/free-models).
