import { Keypoint } from "@tensorflow-models/pose-detection";
import { Point } from "../interfaces/ComponentProps";
import { getAdjacentKeyPoints } from "./keypoints";

/**
 * Generate a random color and return its hex string.
 *
 * Credit to https://stackoverflow.com/questions/1484506/random-color-generator
 *
 * @returns A random hex string for a color
 */
const getRandomColor = (): string => {
  let letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

const drawEye = (ctx: CanvasRenderingContext2D, p: Point, distance: number) => {
  drawPoint(ctx, p, distance / 3, "white");
  drawPoint(ctx, p, distance / 4, "blue");
  drawPoint(ctx, p, distance / 5, "black");

  let shiftedPoint = p;
  shiftedPoint.x -= distance / 20;
  shiftedPoint.y -= distance / 20;

  drawPoint(ctx, shiftedPoint, distance / 15, "white");
};

const drawHead = (
  ctx: CanvasRenderingContext2D,
  p: Point,
  distance: number
) => {
  ctx.beginPath();
  ctx.arc(p.x, p.y, distance / 1.5, 0, 2 * Math.PI);
  ctx.lineWidth = distance / 10;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(p.x, p.y + distance / 6, distance / 3, 0, Math.PI);
  ctx.lineWidth = distance / 15;
  ctx.stroke();
  ctx.lineWidth = 12;
};

const drawPoint = (
  ctx: CanvasRenderingContext2D,
  p: Point,
  radius: number,
  color: string
) => {
  ctx.beginPath();
  ctx.arc(p.x, p.y, radius, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.fill();
};

const drawSegment = (
  ctx: CanvasRenderingContext2D,
  p1: Point,
  p2: Point,
  color: string,
  scale: number,
  lineWidth: number = 12
) => {
  ctx.beginPath();
  ctx.moveTo(p1.x * scale, p1.y * scale);
  ctx.lineTo(p2.x * scale, p2.y * scale);
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = color;
  ctx.stroke();
};

const drawHat = (
  ctx: CanvasRenderingContext2D,
  p: Point,
  width: number,
  height: number
) => {
  let saveColor = ctx.fillStyle;
  ctx.fillStyle = "black";
  ctx.beginPath();
  ctx.ellipse(p.x, p.y - width / 1.5, width / 1.5, height, 0, 0, 2 * Math.PI);
  ctx.fill();
  ctx.fillRect(
    p.x - width / 2,
    p.y - width / 1.5 - height * 5,
    width,
    height * 5
  );
  ctx.fillStyle = saveColor;
};

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

  let distance = Math.sqrt(
    Math.pow(eye1x - eye2x, 2) + Math.pow(eye1y - eye2y, 2)
  );

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
      drawPoint(ctx, p, 12, "orange");
    }
  }
};

export const drawSkeleton = (
  ctx: CanvasRenderingContext2D,
  keypoints: Keypoint[],
  minConfidence: number,
  scale: number = 1
): void => {
  const adjacentKeyPoints = getAdjacentKeyPoints(keypoints, minConfidence);
  let color: string = "aqua"; // default color

  if (keypoints[9].y < keypoints[5].y) {
    color = "blue";

    if (keypoints[10].y < keypoints[6].y) {
      color = getRandomColor();
    }
  }

  adjacentKeyPoints.forEach((keypoints) => {
    drawSegment(ctx, keypoints[0], keypoints[1], color, scale);
  });
};
