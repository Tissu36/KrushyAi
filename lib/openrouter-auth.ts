const STORAGE_KEY = "krushy_openrouter_api_key";
const VERIFIER_KEY = "krushy_openrouter_code_verifier";

type AuthListener = () => void;
const listeners = new Set<AuthListener>();

export function onOpenRouterAuthChange(listener: AuthListener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notify() {
  listeners.forEach((listener) => listener());
}

function base64Url(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function getApiKey() {
  return typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
}

export function getOpenRouterApiKey() {
  return getApiKey();
}

export function clearOpenRouterApiKey() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
    notify();
  }
}

export function hasOpenRouterConnection() {
  return Boolean(getApiKey());
}

export async function initiateOpenRouterOAuth(callbackUrl?: string) {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  const verifier = base64Url(bytes);
  sessionStorage.setItem(VERIFIER_KEY, verifier);

  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(verifier),
  );
  const challenge = base64Url(new Uint8Array(digest));
  const url = callbackUrl ?? window.location.href.split("?")[0];

  window.location.href = `https://openrouter.ai/auth?${new URLSearchParams({
    callback_url: url,
    code_challenge: challenge,
    code_challenge_method: "S256",
  })}`;
}

export async function finishOpenRouterOAuth(code: string) {
  const verifier = sessionStorage.getItem(VERIFIER_KEY);
  if (!verifier) throw new Error("OpenRouter sign-in expired. Start the connection again.");

  sessionStorage.removeItem(VERIFIER_KEY);

  const response = await fetch("https://openrouter.ai/api/v1/auth/keys", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      code,
      code_verifier: verifier,
      code_challenge_method: "S256",
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenRouter sign-in failed (HTTP ${response.status}).`);
  }

  const data = await response.json();
  if (typeof data.key !== "string" || !data.key) {
    throw new Error("OpenRouter did not return an API key.");
  }

  localStorage.setItem(STORAGE_KEY, data.key);
  window.history.replaceState({}, "", window.location.pathname);
  notify();
}

export function hasPendingOpenRouterOAuth() {
  return typeof window !== "undefined" && sessionStorage.getItem(VERIFIER_KEY) !== null;
}
