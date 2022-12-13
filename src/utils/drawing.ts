import { Keypoint } from '@tensorflow-models/pose-detection';
import { Point } from '../interfaces/ComponentProps';
import { getAdjacentKeyPoints } from './keypoints';

/**
 * Generate a random color and return its hex string.
 *
 * Credit to https://stackoverflow.com/questions/1484506/random-color-generator
 *
 * @returns A random hex string for a color
 */
const getRandomColor = (): string => {
  let letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

/**
 * Draw an eye on the wireframe. The position of the eye is based on the distance between the two eye keypoints.
 *
 * @param ctx - The drawing context. Should point to a valid 2D canvas context.
 * @param p - An eye's keypoint in (x, y) form.
 * @param distance - The distance between the two eyes.
 */
const drawEye = (ctx: CanvasRenderingContext2D, p: Point, distance: number): void => {
  drawPoint(ctx, p, distance / 3, 'white');
  drawPoint(ctx, p, distance / 4, 'blue');
  drawPoint(ctx, p, distance / 5, 'black');

  let shiftedPoint = p;
  shiftedPoint.x -= distance / 20;
  shiftedPoint.y -= distance / 20;

  drawPoint(ctx, shiftedPoint, distance / 15, 'white');
};

/**
 * Draw the head of the wireframe based on the position of the nose keypoint and the distance between the eye keypoints. If any of these
 * are not able to be identified based on the minimum confidence level, the head cannot be drawn.
 *
 * @param ctx - The drawing context. Should point to a valid 2D canvas context.
 * @param nosePoint - The nose keypoint represented in (x, y) form to build the head from.
 * @param distance - The distance between the eye keypoints.
 */
const drawHead = (ctx: CanvasRenderingContext2D, nosePoint: Point, distance: number): void => {
  ctx.beginPath();
  ctx.arc(nosePoint.x, nosePoint.y, distance / 1.5, 0, 2 * Math.PI);
  ctx.lineWidth = distance / 10;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(nosePoint.x, nosePoint.y + distance / 6, distance / 3, 0, Math.PI);
  ctx.lineWidth = distance / 15;
  ctx.stroke();
  ctx.lineWidth = 12;
};

/**
 * Draw a filled cirlce to represent a point. The size of the circle is determined by the `radius` parameter. The default color
 * of any point drawn is orange.
 *
 * @param ctx - The drawing context. Should point to a valid 2D canvas context.
 * @param p - The keypoint to draw in (x, y) form.
 * @param radius - The radius of the point to be drawn.
 * @param color - The color of the circle.
 */
const drawPoint = (
  ctx: CanvasRenderingContext2D,
  p: Point,
  radius: number,
  color: string = 'orange'
): void => {
  ctx.beginPath();
  ctx.arc(p.x, p.y, radius, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.fill();
};

/**
 * Draw a line segment between any two points.
 *
 * @param ctx - The drawing context. Should point to a valid 2D canvas context.
 * @param p1 - The first point of the line segment (the starting position).
 * @param p2 - The second point of the line segment (the drawing destination).
 * @param color - The color of the line segment.
 * @param scale - A scale factor to change the drawing if the output image is being scaled.
 * @param lineWidth - The width of the line to be drawn.
 */
const drawSegment = (
  ctx: CanvasRenderingContext2D,
  p1: Point,
  p2: Point,
  color: string,
  scale: number,
  lineWidth: number = 12
): void => {
  ctx.beginPath();
  ctx.moveTo(p1.x * scale, p1.y * scale);
  ctx.lineTo(p2.x * scale, p2.y * scale);
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = color;
  ctx.stroke();
};

/**
 * Draw a hat during the Wireframe view if a person raises their right hand. The hat is black colors, and is placed with respect to
 * the position of their nose. The hat cannot be placed if their nose keypoint cannot be identified above the minimum confidence score.
 *
 * @param ctx - The drawing context. Should point to a valid 2D canvas context.
 * @param nosePoint - The nose keypoint represented in (x, y) form to build the hat from.
 * @param width - The drawing width.
 * @param height - The drawing height.
 */
const drawHat = (
  ctx: CanvasRenderingContext2D,
  nosePoint: Point,
  width: number,
  height: number
): void => {
  let saveColor = ctx.fillStyle;
  ctx.fillStyle = 'black';
  ctx.beginPath();
  ctx.ellipse(nosePoint.x, nosePoint.y - width / 1.5, width / 1.5, height, 0, 0, 2 * Math.PI);
  ctx.fill();
  ctx.fillRect(nosePoint.x - width / 2, nosePoint.y - width / 1.5 - height * 5, width, height * 5);
  ctx.fillStyle = saveColor;
};

/**
 * Draw a bear head during the BearHead view over a person's face. The bear is placed with respect to the position of their nose.
 * The hat cannot be placed if their nose keypoint cannot be identified above the minimum confidence score.
 *
 * @param ctx - The drawing context. Should point to a valid 2D canvas context.
 * @param keypoints - A list of keypoints obtained through PoseNet.
 * @param tobyHead - The image element of Toby's head.
 */
export const drawBearHead = (
  ctx: CanvasRenderingContext2D,
  keypoints: Keypoint[],
  tobyHead: HTMLImageElement
): void => {
  let eye1y = keypoints[1].y;
  let eye1x = keypoints[1].x;
  let eye2y = keypoints[2].y;
  let eye2x = keypoints[2].x;

  let distance = Math.sqrt(Math.pow(eye1x - eye2x, 2) + Math.pow(eye1y - eye2y, 2));

  ctx.drawImage(
    tobyHead,
    keypoints[0].x - distance * 1.25,
    keypoints[0].y - distance * 1.25,
    distance * 5,
    distance * 5
  );
};

/**
 * Draw the keypoints of the skeleton. The keypoints include the head, eyes, a hat if the right arm is raised, and the joints of the skeleton (points).
 * The joints are always colored orange, and are circular. These keypoints are drawn if they pass the minimum confidence score.
 *
 * It is assumed that if two joints are adjacent and drawn from `drawKeypoints` then they will be connected by this function.
 *
 * @param ctx - The drawing context. Should point to a valid 2D canvas context.
 * @param keypoints - A list of keypoints obtained through PoseNet.
 * @param minConfidence - The minimum confidence required to be accepted and drawn.
 * @param scale - A scale factor to change the drawing if the output image is being scaled.
 */
export const drawKeypoints = (
  ctx: CanvasRenderingContext2D,
  keypoints: Keypoint[],
  minConfidence: number,
  scale: number = 1
): void => {
  let showHat = keypoints[10].y < keypoints[1].y;

  let eye1y = keypoints[1].y;
  let eye1x = keypoints[1].x;
  let eye2y = keypoints[2].y;
  let eye2x = keypoints[2].x;

  let distance = Math.sqrt(Math.pow(eye1x - eye2x, 2) + Math.pow(eye1y - eye2y, 2));

  for (let i = 0; i < keypoints.length; i++) {
    const keypoint = keypoints[i];

    if (keypoint.score! < minConfidence || i === 3 || i === 4) {
      continue;
    }

    // Destructures x, y from keypoint into point
    const p: Point = keypoint;
    p.x *= scale;
    p.y *= scale;

    if (i === 0) {
      drawHead(ctx, p, distance * 2);
      if (showHat) {
        drawHat(ctx, p, distance * 2, distance / 4);
      }
    } else if (i === 1 || i === 2) {
      drawEye(ctx, p, distance);
    } else {
      drawPoint(ctx, p, 12);
    }
  }
};

/**
 * Draw the skeleton from the provided keypoints. The skeleton is created through adjacent keypoints (e.g. the left and right shoulder are adjacent,
 * but the left shoulder and right knee are not). Use a list of these adjacent keypoints paired with their confidence scores to draw lines
 * between adjacent points.
 *
 * Default to the color aqua. If a hand is raised to enter ImageMagick mode (left hand), the color of the wires becomes blue. If both hands are raised,
 * the frame is updated with random colors.
 *
 * It is assumed that if two joints are adjacent and drawn from `drawKeypoints` then they will be connected by this function.
 *
 * @param ctx - The drawing context. Should point to a valid 2D canvas context.
 * @param keypoints - A list of keypoints obtained through PoseNet.
 * @param minConfidence - The minimum confidence required to be accepted and drawn.
 * @param scale - A scale factor to change the drawing if the output image is being scaled.
 */
export const drawSkeleton = (
  ctx: CanvasRenderingContext2D,
  keypoints: Keypoint[],
  minConfidence: number,
  scale: number = 1
): void => {
  const adjacentKeyPoints = getAdjacentKeyPoints(keypoints, minConfidence);
  let color: string;

  // Both hands raised
  if (keypoints[10].y < keypoints[6].y) {
    color = getRandomColor();
  }

  // Left hand raised
  else if (keypoints[9].y < keypoints[5].y) {
    color = 'blue';
  }

  // Either right hand alone raised or no hands raised
  else {
    color = 'aqua';
  }

  adjacentKeyPoints.forEach((keypoints) => {
    drawSegment(ctx, keypoints[0], keypoints[1], color, scale);
  });
};
