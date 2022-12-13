import { Keypoint, Pose } from "@tensorflow-models/pose-detection";
import { useEffect, useRef } from "react";
import { WireframeProps } from "../interfaces/ComponentProps";
import { getPoses } from "../utils/keypoints";

export function Wireframe({
  videoRef,
  detectorRef,
  backgroundRef,
  currentModeRef,
}: WireframeProps) {
  const wireframeOutput = useRef<HTMLCanvasElement | null>(null);

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

      var raisedFrameCount = 75;
      var noRaisedFrameCount = 0;
      var magickMode = false;

      const animate = async () => {
        console.log("Animating Wireframe");
        let poses: Pose[] = await getPoses(videoRef, detectorRef);
        ctx.drawImage(
          backgroundRef.current!,
          0,
          0,
          canvas.width,
          canvas.height
        );
        poses.forEach(({ keypoints }) => {});

        if (currentModeRef.current === 1) {
          requestAnimationFrame(animate);
        }
      };

      animate();
    }
  };

  useEffect(() => {
    start();

    return () => {
      console.log("Unmounting Wireframe");
    };
  });

  return <canvas ref={wireframeOutput} id="video-output" />;
}
