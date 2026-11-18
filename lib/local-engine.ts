import { CreateMLCEngine, type MLCEngineInterface } from "@mlc-ai/web-llm";

// Keep one small model resident on mobile to avoid swapping large GPU allocations.
// The three KRUSHY personas are system prompts over this same local text model.
const MOBILE_MODEL_ID = "Llama-3.2-1B-Instruct-q4f16_1-MLC";
const MODEL_IDS: Record<string, string> = {
  "local-fast": MOBILE_MODEL_ID,
  "local-code": MOBILE_MODEL_ID,
  "local-vision": MOBILE_MODEL_ID,
};

let engine: MLCEngineInterface | null = null;
let loadedModel = "";
let creating: Promise<MLCEngineInterface> | null = null;
let generation = 0;

// Invalidates pending initializations too, so an old GPU promise cannot resurrect
// an engine after the browser has reported a lost/reset device.
export function resetLocalEngine() {
  generation += 1;
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
  const gpu = (navigator as Navigator & { gpu?: { requestAdapter: () => Promise<unknown> } }).gpu;
  if (!gpu) {
    throw new Error("This browser does not support WebGPU. Try the latest Chrome on a supported device, or open KRUSHY AI on a computer.");
  }
  const adapter = await gpu.requestAdapter();
  if (!adapter) {
    throw new Error("Your device did not provide a WebGPU adapter. Close other GPU-heavy tabs, reload Chrome, and try again. If it still fails, use a computer with WebGPU.");
  }

  const modelId = MODEL_IDS[slot];
  if (!modelId) throw new Error("Unknown local model selected.");
  if (engine && loadedModel === modelId) return engine;

  if (creating) {
    const pending = await creating;
    if (loadedModel === modelId) return pending;
  }

  const currentGeneration = generation;
  onProgress("Preparing the compact on-device model…");
  const pending = CreateMLCEngine(modelId, {
    initProgressCallback: (report) => {
      if (currentGeneration !== generation) return;
      const percent = Math.round((report.progress || 0) * 100);
      onProgress(report.text || `Downloading model files… ${percent}%`);
    },
  });
  creating = pending;
  try {
    const nextEngine = await pending;
    if (currentGeneration !== generation) {
      throw new Error("The browser GPU session changed during model setup. Reload this page, then download the model again.");
    }
    engine = nextEngine;
    loadedModel = modelId;
    onProgress("Model downloaded and ready on this device.");
    return nextEngine;
  } catch (error) {
    if (currentGeneration === generation) {
      engine = null;
      loadedModel = "";
      creating = null;
    }
    throw error;
  } finally {
    if (currentGeneration === generation) creating = null;
  }
}
