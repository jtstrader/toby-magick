import { GenericVideoComponentProps } from '@interfaces/ComponentProps';
import { Pose } from '@tensorflow-models/pose-detection';
import { useEffect, useRef, useState } from 'react';

import { drawBearHead } from '@utils/drawing';
import { getPoses } from '@utils/keypoints';
import {
  formatCountdown,
  magickCheck,
  defaultRefs,
  getCountdown,
  magickTime,
  magickReset,
} from '@utils/magickTimer';

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
  const initialTime = useRef<number>(0);
  const fpsCount = useRef<number>(0);
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
      console.log('Animating Bear Head');
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
        console.log('Bear Head: animation frame started');
        let poses: Pose[] = await getPoses(videoRef, detectorRef, minPoseConfidence);
        ctx.drawImage(videoRef.current!, 0, 0, canvas.width, canvas.height);

        poses.forEach(({ keypoints }) => {
          drawBearHead(ctx, keypoints, tobyHead);
        });

        setCountdown(magickCheck(poses));

        fpsCount.current += 1;
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

    initialTime.current = performance.now();
    start();

    return () => {
      console.log(
        `Unmounting Bear Head. Average FPS: ${Math.floor(
          fpsCount.current / ((performance.now() - initialTime.current) / 1000)
        )}`
      );
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
