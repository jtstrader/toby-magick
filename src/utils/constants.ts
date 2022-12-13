import { PosenetModelConfig } from "@tensorflow-models/pose-detection";

export const detectorConfig = {
  architecture: "MobileNetV1",
  outputStride: 16,
  inputResolution: { width: 1280, height: 720 },
  multiplier: 0.75,
} as PosenetModelConfig;
