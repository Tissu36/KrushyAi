# KRUSHY AI

A mobile-first AI workspace powered by Groq-hosted open-weight GPT-OSS models, with chat, coding mode, and browser-based voice controls.

## Setup

1. Install Node.js 20+.
2. Run `npm install`.
3. Create a Groq API key at [Groq Console](https://console.groq.com/keys).
4. Add `GROQ_API_KEY` to `.env.local`.
5. Run `npm run dev`.

Deploy to Vercel and add `GROQ_API_KEY` under Project → Settings → Environment Variables, then redeploy. Never put provider keys in client-side code.

## Models

- `openai/gpt-oss-120b` — recommended for stronger reasoning and coding.
- `openai/gpt-oss-20b` — faster, lighter alternative.

## Features

- Groq-hosted open-weight GPT-OSS model selector.
- General chat and coding-focused system prompts.
- Server-side streaming chat; API key is never sent to the browser.
- Conversation history in browser local storage.
- Voice input/output using browser speech APIs where supported.
- Responsive black-and-red interface.

Groq free-tier access is rate-limited, not unlimited. Check current model availability, limits and pricing in Groq Console. The Code Studio is a coding-focused chat, not an autonomous repository editor or terminal.