import {
  Keypoint,
  Pose,
  PoseDetector,
} from "@tensorflow-models/pose-detection";
import { RefObject } from "react";

const partNames = [
  "nose",
  "leftEye",
  "rightEye",
  "leftEar",
  "rightEar",
  "leftShoulder",
  "rightShoulder",
  "leftElbow",
  "rightElbow",
  "leftWrist",
  "rightWrist",
  "leftHip",
  "rightHip",
  "leftKnee",
  "rightKnee",
  "leftAnkle",
  "rightAnkle",
];

const partIds: Map<string, number> = partNames.reduce((m, n, i) => {
  m.set(n, i);
  return m;
}, new Map());

const connectedPartNames = [
  ["leftHip", "leftShoulder"],
  ["leftElbow", "leftShoulder"],
  ["leftElbow", "leftWrist"],
  ["leftHip", "leftKnee"],
  ["leftKnee", "leftAnkle"],
  ["rightHip", "rightShoulder"],
  ["rightElbow", "rightShoulder"],
  ["rightElbow", "rightWrist"],
  ["rightHip", "rightKnee"],
  ["rightKnee", "rightAnkle"],
  ["leftShoulder", "rightShoulder"],
  ["leftHip", "rightHip"],
];

const poseChain = [
  ["nose", "leftEye"],
  ["leftEye", "leftEar"],
  ["nose", "rightEye"],
  ["rightEye", "rightEar"],
  ["nose", "leftShoulder"],
  ["leftShoulder", "leftElbow"],
  ["leftElbow", "leftWrist"],
  ["leftShoulder", "leftHip"],
  ["leftHip", "leftKnee"],
  ["leftKnee", "leftAnkle"],
  ["nose", "rightShoulder"],
  ["rightShoulder", "rightElbow"],
  ["rightElbow", "rightWrist"],
  ["rightShoulder", "rightHip"],
  ["rightHip", "rightKnee"],
  ["rightKnee", "rightAnkle"],
];

const connectedPartIndices = connectedPartNames.map((e) => {
  return [partIds.get(e[0])!, partIds.get(e[1])!];
});

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
  detectorRef: RefObject<PoseDetector | null>,
  minPoseConfidence: number
): Promise<Pose[]> {
  const estimationConfig = {
    maxPoses: 5,
    flipHorizontal: false,
    scoreThreshold: 0.5,
    nmsRadius: 20,
  };

  let res = await detectorRef.current?.estimatePoses(
    videoRef.current!,
    estimationConfig
  );

  return !res ? [] : res.filter(({ score }) => score! >= minPoseConfidence);
}

export const getAdjacentKeyPoints = (
  keypoints: Keypoint[],
  minConfidence: number
): Keypoint[][] => {
  let adj: Keypoint[][] = [];
  connectedPartIndices.forEach((n) => {
    let o = n[0];
    let i = n[1];
    if (
      !eitherPointDoesntMeetConfidence(
        keypoints[o],
        keypoints[i],
        minConfidence
      )
    ) {
      adj.push([keypoints[o], keypoints[i]]);
    }
  });
  return adj;
};

const eitherPointDoesntMeetConfidence = (
  k1: Keypoint,
  k2: Keypoint,
  minConfidence: number
): boolean => {
  return k1.score! < minConfidence || k2.score! < minConfidence;
};
