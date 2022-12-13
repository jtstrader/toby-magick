import { POSE_CONNECTIONS } from "@mediapipe/pose";
import { Keypoint, Pose } from "@tensorflow-models/pose-detection";
import { useEffect, useRef, useState } from "react";
import { BearHeadProps } from "../interfaces/ComponentProps";

export function BearHead({ videoRef, detectorRef }: BearHeadProps) {
  const output = useRef<HTMLCanvasElement | null>(null);
  const [background, setBackground] = useState<HTMLImageElement>();
  const tobyHead: HTMLImageElement = (() => {
    const img = new Image();
    img.src = require("../utils/toby.png");
    return img;
  })();

  /**
   * Start the animation frames
   */
  const start = () => {
    if (output.current) {
      let canvas = output.current;
      const ctx = canvas!.getContext("2d")!;

      canvas.width = 1920;
      canvas.height = 1080;

      ctx.scale(-1, 1);
      ctx.translate(-canvas.width, 0);

      var raisedFrameCount = 75;
      var noRaisedFrameCount = 0;
      var magickMode = false;

      const animate = async () => {
        const estimationConfig = {
          maxPoses: 5,
          flipHorizontal: false,
          scoreThreshold: 0.5,
          nmsRadius: 20,
        };

        let minPoseConfidence = 0.15;
        let minPartConfidence = 0.1;

        let poses: Pose[] = await detectorRef.current?.estimatePoses(
          videoRef.current!,
          estimationConfig
        )!;

        ctx.drawImage(videoRef.current!, 0, 0, canvas.width, canvas.height);

        poses.forEach(({ score, keypoints }) => {
          if (score! >= minPoseConfidence && !magickMode) {
            drawHead(ctx, keypoints);
          }
        });

        requestAnimationFrame(animate);
      };

      animate();
    }
  };

  const drawHead = (ctx: CanvasRenderingContext2D, keypoints: Keypoint[]) => {
    let eye1y = keypoints[1].y;
    let eye1x = keypoints[1].x;
    let eye2y = keypoints[2].y;
    let eye2x = keypoints[2].x;

    let distance = Math.sqrt(
      Math.pow(eye1x - eye2x, 2) + Math.pow(eye1y - eye2y, 2)
    );

    console.log(tobyHead);

    ctx.drawImage(
      tobyHead,
      keypoints[0].x - distance * 1.25,
      keypoints[0].y - distance * 1.25,
      distance * 5,
      distance * 5
    );
  };

  useEffect(() => {
    start();
  });

  return (
    <>
      <canvas ref={output} id="video-output"></canvas>
      <img
        src={require("../utils/toby.png")}
        alt="toby head not found!"
        hidden={true}
      ></img>
    </>
  );
}
