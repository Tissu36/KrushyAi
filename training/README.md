# KRUSHY Ω training

This folder contains a supervised fine-tuning pipeline for two separate LoRA adapters built from one open-weight foundation:
- KRUSHY Omega: general conversation and reasoning.
- KRUSHY Code: programming, debugging and software engineering.

Default base: unsloth/Qwen3.5-4B. Check the exact Hugging Face model card and license before use or redistribution. Qwen publishes open-weight model families and recommends established fine-tuning frameworks. The 4B model is a practical starting point, not a frontier model.

## Train
Use a compatible GPU runtime (for example, a supported Google Colab GPU). An ordinary phone or low-memory laptop cannot train this model.

Install: pip install -r requirements.txt

Copy one of the example JSONL files to general.jsonl or code.jsonl and add high-quality examples you have permission to use.

Run:
python train.py --profile general --data general.jsonl --output ./output/krushy-omega
python train.py --profile code --data code.jsonl --output ./output/krushy-code

The commands train and save two distinct LoRA adapters. Evaluate them on held-out examples before deployment.

## Dataset format
One JSON object per line with a messages array containing user and assistant roles. Use original or properly licensed examples; remove personal/private information and secrets.

## Website connection
After training, deploy the base model plus the correct adapter to an OpenAI-compatible inference server. Then configure the website with KRUSHY_MODEL_BASE_URL (ending in /v1), KRUSHY_MODEL_API_KEY (if required), KRUSHY_GENERAL_MODEL_ID and KRUSHY_CODE_MODEL_ID in Vercel. The website must not claim the model is live until these values are set and the server is reachable.

## About unfiltered behavior
The system prompts encourage candid answers and reduce unnecessary refusals. Fine-tuning cannot guarantee unrestricted behavior or remove all base-model limits. Keep safeguards against serious harm, privacy invasion and abuse.

Compute, hosting and inference may cost money. Free GPU sessions are limited; unlimited free hosted inference is not realistic.