import * as poseDetection from '@tensorflow-models/pose-detection';
import { PoseDetector } from '@tensorflow-models/pose-detection';
import '@tensorflow/tfjs-backend-webgl';
import { useEffect, useRef, useState } from 'react';

import { BearHead } from '@components/BearHead';
import { ImageMagick } from '@components/ImageMagick';
import { Wireframe } from '@components/Wireframe';

import { log, MODE_SWITCH_DELAY, MODEL_CONFIG } from '@utils/constants';

import './App.css';

function App() {
  const [mode, setMode] = useState(0);
  const [ready, setReady] = useState(false); // determines when the application can be shown
  const [clockStart, setClockStart] = useState(false); // determines when the clock can be started

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const detectorRef = useRef<PoseDetector | null>(null);
  const backgroundRef = useRef<HTMLImageElement | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const commandRef = useRef<string>();

  /**
   * Enter ImageMagick menu and stop state clock.
   */
  const enterImageMagick = () => {
    // Stop state clock
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setMode(2); // ImageMagick mode
  };

  /**
   * Exit ImageMagick menu and display effect with the provided command
   */
  const exitImageMagick = () => {
    setMode(0);
  };

  /**
   * Exit EffectDisplay and restart state clock
   */
  const exitEffectDisplay = () => {
    setMode(0);
  };

  const modes: JSX.Element[] = [
    <BearHead
      videoRef={videoRef}
      detectorRef={detectorRef}
      handleMagickSwitch={enterImageMagick}
    />,
    <Wireframe
      videoRef={videoRef}
      detectorRef={detectorRef}
      backgroundRef={backgroundRef}
      handleMagickSwitch={enterImageMagick}
    />,
    <ImageMagick
      videoRef={videoRef}
      detectorRef={detectorRef}
      handleMagickSwitch={exitImageMagick}
    />,
  ];

  /**
   * Obtain a video stream and set the videoRef pointer to the stream from the camera.
   */
  const getVideo = () => {
    navigator.mediaDevices
      .getUserMedia({
        video: { width: 1920, height: 1080 },
      })
      .then((stream) => {
        let video = videoRef.current;

        if (video === null) {
          video = new HTMLVideoElement();
        }

        video.srcObject = stream;
        video.play();
      });
  };

  /**
   *  Get intitial state of room for wireframe component, since that draws a frame over a static image, not a live video feed.
   */
  const getInitialImage = () => {
    let canvas = document.createElement('canvas');
    canvas.width = 1920;
    canvas.height = 1080;
    canvas.getContext('2d')?.drawImage(videoRef.current!, 0, 0, canvas.width, canvas.height);
    let image = new Image();
    image.src = canvas.toDataURL();
    backgroundRef.current = image;
    setReady(true);
  };

  /**
   * Initialize video and PoseNet detector references. Video initialization is instant, while PoseNet is
   * asynchronous. Components should handle `null` detector references while the detector is being created.
   */
  useEffect(() => {
    getVideo();
  }, [videoRef]);

  /**
   * Change modes with a specified amount of time. Time is set in the constants file.
   */
  useEffect(() => {
    if (mode !== 2 && timeoutRef.current !== null && clockStart) {
      (async () => {
        await new Promise<void>((resolve) => {
          timeoutRef.current = setTimeout(() => {
            setMode((mode + 1) % 2);
            resolve();
          }, MODE_SWITCH_DELAY);
        });
      })();
    }
  }, [mode, clockStart]);

  useEffect(() => {
    if (timeoutRef.current === null) {
      log.debug('Starting first clock');

      if (MODEL_CONFIG.default) {
        log.error('No valid model provided in .env. Defaulting to MoveNet');
      }

      log.info('Loaded with the following model configuration: ', MODEL_CONFIG!);

      (async () => {
        detectorRef.current = await poseDetection.createDetector(
          MODEL_CONFIG.model,
          MODEL_CONFIG.detectorConfig
        );
      })();

      (async () => {
        await new Promise<void>((resolve) => {
          timeoutRef.current = setTimeout(() => {
            setMode((mode + 1) % 2);
            setClockStart(true);
            resolve();
          }, MODE_SWITCH_DELAY);
        });
      })();
    }
  }, []);

  return (
    <div className="App">
      <video
        ref={videoRef}
        onLoadedData={getInitialImage}
        hidden={true}
        width="1920px"
        height="1080px"
      />
      {ready && modes[mode]}
    </div>
  );
}

export default App;
