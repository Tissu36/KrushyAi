# KRUSHY AI

A mobile-first AI workspace powered by Google's Gemini API, with chat, coding mode, and browser-based voice controls.

## Setup

1. Install Node.js 20+.
2. Run `npm install`.
3. Create a Gemini API key in [Google AI Studio](https://aistudio.google.com/app/apikey).
4. Add `GEMINI_API_KEY` to `.env.local`.
5. Run `npm run dev`.

Deploy to Vercel and add `GEMINI_API_KEY` under Project → Settings → Environment Variables, then redeploy. Never put provider keys in client-side code.

## Features

- Google Gemini model picker (Gemini 3.8 Flash and Gemini 3.1 Flash-Lite).
- General chat and coding-focused system prompts.
- Server-side Gemini API requests; the key is never sent to the browser.
- Conversation history in browser local storage.
- Voice input/output using browser speech APIs where supported.
- Responsive black-and-red interface.

The current API route receives a complete Gemini response before displaying it in the chat. Account eligibility, model availability, free-tier limits, pricing, and browser voice support depend on Google current policies and your account.