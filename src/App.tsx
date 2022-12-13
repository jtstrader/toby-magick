import React, { useEffect, useRef, useState } from "react";
import logo from "./logo.svg";
import "./App.css";

import * as poseDetection from "@tensorflow-models/pose-detection";
import * as tf from "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-backend-webgl";
import { BearHead } from "./components/BearHead";
import { Wireframe } from "./components/Wireframe";
import { detectorConfig } from "./utils/constants";
import { PoseDetector } from "@tensorflow-models/pose-detection";

function App() {
  const [background, setBackground] = useState<HTMLImageElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const detectorRef = useRef<PoseDetector | null>(null);

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
    setBackground(image);
    console.log(image);
  };

  useEffect(() => {
    getVideo();

    // Initialize pose detector
    (async () => {
      detectorRef.current = await poseDetection.createDetector(
        poseDetection.SupportedModels.PoseNet,
        detectorConfig
      );
    })();
  }, [videoRef]);

  return (
    <div className="App">
      <video
        ref={videoRef}
        onLoadedData={getInitialImage}
        hidden={true}
        width="1920px"
        height="1080px"
      />
      <BearHead videoRef={videoRef} detectorRef={detectorRef} />
      {/* <Wireframe ref={videoRef} src={background?.src!} /> */}
    </div>
  );
}

export default App;
