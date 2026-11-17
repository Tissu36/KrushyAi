# KRUSHY AI

A mobile-first AI workspace with multi-model chat, coding mode, and browser-based voice controls.

## Setup

1. Install Node.js 20+.
2. Run `npm install`.
3. Add `OPENROUTER_API_KEY` to `.env.local` (server-side only).
4. Run `npm run dev`.

Deploy to Vercel and add `OPENROUTER_API_KEY` to the project's Environment Variables. Never put provider keys in client-side code.

## Features

- Multi-provider model picker powered by OpenRouter.
- General chat and coding-focused system prompts.
- Streaming responses.
- Conversation history in browser local storage.
- Voice input/output using browser speech APIs where supported.
- Responsive black-and-red interface.

Provider access, model availability, pricing, and voice browser support depend on your account, region, and device.