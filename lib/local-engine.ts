import { CreateMLCEngine, type MLCEngineInterface } from "@mlc-ai/web-llm";

const MODEL_IDS: Record<string, string> = {
  "local-fast": "Llama-3.2-1B-Instruct-q4f16_1-MLC",
  "local-code": "Llama-3.2-1B-Instruct-q4f16_1-MLC",
  "local-vision": "gemma3-1b-it-q4f16_1-MLC",
};

let engine: MLCEngineInterface | null = null;
let loadedModel = "";
let creating: Promise<MLCEngineInterface> | null = null;

// Clear stale WebGPU references after a tab is suspended or the GPU device is reset.
export function resetLocalEngine() {
  engine = null;
  loadedModel = "";
  creating = null;
}

export async function getLocalEngine(
  slot: string,
  onProgress: (message: string) => void,
): Promise<MLCEngineInterface> {
  if (typeof window === "undefined") {
    throw new Error("Local AI can only run inside your browser.");
  }
  if (!("gpu" in navigator)) {
    throw new Error("This browser does not expose WebGPU. Try an updated Chrome browser on a supported device, or use KRUSHY AI on a computer.");
  }
  const modelId = MODEL_IDS[slot];
  if (!modelId) throw new Error("Unknown local model selected.");
  if (engine && loadedModel === modelId) return engine;
  if (creating) {
    const pending = await creating;
    if (loadedModel === modelId) return pending;
  }

  onProgress("Preparing secure on-device model download…");
  creating = CreateMLCEngine(modelId, {
    initProgressCallback: (report) => {
      const percent = Math.round((report.progress || 0) * 100);
      onProgress(report.text || `Downloading model files… ${percent}%`);
    },
  });
  try {
    const nextEngine = await creating;
    engine = nextEngine;
    loadedModel = modelId;
    onProgress("Model downloaded and ready on this device.");
    return nextEngine;
  } catch (error) {
    resetLocalEngine();
    throw error;
  } finally {
    creating = null;
  }
}
