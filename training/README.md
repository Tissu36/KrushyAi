# KRUSHY AI model collection and MAX

KRUSHY AI now has a model registry for five chat candidates and five coding candidates, plus KRUSHY MAX. These are model checkpoints and reference projects, not ten APIs automatically provided for free.

## Model candidates

### Chat
1. GPT-OSS 20B — https://github.com/openai/gpt-oss
2. Qwen general model — https://github.com/QwenLM
3. Gemma — https://github.com/google-deepmind/gemma
4. Llama 4 — https://github.com/meta-llama/llama
5. DeepSeek V3 — https://github.com/deepseek-ai/DeepSeek-V3

### Coding
1. Qwen3-Coder-Next — https://github.com/QwenLM/Qwen3-Coder
2. Qwen3-Coder 30B A3B — https://github.com/QwenLM/Qwen3-Coder
3. DeepSeek-Coder-V2 Lite — https://github.com/deepseek-ai/DeepSeek-Coder-V2
4. GPT-OSS 20B — https://github.com/openai/gpt-oss
5. Gemma 4 — https://github.com/google-deepmind/gemma

These are candidates, not claims that every model is small, free to host, or suitable for every GPU. DeepSeek V3 and Llama 4 are large; Meta and Google model terms/access requirements must be reviewed. Check each official repository and model card for exact checkpoint ID, license and hardware needs before deployment. Some candidates are duplicated across chat and code because they are general-purpose.

## Connect models

The app uses one OpenAI-compatible model gateway (for example, a properly secured vLLM or LiteLLM deployment). Set these Vercel environment variables:

- KRUSHY_MODEL_BASE_URL — private gateway URL ending in /v1
- KRUSHY_MODEL_API_KEY — gateway key
- KRUSHY_MODEL_MAP — JSON mapping of the stable IDs below to the exact model IDs served by your gateway

Example with only two models connected (add the remaining ones only when the gateway actually serves them):

```json
{
  "gpt-oss-20b": "openai/gpt-oss-20b",
  "qwen-general": "Qwen/Qwen3.5-4B",
  "qwen-coder-next": "Qwen/Qwen3-Coder-Next",
  "deepseek-coder-lite": "deepseek-ai/DeepSeek-Coder-V2-Lite-Instruct"
}
```

The JSON keys must be stable IDs from the catalogue. Values must exactly match the model names exposed by your gateway. Do not put provider keys in client-side code or commit them to GitHub.

## KRUSHY MAX

MAX runs all configured specialists (up to five per mode) in parallel for the selected mode, then asks a judge model to compare the drafts, resolve disagreements and produce one final answer. It requires at least two configured chat models and two configured coding models before the selector marks MAX as ready. This is multi-model synthesis, not a new neural network and not guaranteed to outperform every individual model. It costs more compute per request.

## Serving

vLLM supports an OpenAI-compatible chat completions API and many model architectures: https://github.com/vllm-project/vllm. Secure the gateway behind authentication and network controls; do not expose an unauthenticated model server publicly. One vLLM process normally serves a configured model deployment; use a model gateway/router to route to separate model backends.

## Licenses and cost

Open weights do not mean zero-cost hosted inference. Some model licenses have use restrictions or gated downloads. Verify the exact model card and terms for each checkpoint. Do not assume a GitHub source-code license also licenses the model weights.


## Multi-model gateway scripts

The website expects one OpenAI-compatible gateway URL. This repository includes `scripts/litellm.config.yaml` as a LiteLLM routing example and `scripts/serve-vllm.sh` as a single-model vLLM launch helper. The example gateway has ten aliases matching the model registry. Each alias points to its own compatible backend URL; this does not magically host ten weights on one small GPU.

1. Provision one model backend per model you want online, or use a hosted provider that exposes an OpenAI-compatible API. Model sizes vary greatly.
2. Copy `scripts/gateway.env.example` into your private secret manager and replace every placeholder. Never commit real keys.
3. Run `pip install 'litellm[proxy]'` and then `litellm --config scripts/litellm.config.yaml --port 4000` on a protected server.
4. In Vercel set `KRUSHY_MODEL_BASE_URL` to the gateway URL ending in `/v1`, `KRUSHY_MODEL_API_KEY` to the gateway master key, and `KRUSHY_MODEL_MAP` to the JSON in `model-map.example.json`.

Only configure model aliases that your backends really serve. The example lists all ten for a complete setup; unset backends must be removed from the LiteLLM config or supplied with valid compatible endpoints before starting it. Secure the gateway with authentication, TLS and network restrictions.
