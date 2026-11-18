# KRUSHY AI — 10-slot model lineup

This is the target specialist lineup supplied by the project owner. It is a routing plan, not a claim that every named checkpoint, benchmark, hosted API, or free tier has been independently verified.

| Slot | Role | Target model | KRUSHY AI workspace |
|---|---|---|---|
| 1 | Flagship general reasoning and hardest tasks | Claude Fable 5.2 | General chat / KRUSHY MAX judge |
| 2 | Writing, nuance, and communication | Claude Fable 5.2 / Opus 5.5 | Writing specialist |
| 3 | Multimodal creation, voice, and live web | GPT-6.2 Astra / Gemini 4 Carbon | Multimodal tools and voice workspace |
| 4 | Advanced coding agent | Kimi K3.1 Pro | KRUSHY CODE lead |
| 5 | Fast everyday assistant | Qwen3.8-27B / GPT-6.2 Sol | Fast chat |
| 6 | Research and long documents | DeepSeek V4.1 Flash / Gemini 4 Carbon | Research and document analysis |
| 7 | Vision and image understanding | Gemma 4 31B / Gemini 4 Carbon | Vision and document ingestion |
| 8 | Tool calling and agent workflows | Mistral Small 4 / Gemini 4 Carbon | Tool orchestration |
| 9 | Mathematics and scientific reasoning | MiMo-V2.6-Pro / Claude Fable 5.2 | Math and science specialist |
| 10 | Lightweight and faster backup | GLM-5.3-Flash / Gemini 3.8 Flash | Fallback / low-latency chat |

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
