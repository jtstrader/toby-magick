import { GenericVideoComponentProps } from '@interfaces/component-props';
import { Pose } from '@tensorflow-models/pose-detection';
import { useEffect, useRef, useState } from 'react';

import { log } from '@utils/constants';
import { drawBearHead } from '@utils/drawing';
import { FPSAnalyzer, FPSAnalyzerError } from '@utils/fps';
import { getPoses } from '@utils/keypoints';
import {
  formatCountdown,
  magickCheck,
  defaultRefs,
  getCountdown,
  magickTime,
  magickReset,
} from '@utils/magick-entry-clock';

/**
 * Create a live feed of people getting Toby's head drawn over their faces.
 *
 * @param BearHeadProps - A valid BearHeadProps instance with a videoRef and detectorRef. Both can be null, but must be initialized in order for a valid bear head to be generated.
 *
 * @returns A JSX.Element containing a canvas that is updated through `requestAnimationFrame` calls to draw a bear head over someone's face.
 */
export function BearHead({
  videoRef,
  detectorRef,
  handleMagickSwitch,
}: GenericVideoComponentProps) {
  const bearHeadOutput = useRef<HTMLCanvasElement | null>(null);
  const requestAnimationId = useRef<number | null>(null);
  const stats = useRef<FPSAnalyzer>();
  const [countdown, setCountdown] = useState<number>(4000);
  const tobyHead: HTMLImageElement = (() => {
    const img = new Image();
    img.src = require('@utils/toby.png');
    return img;
  })();

  /**
   * Start the animation frames
   */
  const start = () => {
    if (bearHeadOutput.current) {
      log.debug('Animating Bear Head');
      let canvas = bearHeadOutput.current;
      const ctx = canvas!.getContext('2d')!;

      // TODO: Make configurable
      canvas.width = 1920;
      canvas.height = 1080;

      // Mirror the output image since using a camera looking at us
      ctx.scale(-1, 1);
      ctx.translate(-canvas.width, 0);

      // Confidence scores
      let minPoseConfidence = 0.15;

      /**
       * Draw every frame of the live feed to the screen along with an overlayed bear head.
       */
      const animate = async () => {
        let poses: Pose[] = await getPoses(videoRef, detectorRef, minPoseConfidence);
        ctx.drawImage(videoRef.current!, 0, 0, canvas.width, canvas.height);

        poses.forEach(({ keypoints }) => {
          drawBearHead(ctx, keypoints, tobyHead);
        });

        setCountdown(magickCheck(poses));

        try {
          stats.current?.update();
        } catch (e) {
          // This could be timing issues with cancelling animations. Ignore this
          // error if an FPSAnalyzeError for now since base useEffect requires
          // stats to be initialized.
          if (!(e instanceof FPSAnalyzerError)) {
            throw e;
          }
        }

        if (requestAnimationId.current !== null) {
          requestAnimationFrame(animate);
        }
      };

      animate();
    }
  };

  useEffect(() => {
    // Initialize requestAnimationId to a negative (invalid) request id. This forces the animation
    // to loop at least once, but will not loop if the component unmounts (where requestAnimationId
    // is set to null).
    requestAnimationId.current = -1;
    setCountdown(getCountdown());
    if (magickTime.current === null && magickReset.current === null) {
      defaultRefs();
    }

    stats.current = new FPSAnalyzer();
    stats.current.start(); // start reading FPS
    start(); // start animation

    return () => {
      stats.current?.stop();
      const fpsInfo = stats.current?.getFPSInfo();

      if (!fpsInfo || fpsInfo.framesRead <= 1) {
        log.debug('Unmountin Bear Head. FPS information could not be read at this time.');
      } else {
        log.debug('Unmounting Bear Head. FPS Information: ', fpsInfo);
      }

      if (requestAnimationId.current) {
        cancelAnimationFrame(requestAnimationId.current);
      }
      requestAnimationId.current = null;
    };
  }, []);

  /**
   * Enter ImageMagick.
   */
  useEffect(() => {
    if (countdown <= 0) {
      defaultRefs();
      handleMagickSwitch();
    }
  }, [handleMagickSwitch, countdown]);

  return (
    <div>
      <div className="image-magick-notif" hidden={countdown === 4000}>
        {formatCountdown()}
      </div>
      <canvas ref={bearHeadOutput} id="video-output"></canvas>
    </div>
  );
}
