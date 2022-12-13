import { PoseDetector } from '@tensorflow-models/pose-detection';
import { RefObject } from 'react';

/**
 * Props of a generic view that requires a video feed and detector.
 */
export interface GenericVideoComponentProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  detectorRef: RefObject<PoseDetector | null>;
  handleMagickSwitch: () => void;
}

/**
 * Props of a specific view that requiers what a generic view does, but also a `backgroundRef` since it overlays a static image.
 */
export interface StaticBackgroundVideoComponentProps extends GenericVideoComponentProps {
  backgroundRef: RefObject<HTMLImageElement | null>;
}

/**
 * A coordinate on a drawable canvas.
 */
export interface Point {
  x: number;
  y: number;
}
