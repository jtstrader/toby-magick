import { Keypoint, Pose } from '@tensorflow-models/pose-detection';
import { useEffect, useRef } from 'react';
import { BearHeadProps } from '../interfaces/ComponentProps';
import { drawBearHead } from '../utils/drawing';
import { getPoses } from '../utils/keypoints';

/**
 * Create a live feed of people getting Toby's head drawn over their faces.
 *
 * @param BearHeadProps - A valid BearHeadProps instance with a videoRef and detectorRef. Both can be null, but must be initialized in order for a valid bear head to be generated.
 *
 * @returns A JSX.Element containing a canvas that is updated through `requestAnimationFrame` calls to draw a bear head over someone's face.
 */
export function BearHead({ videoRef, detectorRef }: BearHeadProps) {
  const bearHeadOutput = useRef<HTMLCanvasElement | null>(null);
  const requestAnimationId = useRef<number | null>(null);
  const tobyHead: HTMLImageElement = (() => {
    const img = new Image();
    img.src = require('../utils/toby.png');
    return img;
  })();

  /**
   * Start the animation frames
   */
  const start = () => {
    if (bearHeadOutput.current) {
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

      var raisedFrameCount = 75;
      var noRaisedFrameCount = 0;
      var magickMode = false;

      /**
       * Draw every frame of the live feed to the screen along with an overlayed bear head.
       */
      const animate = async () => {
        console.log('Animating Bear Head');
        let poses: Pose[] = await getPoses(videoRef, detectorRef, minPoseConfidence);
        ctx.drawImage(videoRef.current!, 0, 0, canvas.width, canvas.height);
        poses.forEach(({ keypoints }) => {
          if (keypoints[0].score! >= minPoseConfidence) {
            drawBearHead(ctx, keypoints, tobyHead);
          }
        });

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

    start();

    return () => {
      console.log('Unmounting Bear Head');
      if (requestAnimationId.current) {
        cancelAnimationFrame(requestAnimationId.current);
      }
      requestAnimationId.current = null;
    };
  });

  return <canvas ref={bearHeadOutput} id="video-output"></canvas>;
}
