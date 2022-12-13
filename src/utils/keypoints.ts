import { Pose, PoseDetector } from "@tensorflow-models/pose-detection";
import { RefObject } from "react";

/**
 * Generate a list of poses that pass a given confidence score. Note that multiple poses means multiple people being identified.
 *
 * @param videoRef A reference to a video stream. Can be null if waiting on the video object to be created.
 * @param detectorRef A reference to an instance of TensorFlow's PoseDetector. Can be null if waiting for detector to be created.
 *
 * @returns A list of poses filtered out by a minimum confidence score.
 */
export async function getPoses(
  videoRef: RefObject<HTMLVideoElement | null>,
  detectorRef: RefObject<PoseDetector | null>
): Promise<Pose[]> {
  const estimationConfig = {
    maxPoses: 5,
    flipHorizontal: false,
    scoreThreshold: 0.5,
    nmsRadius: 20,
  };

  let minPoseConfidence = 0.15;

  let res = await detectorRef.current?.estimatePoses(
    videoRef.current!,
    estimationConfig
  );

  return !res ? [] : res.filter(({ score }) => score! >= minPoseConfidence);
}
