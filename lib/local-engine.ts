import { CreateMLCEngine, type MLCEngineInterface } from "@mlc-ai/web-llm";

const MODEL_IDS: Record<string, string> = {
  "local-llama": "Llama-3.2-1B-Instruct-q4f16_1-MLC",
  "local-gemma": "gemma3-1b-it-q4f16_1-MLC",
};

let engine: MLCEngineInterface | null = null;
let loadedModel = "";

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

  onProgress("Downloading model files for the first time. Keep this tab open…");
  const nextEngine = await CreateMLCEngine(modelId, {
    initProgressCallback: (report) => {
      const percent = Math.round((report.progress || 0) * 100);
      onProgress(report.text || `Loading local model… ${percent}%`);
    },
  });
  engine = nextEngine;
  loadedModel = modelId;
  onProgress("Local model ready.");
  return nextEngine;
}
