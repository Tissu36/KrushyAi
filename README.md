# KRUSHY AI

A responsive AI workspace built with Next.js, React, TypeScript, and optional browser-local inference.

## Local AI (no provider API key)

- KRUSHY can run Llama 3.2 1B and Gemma 3 1B directly in a compatible browser using [WebLLM](https://github.com/mlc-ai/web-llm).
- The first use downloads model weights to the browser cache. Download size varies by model build; keep the tab open and use Wi-Fi.
- Local inference requires WebGPU and enough free device memory/storage. The model catalogue estimates roughly 879 MB memory for Llama and 711 MB for Gemma; these are memory estimates, not guaranteed download sizes. Actual runtime memory use can be higher.
- Model weights are not hosted by Vercel and are not bundled into the deployment.
- Local model chat is text-only in this integration. Image understanding and the existing remote specialist slots still require a separately configured compatible gateway.
- A browser without WebGPU will show a clear compatibility error; the app does not silently send local prompts to a remote provider.

## Optional remote gateway

The original server-side model gateway remains available for other specialist models. To use it, configure `KRUSHY_MODEL_BASE_URL`, optional `KRUSHY_MODEL_API_KEY`, and `KRUSHY_MODEL_MAP` in your environment. Local Llama and Gemma do not use these settings.

## Development

1. Install dependencies: `npm install`
2. Run: `npm run dev`

## Limitations

The current preview's daily message counter is browser-local and is not secure account-wide enforcement. Authentication, persistent usage limits, billing, and subscription enforcement are not implemented. Local inference speed and compatibility depend on the visitor's device and browser. The browser voice controls use device speech APIs; they are not a hosted speech-to-speech service.

## Security

- Never put API keys in client code or commit them.
- Keep any optional gateway credentials server-side.
- Do not treat model names or system prompts as proof of premium-model equivalence.
