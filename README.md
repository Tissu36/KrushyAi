# KRUSHY AI

A responsive multi-provider AI workspace built with Next.js, React and TypeScript.

## Features
- Streaming AI chat with a server-side provider router
- Model catalogue for Groq, OpenAI, Anthropic, Google, DeepSeek, xAI, Mistral and Cerebras
- Coding-focused Code Studio mode
- Browser speech recognition and speech synthesis (browser/device support required)
- Mobile-first red-and-black interface
- Provider keys remain server-side

## Setup
1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env.local`.
3. Add one or more API keys from providers you are eligible to use.
4. Run `npm run dev`.

## Provider keys
- Groq: https://console.groq.com/keys
- OpenAI: https://platform.openai.com/api-keys
- Anthropic: https://console.anthropic.com/settings/keys
- Google AI Studio: https://aistudio.google.com/apikey
- DeepSeek: https://platform.deepseek.com/api_keys
- xAI: https://console.x.ai/
- Mistral: https://console.mistral.ai/api-keys/
- Cerebras: https://cloud.cerebras.ai/

Add keys as environment variables in your hosting provider (for Vercel: Project → Settings → Environment Variables), then redeploy. Only models whose provider key is configured appear in the model selector.

## Important
- Provider access, model IDs, prices and free quotas change. A model may require paid credits even if its name appears in this catalogue. Check each provider's current terms and model availability before enabling it for users.
- The free tier is not unlimited. Never promise unlimited free inference.
- This repository currently provides model routing and chat, not a complete autonomous coding agent, database-backed accounts, billing, or subscription enforcement. Those require separate secure integrations and configuration.
- Keep API keys out of client code, commits, screenshots and chat messages.
