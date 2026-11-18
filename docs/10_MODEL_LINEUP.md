# KRUSHY AI — 10-slot model lineup

This is the project owner's original ten-role lineup, adapted to free hosted model endpoints. KRUSHY keeps the requested role prompts and workflow, while the underlying model is a free substitute—not a clone of Claude Fable, GPT Astra, Kimi, Qwen, DeepSeek, or other proprietary targets. Model access and free quotas can change.

| Slot | Original role | Free model endpoint | OpenRouter model ID |
|---|---|---|---|
| 1 | Flagship general reasoning and hardest tasks | NVIDIA Nemotron 3 Ultra (free) | nvidia/nemotron-3-ultra:free |
| 2 | Writing, nuance, and communication | Baidu ERNIE 5.5 Flash Preview (free) | baidu/ernie-5.5-flash-preview:free |
| 3 | Multimodal creation, voice, and live web | NVIDIA Nemotron 3.5 Super VL (free) | nvidia/nemotron-3.5-super-vl:free |
| 4 | Advanced coding agent (original target: Kimi K3.1 Pro) | Cohere North Mini Code (free) | cohere/north-mini-code:free |
| 5 | Fast everyday assistant | NVIDIA Nemotron 3.5 Lightning (free) | nvidia/nemotron-3.5-lightning:free |
| 6 | Research and long documents | Dots3-Note Preview (free) | dots-studio/dots3-note-preview:free |
| 7 | Vision and image understanding | inclusionAI Ling 3.2 Flash (free) | inclusionai/ling-3.2-flash:free |
| 8 | Tool calling and agent workflows | Particle-1 (free) | particle-ai/particle-1:free |
| 9 | Mathematics and scientific reasoning | NVIDIA Nemotron 3 Ultra (free) | nvidia/nemotron-3-ultra:free |
| 10 | Lightweight and faster backup | Google Gemma 4 31B (free) | google/gemma-4-31b:free |

## Integration rules

1. Keep a stable KRUSHY model ID separate from a provider's model ID. Provider aliases belong in server-side environment configuration.
2. Do not mark a slot as connected until a real provider endpoint has been configured and a health/request check succeeds.
3. A GitHub repository may contain weights, inference code, a prompt, a client, or documentation. It does not automatically provide hosted inference or free/unlimited API access.
4. Do not assume the product or checkpoint names above are available exactly as written. Verify the official publisher page, model card, license, supported API, context limits, modalities, and tool-call format before enabling each slot.
5. Voice, live web search, image generation, document parsing, and computer/browser actions are separate capabilities. A model name alone does not implement them; connect explicit tools and permission boundaries.
6. For multimodal routing, detect the input capability required and only route to a provider that actually accepts that input. Never silently discard an image, audio clip, or document.
7. KRUSHY MAX should select specialists by task, collect independent drafts where useful, and synthesize with a configured judge. It must handle partial provider failures and must not imply that every model was consulted when some failed.
8. Keep provider keys server-side. Never store browser session cookies or expose credentials to prompts, logs, client bundles, or model responses.

## Routing defaults

- Difficult multi-domain question: slot 1, with slot 9 or 6 as a reviewer when relevant.
- Polished writing or editing: slot 2.
- Audio, image, video, or live-web request: slot 3 plus the required connected tool.
- Repository implementation: slot 4; use slot 8 for explicit multi-tool orchestration.
- Routine short question: slot 5.
- Research or long files: slot 6.
- Image/chart/PDF interpretation: slot 7.
- Tool-heavy workflow: slot 8.
- Calculations, proofs, or scientific reasoning: slot 9.
- Low-latency fallback: slot 10.

## Status

The current application catalog and API use stable IDs and an OpenAI-compatible gateway. This document records the target lineup; it does not itself connect these providers or replace the existing catalog. Each GitHub repository supplied for a slot must be reviewed before implementation. After the owner confirms the actual provider/model identifier, update the catalog and server-side mapping together.


## Free-only operation

The example environment configuration uses OpenRouter's free model variants only (model IDs ending in `:free`). Set `KRUSHY_MODEL_BASE_URL=https://openrouter.ai/api/v1`, add an OpenRouter API key as a server-side secret, and copy the example slot/fallback maps. Do not purchase credits or configure paid model IDs. OpenRouter currently advertises 25+ free models and a 50-request/day free account limit; individual model providers can impose additional limits or temporary availability restrictions. This is free hosted inference, not unlimited inference. If a free endpoint is down or rate-limited, KRUSHY's configured fallbacks try another free endpoint. 

Kimi K3.1 Pro can remain the coding reference in the role prompt, but its consumer app's free allowance is not the same as a free API. Kimi API usage is billed. The coding slot therefore uses Cohere North Mini Code (free) and Particle-1 (free) as hosted substitutes.

The role-specific system prompts in `lib/model-catalog.ts` remain KRUSHY-authored. They adapt the free base models to the requested jobs; they do not reproduce proprietary model internals or guarantee equivalent quality.
