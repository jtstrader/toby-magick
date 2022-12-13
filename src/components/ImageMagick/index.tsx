import { GenericVideoComponentProps } from '@interfaces/component-props';
import { Pose } from '@tensorflow-models/pose-detection';
import { useEffect, useRef, useState } from 'react';

import { Option } from '@components/ImageMagick/Option';

import { log } from '@utils/constants';
import { drawPoint, Point } from '@utils/drawing';
import { getPoses } from '@utils/keypoints';

import './index.css';

export function ImageMagick({
  videoRef,
  detectorRef,
  handleMagickSwitch,
}: GenericVideoComponentProps) {
  const imageMagickOutput = useRef<HTMLCanvasElement | null>(null);
  const requestAnimationId = useRef<number | null>(null);
  const [selected, setSelected] = useState<number>(0);

  const viewHeight = 1080;
  const options = ['Negate Image', 'Reverse Image', 'Pad Image', 'Solarize Image'].map((op, i) => (
    <Option key={i} name={op} border={selected === i} />
  ));

  /**
   * Generate a list of ranges that a right hand could fall under
   * to select an option.
   */
  const ranges: number[] = ((): number[] => {
    let ranges = [];
    for (let i = 1; i < options.length + 1; i++) {
      ranges.push((i * viewHeight) / options.length);
    }
    return ranges;
  })();

  /**
   * Start the animation frames
   */
  const start = () => {
    if (imageMagickOutput.current) {
      log.debug('Animating Image Magick With Ranges: ', ranges);
      let canvas = imageMagickOutput.current;
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
        // console.log('ImageMagick: animation frame starting');
        let poses: Pose[] = await getPoses(videoRef, detectorRef, minPoseConfidence);
        ctx.drawImage(videoRef.current!, 0, 0, canvas.width, canvas.height);

        poses.forEach(({ keypoints }) => {
          // Right wrist keypoint index = 10

          const p: Point = keypoints[10];
          drawPoint(ctx, p, 10);
        });

        if (poses.length > 0) {
          let y = poses[0].keypoints[10].y;

          for (let i = 0; i < options.length; i++) {
            if (y < ranges[i]) {
              setSelected(i);
              break;
            }
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

    start();

    return () => {
      log.debug('Unmounting Bear Head');
      if (requestAnimationId.current) {
        cancelAnimationFrame(requestAnimationId.current);
      }
      requestAnimationId.current = null;
    };
  }, []);

  return (
    <div id="image-magick-container">
      <div id="image-magick-video-container">
        <canvas ref={imageMagickOutput} id="image-magick-video-output" />
      </div>
      <div id="image-magick-menu-options">
        <header>ImageMagick Menu</header>
        {options}
      </div>
    </div>
  );
}
