import { PoseDetector } from "@tensorflow-models/pose-detection";
import { RefObject } from "react";

export interface BearHeadProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  detectorRef: RefObject<PoseDetector | null>;
  currentModeRef: RefObject<number>;
}

export interface WireframeProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  detectorRef: RefObject<PoseDetector | null>;
  backgroundRef: RefObject<HTMLImageElement | null>;
  currentModeRef: RefObject<number>;
}

export interface Point {
  x: number;
  y: number;
}
