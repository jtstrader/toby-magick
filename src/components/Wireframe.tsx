import { Pose } from "@tensorflow-models/pose-detection";
import { useEffect, useRef } from "react";
import { WireframeProps } from "../interfaces/ComponentProps";
import { drawKeypoints, drawSkeleton } from "../utils/drawing";
import { getPoses } from "../utils/keypoints";

export function Wireframe({
  videoRef,
  detectorRef,
  backgroundRef,
}: WireframeProps) {
  const wireframeOutput = useRef<HTMLCanvasElement | null>(null);
  const requestAnimationId = useRef<number | null>(null);

  /**
   * Start the animation frames
   */
  const start = () => {
    if (wireframeOutput.current) {
      let canvas = wireframeOutput.current;
      const ctx = canvas!.getContext("2d")!;

      // TODO: Make configurable
      canvas.width = 1920;
      canvas.height = 1080;

      // Mirror the output image since using a camera looking at us
      ctx.scale(-1, 1);
      ctx.translate(-canvas.width, 0);

      // Confidence scores
      let minPoseConfidence = 0.15;
      let minPartConfidence = 0.1;

      var raisedFrameCount = 75;
      var noRaisedFrameCount = 0;
      var magickMode = false;

      const animate = async () => {
        console.log("Animating Wireframe");
        let poses: Pose[] = await getPoses(
          videoRef,
          detectorRef,
          minPoseConfidence
        );
        ctx.drawImage(
          backgroundRef.current!,
          0,
          0,
          canvas.width,
          canvas.height
        );
        poses.forEach(({ keypoints }) => {
          drawSkeleton(ctx, keypoints, minPartConfidence);
          drawKeypoints(ctx, keypoints, minPartConfidence);
        });

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
    start();

    return () => {
      console.log("Unmounting Wireframe");
      if (requestAnimationId.current) {
        cancelAnimationFrame(requestAnimationId.current);
      }
      requestAnimationId.current = null;
    };
  });

  return <canvas ref={wireframeOutput} id="video-output" />;
}
