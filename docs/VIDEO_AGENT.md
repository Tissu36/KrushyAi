# KRUSHY AI — Video Creation Agent

## Purpose

Give KRUSHY AI a repeatable workflow for creating motion graphics, explainers, product promos, animated scenes, and short videos from a text brief.

Reference collection: https://github.com/joeseesun/opus-video-prompts

That repository is a useful index of public examples and prompts. It demonstrates code-rendered video workflows; it does not provide a video-generation model or a ready-made rendering service. Check original author attribution and usage rights before reusing any example prompt verbatim.

## What the agent can create

- Motion graphics and animated typography
- Product launch and promotional videos
- Explainer videos and educational animations
- 2D Canvas / p5.js animations
- Three.js interactive scenes and rendered sequences
- Remotion compositions
- Manim-style mathematical explainers
- Blender procedural scenes when Blender is installed
- Video assembly, audio mix, subtitles, and export using FFmpeg

For photorealistic live-action footage, the agent needs access to a separate video-generation provider. Code-rendering alone does not produce authentic camera footage of real people or places.

## Workflow

1. Clarify only essential missing details: purpose, duration, aspect ratio, audience, brand assets, and output format. If the user leaves creative details open, choose sensible defaults.
2. Write a short storyboard with scenes, timing, narration, on-screen text, transitions, and audio direction.
3. Select the simplest suitable renderer:
   - HTML Canvas / p5.js for lightweight 2D animation.
   - Three.js for 3D scenes.
   - Remotion for React-based timeline compositions.
   - Manim for mathematical and technical explainers.
   - Blender for advanced 3D scenes.
4. Build the project in a dedicated workspace. Keep source assets, project files, and output files organized.
5. Render a low-resolution preview first. Capture representative frames and inspect composition, text legibility, clipping, motion, continuity, and responsive framing.
6. Fix visual defects, then render the final resolution and frame rate.
7. Use FFmpeg to assemble frames/video, mix audio, normalize levels, and export the requested format.
8. Verify the final file exists, can be decoded, has the requested duration and aspect ratio, and includes expected audio/subtitles.
9. Return the video and editable source project, plus a short summary of the render settings and any limitations.

## Required runtime integrations

A real video feature needs an isolated worker with:
- Node.js and a browser renderer such as Playwright / Chromium.
- FFmpeg for encoding and audio/video assembly.
- Optional Remotion, Three.js, p5.js, Manim, Blender, and TTS dependencies.
- Storage for project files, generated assets, previews, and final exports.
- Job status, progress events, cancellation, resource/time limits, and cleanup.

Do not run long renders in a Next.js request handler or rely on a Vercel serverless function as a persistent render machine. Use a queue and dedicated worker/container.

## Quality and safety checks

- Use only user-provided assets or assets with suitable usage rights.
- Do not imitate a living artist's exact style; describe visual qualities instead.
- Do not invent factual narration or statistics. Verify factual scripts when research tools are available.
- Start audio only after a user gesture in browser previews.
- Escape and validate text inserted into generated HTML.
- Run generated code in an isolated environment without access to secrets or host files.
- Never report a successful render unless the worker confirms the output and validation checks pass.

## Default deliverable

Unless the user asks otherwise, deliver:
- MP4 preview/final export (H.264, 1080p, 30 fps, 16:9).
- Editable project source.
- A thumbnail image.
- A brief storyboard and render report.
