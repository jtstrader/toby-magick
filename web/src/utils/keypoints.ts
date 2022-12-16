import { Keypoint, Pose, PoseDetector } from '@tensorflow-models/pose-detection';
import { RefObject } from 'react';

/**
 * Names of all potential keypoints. Ordered the same as the PoseNet returns.
 */
const partNames = [
  'nose',
  'leftEye',
  'rightEye',
  'leftEar',
  'rightEar',
  'leftShoulder',
  'rightShoulder',
  'leftElbow',
  'rightElbow',
  'leftWrist',
  'rightWrist',
  'leftHip',
  'rightHip',
  'leftKnee',
  'rightKnee',
  'leftAnkle',
  'rightAnkle',
];

/**
 * A map that relates the name of a keypoint to its index in the `partNames` list.
 */
const partIds: Map<string, number> = partNames.reduce((m, n, i) => {
  m.set(n, i);
  return m;
}, new Map());

/**
 * Names of adjacent keypoints.
 */
const connectedPartNames = [
  ['leftHip', 'leftShoulder'],
  ['leftElbow', 'leftShoulder'],
  ['leftElbow', 'leftWrist'],
  ['leftHip', 'leftKnee'],
  ['leftKnee', 'leftAnkle'],
  ['rightHip', 'rightShoulder'],
  ['rightElbow', 'rightShoulder'],
  ['rightElbow', 'rightWrist'],
  ['rightHip', 'rightKnee'],
  ['rightKnee', 'rightAnkle'],
  ['leftShoulder', 'rightShoulder'],
  ['leftHip', 'rightHip'],
];

/**
 * Indices of adjacent keypoints.
 */
const connectedPartIndices = connectedPartNames.map((e) => {
  return [partIds.get(e[0])!, partIds.get(e[1])!];
});

/**
 * Generate a list of poses that pass a given confidence score. Note that multiple poses means multiple people being identified.
 *
 * @param videoRef - A reference to a video stream. Can be null if waiting on the video object to be created.
 * @param detectorRef - A reference to an instance of TensorFlow's PoseDetector. Can be null if waiting for detector to be created.
 * @param minPoseConfidence - The minimum required confidence for a pose to be accepted to be drawn.
 *
 * @returns A list of poses filtered by a minimum required pose confidence score.
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

  let res = await detectorRef.current?.estimatePoses(videoRef.current!, estimationConfig);

  return !res ? [] : res.filter(({ score }) => score! >= minPoseConfidence);
}

/**
 * Get a list of adjacent keypoints that have a confidence score above the minimum required. The adjacency of two keypoints is declared in
 * `connectedPartNames`. The adjacent parts are:
 *
 * ```js
 *    ["leftHip", "leftShoulder"]
 *    ["leftElbow", "leftShoulder"]
 *    ["leftElbow", "leftWrist"]
 *    ["leftHip", "leftKnee"]
 *    ["leftKnee", "leftAnkle"]
 *    ["rightHip", "rightShoulder"]
 *    ["rightElbow", "rightShoulder"]
 *    ["rightElbow", "rightWrist"]
 *    ["rightHip", "rightKnee"]
 *    ["rightKnee", "rightAnkle"]
 *    ["leftShoulder", "rightShoulder"]
 *    ["leftHip", "rightHip"]
 * ```
 *
 * @param keypoints - A list of keypoints obtained through PoseNet.
 * @param minConfidence - The minimum confidence required to be accepted.
 *
 * @returns A list of all adjacent keypoints that have a confidence score above the minimum required.
 */
export const getAdjacentKeyPoints = (
  keypoints: Keypoint[],
  minConfidence: number
): Keypoint[][] => {
  let adj: Keypoint[][] = [];
  connectedPartIndices.forEach((n) => {
    let o = n[0];
    let i = n[1];
    if (!eitherPointDoesntMeetConfidence(keypoints[o], keypoints[i], minConfidence)) {
      adj.push([keypoints[o], keypoints[i]]);
    }
  });
  return adj;
};

/**
 * Check if either keypoint's confidence score falls under the minimum allowed value.
 *
 * @param k1 - One adjacent keypoint.
 * @param k2 - The other adjacent keypoint.
 * @param minConfidence - The minimum confidence level a keypoint's score can be to be accepted.
 *
 * @returns `false` if either keypoint's confidence score is under the minimum allowed value, or `true` otherwise.
 */
const eitherPointDoesntMeetConfidence = (
  k1: Keypoint,
  k2: Keypoint,
  minConfidence: number
): boolean => {
  return k1.score! < minConfidence || k2.score! < minConfidence;
};
