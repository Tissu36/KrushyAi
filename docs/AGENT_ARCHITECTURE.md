# KRUSHY AI agent architecture

This document separates working features from planned integrations. A model prompt does not create tools; every capability below must be connected to a real server-side integration before the UI advertises it as available.

## Current foundation

- Next.js server-side model gateway at `app/api/chat/route.ts`.
- Stable model IDs and model-specific personas in `lib/model-catalog.ts`.
- Shared all-task agent instructions in `lib/agent-core.ts`.
- Chat and code workspaces share the same agent foundation but receive different task instructions.
- Browser-native speech recognition and speech synthesis are available where the user's browser supports them.
- Model credentials stay server-side.

## Planned tool adapters

### Repository coding agent
Reference: https://github.com/OpenHands/software-agent-sdk

Run code in a separate, isolated worker/container. The worker should expose a narrow authenticated API for repository checkout, file read/write, shell commands, test execution, diffs, and artifact retrieval. Do not run arbitrary user code inside the Next.js web process or expose host filesystem access.

### Browser and web research
Reference: https://github.com/browser-use/browser-use

Use a separately hosted browser worker. The adapter should accept a task, run in an isolated browser session, and return page titles, URLs, extracted text, screenshots when useful, and action logs. Add explicit timeouts, domain restrictions where appropriate, and user confirmation for purchases, account changes, submissions, or other consequential actions.

### Desktop interaction
Reference: https://github.com/microsoft/CUAWright

Treat desktop control as an optional remote worker, not a browser-only feature. Require explicit user initiation, visible session status, a bounded task scope, and confirmation before consequential actions.

### Voice
References:
- https://github.com/huggingface/speech-to-speech
- https://github.com/eleven-am/vox

The current browser speech features are a basic fallback. A real low-latency voice service needs a server-side streaming transport, speech recognition, turn detection, speech generation, interruption handling, and provider credentials or self-hosted inference.

### Vision and documents
Add upload handling with strict size/type limits, private temporary storage, malware scanning where supported, and provider-specific multimodal message conversion. Parse PDFs and office documents server-side; pass image data only to models that explicitly support vision. Do not log raw uploads or expose private file URLs.

## Agent execution contract

1. Classify the request (chat, coding, research, browser, file, vision, voice, or mixed).
2. Create a short task plan for multi-step requests.
3. Select only tools actually registered for the current deployment.
4. Execute one bounded step at a time and inspect each result.
5. Retry recoverable failures with a different strategy; stop on permission, safety, or hard infrastructure boundaries.
6. Verify the finished output with tests, source checks, or tool results.
7. Return a concise summary with changed files, validation performed, and any remaining blockers.

## Deployment notes

The current Vercel app does not yet include an OpenHands worker, Browser Use worker, desktop-control worker, hosted speech-to-speech service, document parser, database-backed accounts, billing, or subscription enforcement. Do not display these as live features until their adapters, authentication, isolation, and deployment configuration are implemented and tested.

Keep all provider credentials in Vercel environment variables or a dedicated secret manager. Never place keys in client-side code, commits, model prompts, or chat messages.
