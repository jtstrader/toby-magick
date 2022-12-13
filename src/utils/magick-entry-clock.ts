import { Pose } from '@tensorflow-models/pose-detection';
import { createRef, MutableRefObject } from 'react';

import { log } from '@utils/constants';

/**
 * Initialize refs with default values.
 */
export const defaultRefs = () => {
  countdown.current = 4000;
  magickTime.current = 4000;
  magickReset.current = 1500;
};

/**
 * Countdown for ImageMagick
 */
const countdown: MutableRefObject<number | null> = createRef<number>();

/**
 * The amount of time since the last hand movement was detected.
 */
export const previousHand: MutableRefObject<number | null> = createRef<number | null>();

/**
 * Amount of time required to hold hand before entering ImageMagick menu. This value must be less than MODE_SWITCH_DELAY.
 */
export const magickTime: MutableRefObject<number | null> = createRef<number>();

/**
 * Amount of time allowed of the hand being down before the magick timer is reset.
 */
export const magickReset: MutableRefObject<number | null> = createRef<number>();

/**
 * Verify whether to decrement `magickTime` or `magickReset`. If the hand is raised, decrement `magickTime`. When this value hits zero, enter ImageMagick
 * mode. Otherwise, decremte `magickReset`. When this value hits zero, reset `magickTime` and `magickReset` to their default values.
 *
 *
 * @param poses Check if any keypoint has a raised hand. If so, decrement `magickTime`. Otherwise, decrement `magickReset`.
 *
 * @returns The new countdown value.
 */
export const magickCheck = (poses: Pose[]): number => {
  if (!magickTime.current || !magickReset.current) {
    log.error('magickCheck status =>', {
      magickTime: magickTime.current,
      magickReset: magickReset.current,
    });
    return 4000; // invalid configuration, magick counters should be defined
  }

  if (countdown.current === null) {
    countdown.current = 4000; // sanity check
  }

  if (
    poses.some(
      ({ keypoints }) => keypoints[9].y < keypoints[5].y && keypoints[10].y >= keypoints[6].y
    )
  ) {
    if (previousHand.current !== null) {
      magickReset.current = 1500;
      magickTime.current -= performance.now() - previousHand.current;
      if (magickTime.current < 3000) {
        countdown.current = magickTime.current;
      }
    }
    previousHand.current = performance.now();
  } else {
    if (previousHand.current !== null && magickTime.current !== 4000) {
      magickReset.current -= performance.now() - previousHand.current;
      if (magickReset.current < 0) {
        // Leave at warn level for debugging purposes, since this should not fire when attempting
        // to enter ImageMagick mode. Inform user that the clocks are resettings. Are they sure they
        // meant to do that?
        log.warn('Resetting magick clock timers');
        magickReset.current = 1500;
        magickTime.current = 4000;
        countdown.current = magickTime.current;
      }
    }
    previousHand.current = performance.now();
  }

  return countdown.current;
};

/**
 * Get the current countdown number.
 *
 * @returns The current countdown number, or 4000 if null.
 */
export const getCountdown = (): number => {
  return countdown.current ?? 4000;
};

/**
 * Use internal countdown in milliseconds and return the string representation.
 *
 * @returns A valid string representing a the countdown in seconds.
 */
export const formatCountdown = (): string => {
  if (countdown.current === null) {
    return '';
  }

  return `ImageMagick in ${Math.ceil(countdown.current / 1000)}`;
};
