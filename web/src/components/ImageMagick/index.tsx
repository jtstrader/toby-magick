import { GenericVideoComponentProps } from '@interfaces/component-props';
import { Pose } from '@tensorflow-models/pose-detection';
import { useEffect, useRef, useState } from 'react';
import { getConvertedImage } from 'requests/magick';

import { Option } from '@components/ImageMagick/Option';

import { log } from '@utils/constants';
import { drawPoint, Point } from '@utils/drawing';
import { getPoses } from '@utils/keypoints';
import { defaultRefs, formatCountdown, magickCheck, magickTime } from '@utils/magick-entry-clock';

import './index.css';
import { getOptionStrings, OptionString } from './options';

export function ImageMagick({
  videoRef,
  detectorRef,
  handleMagickSwitch,
}: GenericVideoComponentProps) {
  const imageMagickVideoOutput = useRef<HTMLCanvasElement | null>(null);
  const imageMagickSnapshotOutput = useRef<HTMLCanvasElement | null>(null);
  const requestAnimationId = useRef<number | null>(null);
  const snapshotMode = useRef<boolean>(false);
  
  const [selected, setSelected] = useState<number>(0);
  const [options, setOptions] = useState<OptionString[]>([]);
  const [optionComponents, setOptionComponents] = useState<JSX.Element[]>([]);
  const [countdown, setCountdown] = useState<number>(4000);
  const [snapshotState, setSnapshotState] = useState<boolean>(false);
  const [magicked, setMagicked] = useState<boolean>(false);

  const numOptions = 4;
  const viewHeight = 1080;

  const ranges = ((len: number): number[] => {
    let ranges = [];
    for (let i = 1; i < len + 1; i++) {
      ranges.push((i * viewHeight) / len);
    }
    return ranges;
  })(numOptions);

  /**
   * Start the animation frames
   */
  const start = () => {
    if (imageMagickVideoOutput.current) {
      log.debug('Animating Image Magick With Ranges: ', ranges);
      let canvas = imageMagickVideoOutput.current;
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
        
        if (!snapshotMode.current) {
          poses.forEach(({ keypoints }) => {
            // Right wrist keypoint index = 10
            const p: Point = keypoints[10];
            drawPoint(ctx, p, 10);
          });

          if (poses.length > 0) {
            let y = poses[0].keypoints[10].y;

            for (let i = 0; i < ranges.length; i++) {
              if (y < ranges[i]) {
                setSelected(i);
                break;
              }
            }
          }

          setCountdown(magickCheck(poses, false));
        } 

        if (requestAnimationId.current !== null) {
          requestAnimationId.current = requestAnimationFrame(animate);
        }
      };

      animate();
    }
  };

  /**
   * Update components if a new selection is found.
   */
  useEffect(() => {
    setOptionComponents(
      options.map(({ displayName, cmd }, i) => {
        return <Option key={i} displayName={displayName} cmd={cmd} border={selected === i} />;
      })
    );
  }, [options, selected]);

  useEffect(() => {
    // Initialize requestAnimationId to a negative (invalid) request id. This forces the animation
    // to loop at least once, but will not loop if the component unmounts (where requestAnimationId
    // is set to null).
    // Load default values for clocks
    defaultRefs();
    requestAnimationId.current = -1;

    if (options.length === 0) {
      setOptions(getOptionStrings(numOptions));
    }


    start();

    return () => {
      log.debug('Unmounting ImageMagick');
      if (requestAnimationId.current) {
        cancelAnimationFrame(requestAnimationId.current);
      }
      requestAnimationId.current = null;
    };
  }, []);

  /**
   * Prepare for snapshot
   */
  useEffect(() => {
    if (countdown <= 0 && !snapshotMode.current) {
      log.debug('Effect locked in!');
      defaultRefs();
      setSnapshotState(true);
      setCountdown(6000);
    } 
  }, [countdown]);
  
  /**
   * Take a snapshot
  */
 useEffect(() => {
   if (snapshotState) {
      snapshotMode.current = true; // turn off detection of right hand 
      (async () => {
        for (let time = 5000; time >= 0; time -= 1000) {
          setCountdown(time);
          await new Promise<void>((resolve) => setTimeout(resolve, 1000));
        }
        setCountdown(6000);
        await takeSnapshot();
      })();
    }
  }, [snapshotState])
  
  /**
   * Return to menu after snapshot has been loaded
   */
  useEffect(() => {
    if (magicked) {
      (async () => {
        for (let time = 5000; time >= 0; time -= 1000) {
          setCountdown(time);
          await new Promise<void>((resolve) => setTimeout(resolve, 1000));
        }
  
        handleMagickSwitch();
      })()
    }
  }, [magicked])

  const takeSnapshot = async () => {
    if (imageMagickSnapshotOutput.current) {
      log.debug('Taking snapshot!');

      // Get image from video feed
      let tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d')!;
      tempCanvas.width = 960;
      tempCanvas.height = 540;
      tempCanvas.hidden = true;
      tempCtx.drawImage(videoRef.current!, 0, 0, tempCanvas.width, tempCanvas.height);
      const base64 = tempCanvas.toDataURL();

      // Get affect image from ImageMagick
      const res = await getConvertedImage(base64, options[selected]);
      let i = new Image();
      i.src = `data:image/png;base64,${res.img}`;
      
      // When image is ready, draw it!
      i.onload = () => {
        let canvas = imageMagickSnapshotOutput.current!;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(i, 0, 0, canvas.width, canvas.height);
        setMagicked(true);
      };
    }
  };

  return (
    <div id="image-magick-container">
      <div id="image-magick-video-container">
        <canvas ref={imageMagickVideoOutput} id="image-magick-video-output" />
      </div>
      <div id="image-magick-menu-options">
        <header>ImageMagick Menu</header>
        {optionComponents}
        <div
          className="image-magick-menu-countdown"
          hidden={countdown >= 4000 || snapshotState}
        >{`Selecting effect in ${formatCountdown()}`}</div>
        <div
          className="image-magick-menu-countdown"
          hidden={countdown >= 6000 || !snapshotState || magicked}
        >{`Taking snapshot in ${Math.ceil(countdown / 1000)}`}</div>
        <div className="image-magick-menu-countdown" hidden={!magicked}>
          {`Returning to main menu in ${Math.ceil(countdown / 1000)}`}
        </div>
        <canvas
          ref={imageMagickSnapshotOutput}
          id="image-magick-snapshot-output"
          hidden={!magicked}
        />
      </div>
    </div>
  );
}
