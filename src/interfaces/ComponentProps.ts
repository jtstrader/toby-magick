import { PoseDetector } from '@tensorflow-models/pose-detection';
import { RefObject } from 'react';

/**
 * Props of the BearHead component.
 */
export interface BearHeadProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  detectorRef: RefObject<PoseDetector | null>;
}

/**
 * Props of the Wireframe component. Requires a `backgroundRef` since it overlays a static image.
 */
export interface WireframeProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  detectorRef: RefObject<PoseDetector | null>;
  backgroundRef: RefObject<HTMLImageElement | null>;
}

/**
 * A coordinate on a drawable canvas.
 */
export interface Point {
  x: number;
  y: number;
}
