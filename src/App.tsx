import React, { useEffect, useRef, useState } from "react";
import "./App.css";

import * as poseDetection from "@tensorflow-models/pose-detection";
import "@tensorflow/tfjs-backend-webgl";
import { BearHead } from "./components/BearHead";
import { Wireframe } from "./components/Wireframe";
import { detectorConfig, MODE_SWITCH_DELAY } from "./utils/constants";
import { PoseDetector } from "@tensorflow-models/pose-detection";

function App() {
  const [mode, setMode] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const detectorRef = useRef<PoseDetector | null>(null);
  const backgroundRef = useRef<HTMLImageElement | null>(null);

  const modes: JSX.Element[] = [
    <BearHead videoRef={videoRef} detectorRef={detectorRef} />,
    <Wireframe
      videoRef={videoRef}
      detectorRef={detectorRef}
      backgroundRef={backgroundRef}
    />,
  ];

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

  // Get intitial state of room for wireframe component,
  // since that draws a frame over a static image, not a
  // live video feed.
  const getInitialImage = () => {
    let canvas = document.createElement("canvas");
    canvas.width = 1920;
    canvas.height = 1080;
    canvas
      .getContext("2d")
      ?.drawImage(videoRef.current!, 0, 0, canvas.width, canvas.height);
    let image = new Image();
    image.src = canvas.toDataURL();
    backgroundRef.current = image;
  };

  /**
   * Initialize video and PoseNet detector references. Video initialization is instant, while PoseNet is
   * asynchronous. Components should handle `null` detector references while the detector is being created.
   */
  useEffect(() => {
    getVideo();

    (async () => {
      detectorRef.current = await poseDetection.createDetector(
        poseDetection.SupportedModels.PoseNet,
        detectorConfig
      );
    })();
  }, [videoRef]);

  /**
   * Change modes with a specified amount of time. Time is set in the constants file.
   */
  useEffect(() => {
    (async () => {
      await new Promise<void>((resolve) =>
        setTimeout(() => {
          setMode((mode + 1) % 2);
          resolve();
        }, MODE_SWITCH_DELAY)
      );
    })();
  }, [mode]);

  return (
    <div className="App">
      <video
        ref={videoRef}
        onLoadedData={getInitialImage}
        hidden={true}
        width="1920px"
        height="1080px"
      />
      {modes[mode]}
    </div>
  );
}

export default App;
