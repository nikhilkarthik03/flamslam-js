/**
 * @file core/keypoint.ts
 * @brief Feature point representation
 */

import { keypoint_t } from '../types';

/**
 * @class Keypoint
 * @implements keypoint_t
 * @brief Detected feature point with location, score, and orientation
 *
 * Contains integer pixel coordinates, detection score (FAST, Harris, etc.),
 * pyramid level, and orientation angle. Used throughout feature detection
 * and tracking algorithms.
 */
export class Keypoint implements keypoint_t {
  x: number;
  y: number;
  score: number;
  level: number;
  angle: number;

  /**
   * @param x Image x-coordinate
   * @param y Image y-coordinate
   * @param score Detection strength score
   * @param level Pyramid level where detected
   * @param angle Orientation in radians (-1 if undefined)
   */
  constructor(x = 0, y = 0, score = 0, level = 0, angle = -1) {
    this.x = x;
    this.y = y;
    this.score = score;
    this.level = level;
    this.angle = angle;
  }
}
