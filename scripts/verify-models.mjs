#!/usr/bin/env node
/**
 * Live smoke-test every alias in KRUSHY_MODEL_MAP against an OpenAI-compatible
 * gateway (for example LiteLLM). Run with:
 *   node --env-file=.env.local scripts/verify-models.mjs
 *
 * This makes one small billable request per configured model. Keep the gateway
 * URL and keys private; output intentionally never includes credentials.
 */
const base = (process.env.KRUSHY_MODEL_BASE_URL || "").replace(/\/$/, "");
const apiKey = process.env.KRUSHY_MODEL_API_KEY || "";
let modelMap = {};
try {
  modelMap = JSON.parse(process.env.KRUSHY_MODEL_MAP || "{}");
} catch {
  console.error("KRUSHY_MODEL_MAP must be valid JSON.");
  process.exit(2);
}
if (!base) {
  console.error("Missing KRUSHY_MODEL_BASE_URL.");
  process.exit(2);
}
if (!modelMap || typeof modelMap !== "object" || Array.isArray(modelMap)) {
  console.error("KRUSHY_MODEL_MAP must be a JSON object of KRUSHY IDs to gateway model aliases.");
  process.exit(2);
}
const entries = Object.entries(modelMap).filter(([id, alias]) =>
  /^[a-z0-9][a-z0-9-]{1,80}$/.test(id) && typeof alias === "string" && alias.trim()
);
if (!entries.length) {
  console.error("No valid model aliases found in KRUSHY_MODEL_MAP.");
  process.exit(2);
}

let failed = 0;
console.log(`Testing ${entries.length} configured model alias(es) at ${base}/chat/completions`);
for (const [id, rawAlias] of entries) {
  const alias = rawAlias.trim();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);
  const started = Date.now();
  try {
    const response = await fetch(`${base}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify({
        model: alias,
        messages: [{ role: "user", content: "Reply with exactly: KRUSHY_OK" }],
        max_tokens: 16,
        temperature: 0,
        stream: false,
      }),
      signal: controller.signal,
    });
    const elapsed = Date.now() - started;
    if (!response.ok) {
      const detail = (await response.text()).replace(/[\r\n]+/g, " ").slice(0, 180);
      console.log(`FAIL  ${id} -> ${alias} | HTTP ${response.status} | ${elapsed}ms | ${detail}`);
      failed++;
      continue;
    }
    const data = await response.json();
    const answer = data?.choices?.[0]?.message?.content;
    if (typeof answer !== "string" || !answer.trim()) {
      console.log(`FAIL  ${id} -> ${alias} | HTTP 200 but response had no text | ${elapsed}ms`);
      failed++;
      continue;
    }
    console.log(`PASS  ${id} -> ${alias} | HTTP 200 | ${elapsed}ms`);
  } catch (error) {
    const message = error?.name === "AbortError" ? "timed out after 30s" : (error?.message || "network error");
    console.log(`FAIL  ${id} -> ${alias} | ${message}`);
    failed++;
  } finally {
    clearTimeout(timeout);
  }
}
console.log(`\nResult: ${entries.length - failed}/${entries.length} model(s) passed live smoke tests.`);
if (failed) process.exitCode = 1;
