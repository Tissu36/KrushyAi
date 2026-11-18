#!/usr/bin/env bash
set -euo pipefail

MODEL_ID="${1:?Usage: ./scripts/serve-vllm.sh MODEL_ID [SERVED_NAME]}"
SERVED_NAME="${2:-$MODEL_ID}"
PORT="${PORT:-8000}"

if [[ -z "${VLLM_API_KEY:-}" ]]; then
  echo "Set VLLM_API_KEY before exposing this server." >&2
  exit 1
fi

exec vllm serve "$MODEL_ID" \
  --served-model-name "$SERVED_NAME" \
  --host 0.0.0.0 \
  --port "$PORT" \
  --api-key "$VLLM_API_KEY"
