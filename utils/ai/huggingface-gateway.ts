import { HfInference } from "@huggingface/inference";

const DEFAULT_MODELS = [
  process.env.HF_IMAGE_MODEL ?? "black-forest-labs/FLUX.1-schnell",
  "stabilityai/stable-diffusion-xl-base-1.0",
  "runwayml/stable-diffusion-v1-5",
];

export async function generateHuggingFaceImage(
  prompt: string,
): Promise<{ model: string; mimeType: string; base64Data: string }> {
  const token = process.env.HF_API_KEY;
  if (!token) throw new Error("HF_API_KEY is not configured on the server.");

  const hf = new HfInference(token);
  let lastError: unknown;

  for (const model of DEFAULT_MODELS) {
    try {
      // 30-second timeout per model candidate
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const image = await hf.textToImage(
        { model, inputs: prompt },
        { signal: controller.signal },
      );
      clearTimeout(timeoutId);

      const raw = image as unknown;
      if (typeof raw === "string") {
        const dataUrl = raw.match(/^data:(image\/[\w.+-]+);base64,(.+)$/);
        if (dataUrl)
          return { model, mimeType: dataUrl[1], base64Data: dataUrl[2] };
        const response = await fetch(raw);
        if (!response.ok)
          throw new Error(
            `Hugging Face image URL returned ${response.status}.`,
          );
        const bytes = Buffer.from(await response.arrayBuffer());
        return {
          model,
          mimeType: response.headers.get("content-type") ?? "image/jpeg",
          base64Data: bytes.toString("base64"),
        };
      }

      const blob = raw as Blob;
      const bytes = Buffer.from(await blob.arrayBuffer());
      return {
        model,
        mimeType: blob.type || "image/jpeg",
        base64Data: bytes.toString("base64"),
      };
    } catch (error) {
      console.warn(`HF model ${model} failed, trying next fallback:`, error);
      lastError = error;
    }
  }

  throw new Error(
    `All Hugging Face models failed. Last error: ${String(lastError)}`,
  );
}
