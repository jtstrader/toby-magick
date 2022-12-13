import { MoveNetModelConfig } from '@tensorflow-models/pose-detection';
import * as poseDetection from '@tensorflow-models/pose-detection';
import { Logger } from 'tslog';

// TODO: Consider removing this from constants and allowing things such as resolution, architecture, etc. to be configurable
export const detectorConfig = {
  modelType: poseDetection.movenet.modelType.MULTIPOSE_LIGHTNING,
  enableTracking: true,
  trackerType: poseDetection.TrackerType.BoundingBox
} as MoveNetModelConfig;

/**
 * The time to switch between `Bear Head` and `Wireframe` modes in milliseconds.
 */
export const MODE_SWITCH_DELAY = 10_000;

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
