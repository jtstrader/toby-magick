import { Keypoint, Pose } from "@tensorflow-models/pose-detection";
import { useEffect, useRef } from "react";
import { BearHeadProps } from "../interfaces/ComponentProps";
import { getPoses } from "../utils/keypoints";

export function BearHead({ videoRef, detectorRef }: BearHeadProps) {
  const bearHeadOutput = useRef<HTMLCanvasElement | null>(null);
  const requestAnimationId = useRef<number | null>(null);
  const tobyHead: HTMLImageElement = (() => {
    const img = new Image();
    img.src = require("../utils/toby.png");
    return img;
  })();

  /**
   * Start the animation frames
   */
  const start = () => {
    if (bearHeadOutput.current) {
      let canvas = bearHeadOutput.current;
      const ctx = canvas!.getContext("2d")!;

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

      const animate = async () => {
        console.log("Animating Bear Head");
        let poses: Pose[] = await getPoses(
          videoRef,
          detectorRef,
          minPoseConfidence
        );
        ctx.drawImage(videoRef.current!, 0, 0, canvas.width, canvas.height);
        poses.forEach(({ keypoints }) => {
          drawHead(ctx, keypoints);
        });

        if (requestAnimationId.current !== null) {
          requestAnimationFrame(animate);
        }
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

    ctx.drawImage(
      tobyHead,
      keypoints[0].x - distance * 1.25,
      keypoints[0].y - distance * 1.25,
      distance * 5,
      distance * 5
    );
  };

  useEffect(() => {
    // Initialize requestAnimationId to a negative (invalid) request id. This forces the animation
    // to loop at least once, but will not loop if the component unmounts (where requestAnimationId
    // is set to null).
    requestAnimationId.current = -1;

    start();

    return () => {
      console.log("Unmounting Bear Head");
      if (requestAnimationId.current) {
        cancelAnimationFrame(requestAnimationId.current);
      }
      requestAnimationId.current = null;
    };
  });

  return <canvas ref={bearHeadOutput} id="video-output"></canvas>;
}
