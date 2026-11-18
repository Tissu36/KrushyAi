# Gemini provider integration research

Reference: https://github.com/BUKOWSKIREAL/magpie-gemini-web

## What this project is

This is a Magpie plugin that manages local helper services for Google AI Studio and Gemini Web. It exposes OpenAI-compatible and Gemini-style APIs through local backends and includes features such as native AI Studio function calling, image input, image generation, Deep Research, model thinking levels, account/session management, and usage reporting. Exact features and supported model IDs can change; consult the upstream README and release notes before implementation.

## Fit for KRUSHY AI

Potentially useful as a reference for:
- OpenAI-compatible provider adapters.
- Model catalog and thinking-level metadata.
- Native tool/function calling.
- Multimodal request/response handling.
- Provider health, cooldown, and usage status.

It is not a drop-in Next.js library or a hosted inference API. It is designed around Magpie plus local helper processes. A Vercel deployment cannot call a user's `127.0.0.1` service, and the user's phone/laptop being offline would make that provider unavailable to the hosted app.

## Recommended implementation path

1. Prefer Google's supported Gemini API / AI Studio developer API for a hosted KRUSHY AI provider.
2. Implement a normal server-side provider adapter with explicit model IDs, streaming, tool-call parsing, image payload support, and supported thinking configuration.
3. Keep provider credentials in server-side environment variables or a secrets manager.
4. If a user wants to run their own local AI Studio bridge, support it as an optional self-hosted endpoint only after authentication, TLS, network restrictions, timeouts, and health checks are designed.
5. Treat provider capabilities as metadata; do not assume every Gemini model supports every tool, image, or reasoning setting.

## Important security warning

Gemini Web mode in the reference project uses Google web-session cookies. These cookies are credentials: anyone who obtains them may be able to access the associated account. KRUSHY AI must never ask users to paste Google cookies into chat, store them in browser local storage, log them, commit them, or expose them to models. Do not implement cookie scraping or bypass account protections as a hosted provider.

## Licensing and upstream review

The repository lists an MIT license for its plugin, alongside separate license files for bundled/upstream components. Review each applicable license and upstream terms before copying or redistributing code. Prefer using the repository as an architectural reference rather than importing its implementation wholesale.
