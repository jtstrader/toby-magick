import { StaticBackgroundVideoComponentProps } from '@interfaces/component-props';
import { Pose } from '@tensorflow-models/pose-detection';
import { useEffect, useRef, useState } from 'react';

import { log, MAGICK_ENABLED } from '@utils/constants';
import { drawKeypoints, drawSkeleton } from '@utils/drawing';
import { FPSAnalyzer, FPSAnalyzerError } from '@utils/fps';
import { getPoses } from '@utils/keypoints';
import {
  formatCountdown,
  magickCheck,
  magickTime,
  magickReset,
  defaultRefs,
  getCountdown,
} from '@utils/magick-entry-clock';

/**
 * Create a Wireframe of people standing in front of the camera. This component does *not* use live feeds, but a static image obtained on startup.
 *
 * @param StaticBackgroundVideoComponentProps - A valid WireframeProps instance with a videoRef, detectorRef, and backgroundRef. All three can be null, but must be initialized in order for a valid wireframe to be generated.
 *
 * @returns A JSX.Element containing a canvas that is updated through `requestAnimationFrame` calls to draw a wireframe to the screen over a static image of the background.
 */
export function Wireframe({
  videoRef,
  detectorRef,
  backgroundRef,
  handleMagickSwitch,
}: StaticBackgroundVideoComponentProps) {
  const wireframeOutput = useRef<HTMLCanvasElement | null>(null);
  const requestAnimationId = useRef<number | null>(null);
  const stats = useRef<FPSAnalyzer>();
  const [countdown, setCountdown] = useState<number>(4000);

  /**
   * Start the animation frames. Current request IDs are tracked by `requestAnimationId`.
   */
  const start = () => {
    if (wireframeOutput.current) {
      log.debug('Animating Wireframe');
      let canvas = wireframeOutput.current;
      const ctx = canvas!.getContext('2d')!;

      // TODO: Make configurable
      canvas.width = 1920;
      canvas.height = 1080;

      // Mirror the output image since using a camera looking at us
      ctx.scale(-1, 1);
      ctx.translate(-canvas.width, 0);

      // Confidence scores
      let minPoseConfidence = 0.15;
      let minPartConfidence = 0.1;

      /**
       * Draw the static background image overlayed with the wireframe of the people in front of the camera.
       */
      const animate = async () => {
        let poses: Pose[] = await getPoses(videoRef, detectorRef, minPoseConfidence);
        ctx.drawImage(backgroundRef.current!, 0, 0, canvas.width, canvas.height);
        poses.forEach(({ keypoints }) => {
          drawSkeleton(ctx, keypoints, minPartConfidence);
          drawKeypoints(ctx, keypoints, minPartConfidence);
        });

        if (MAGICK_ENABLED) {
          setCountdown(magickCheck(poses));
        }

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
          requestAnimationId.current = requestAnimationFrame(animate);
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
        log.debug('Unmountin Wireframe. FPS information could not be read at this time.');
      } else {
        log.debug('Unmounting Wireframe. FPS Information: ', fpsInfo);
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
        {`Entering ImageMagick in ${formatCountdown()}`}
      </div>
      <canvas ref={wireframeOutput} id="video-output" />
    </div>
  );
}
