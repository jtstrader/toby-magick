import { createRef, MutableRefObject } from 'react';

/**
 * Measures the viewed frames, the time between first and last viewing, and the average FPS of the view.
 */
export class FPSAnalyzer {
  private initialTime: number | undefined;
  private fpsInfo: MutableRefObject<FPSInfo>;

  constructor() {
    this.fpsInfo = createRef<FPSInfo>() as MutableRefObject<FPSInfo>;

    if (this.fpsInfo === undefined) {
      throw new FPSAnalyzerError('Could not create FPSInfo reference.');
    }

    this.fpsInfo.current = {
      timeDiff: 0,
      framesRead: 0,
      fps: 0,
    };
  }

  /**
   * Start the clock by setting the initial time.
   */
  start() {
    this.initialTime = performance.now();
    this.update();
  }

  /**
   * Update the `FPSInfo` ref with new data.
   */
  update() {
    if (this.initialTime === undefined) {
      throw new FPSAnalyzerError('Initial time uninitialized! Did you forget to run start()?');
    }

    this.fpsInfo.current.framesRead += 1;
    this.fpsInfo.current.timeDiff = (performance.now() - this.initialTime) / 1000;
    this.fpsInfo.current.fps =
      this.fpsInfo.current.timeDiff === 0
        ? 0
        : this.fpsInfo.current.framesRead / this.fpsInfo.current.timeDiff;
  }

  /**
   * Stop the clock and force a re-run of `start` to re-initialize the clock.
   */
  stop() {
    if (this.initialTime === undefined) {
      throw new FPSAnalyzerError('Initial time uninitialized! Did you forget to run start()?');
    }
    this.initialTime = undefined;
  }

  /**
   * Get the internally stored FPS info for the view to display/log to the user.
   */
  getFPSInfo(): FPSInfo {
    return this.fpsInfo.current;
  }
}

export class FPSAnalyzerError extends Error {
  constructor(msg: string) {
    super(msg);
    Object.setPrototypeOf(this, FPSAnalyzerError.prototype);
  }
}

/**
 * The FPS information for either BearHead or Wireframe.
 */
export interface FPSInfo {
  timeDiff: number;
  framesRead: number;
  fps: number;
}
