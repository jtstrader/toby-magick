import {
  MoveNetModelConfig,
  PosenetModelConfig,
  TrackerType,
  movenet,
  SupportedModels,
  ModelConfig,
} from '@tensorflow-models/pose-detection';
import { Logger } from 'tslog';

// TODO: Consider removing this from constants and allowing things such as resolution, architecture, etc. to be configurable

/**
 * The time to switch between `Bear Head` and `Wireframe` modes in milliseconds.
 */
export const MODE_SWITCH_DELAY = 10_000;

/**
 * TobyHead to be displayed in the BearHead component. Should only be loaded once.
 */
export const tobyHead: HTMLImageElement = (() => {
  const img = new Image();
  img.src = require('@utils/toby.png');
  return img;
})();

/**
 * Custom logger for debugging.
 */
export const log = new Logger({
  prettyLogTemplate:
    '{{yyyy}}-{{mm}}-{{dd}} {{hh}}:{{MM}}:{{ss}}:{{ms}} {{logLevelName}} [{{name}}]',
  prettyErrorTemplate: '\n{{errorName}} {{errorMessage}}\nerror stack:\n{{errorStack}}',
  prettyErrorStackTemplate: '  • {{fileName}}\t{{method}}\n\t{{filePathWithLine}}',
  prettyErrorParentNamesSeparator: ':',
  prettyErrorLoggerNameDelimiter: '\t',
  stylePrettyLogs: true,
  prettyLogStyles: {
    logLevelName: {
      '*': ['bold', 'black', 'bgWhiteBright', 'dim'],
      SILLY: ['bold', 'white'],
      TRACE: ['bold', 'whiteBright'],
      DEBUG: ['bold', 'green'],
      INFO: ['bold', 'blue'],
      WARN: ['bold', 'yellow'],
      ERROR: ['bold', 'red'],
      FATAL: ['bold', 'redBright'],
    },
    dateIsoStr: 'white',
    name: ['white', 'bold'],
    nameWithDelimiterPrefix: ['white', 'bold'],
    nameWithDelimiterSuffix: ['white', 'bold'],
    errorName: ['bold', 'bgRedBright', 'whiteBright'],
  },
  name: 'TobyMagickLogger',
});

/**
 * Represents the current model configuration built from the .env file. Default model is MoveNet.
 */
interface EnvModelConfig {
  model: SupportedModels;
  detectorConfig: ModelConfig;
  default?: boolean;
}

/**
 * The model configuration built from the .env file. Defaults to MoveNet.
 */
export const MODEL_CONFIG: EnvModelConfig = (() => {
  const modelName = process.env.REACT_APP_MODEL;
  if (modelName === 'PoseNet') {
    return {
      model: SupportedModels.PoseNet,
      detectorConfig: {
        architecture: 'MobileNetV1',
        outputStride: 16,
        inputResolution: { width: 800, height: 600 },
        multiplier: 0.75,
      } as PosenetModelConfig,
    };
  } else {
    return {
      model: SupportedModels.MoveNet,
      detectorConfig: {
        modelType: movenet.modelType.MULTIPOSE_LIGHTNING,
        enableTracking: true,
        trackerType: TrackerType.BoundingBox,
      } as MoveNetModelConfig,
      default: process.env.REACT_APP_MODEL !== 'MoveNet',
    };
  }
})();

/**
 * Flask API for converting images
 */
export const FLASK_URL: string = 'http://127.0.0.1:5000';

/**
 * To see if the application should have ImageMagick running, default to false
 */
export const MAGICK_ENABLED: boolean = (() => {
  let magick = process.env.REACT_APP_MAGICK_ENABLED;
  if (magick) {
    try {
      return parseInt(magick) > 0;
    } catch (_) {
      log.error(`Could not not parse environment variable MAGICK_ENABLED: ${magick} provided`);
      return false;
    }
  }
  return false;
})();
