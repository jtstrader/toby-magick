import { PosenetModelConfig } from '@tensorflow-models/pose-detection';
import { Logger } from 'tslog';

// TODO: Consider removing this from constants and allowing things such as resolution, architecture, etc. to be configurable
export const detectorConfig = {
  architecture: 'MobileNetV1',
  outputStride: 16,
  inputResolution: { width: 800, height: 600 },
  multiplier: 0.75,
} as PosenetModelConfig;

/**
 * The time to switch between `Bear Head` and `Wireframe` modes in milliseconds.
 */
export const MODE_SWITCH_DELAY = 10_000;

export const log = new Logger({ type: 'pretty', name: 'TobyMagickLogger' });
