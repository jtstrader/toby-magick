import { PoseDetector } from "@tensorflow-models/pose-detection";
import { RefObject } from "react";

export interface BearHeadProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  detectorRef: RefObject<PoseDetector | null>;
}

export interface WireframeProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  detectorRef: RefObject<PoseDetector | null>;
  src: string;
}
