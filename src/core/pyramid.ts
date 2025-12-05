/**
 * @file core/pyramid.ts
 * @brief Gaussian image pyramid for multi-scale processing
 */

import { pyramid_t } from '../types';
import { Matrix } from './matrix';

/**
 * @class Pyramid
 * @implements pyramid_t
 * @brief Multi-scale image pyramid with progressive downsampling
 *
 * Contains multiple Matrix levels, each downsampled by 2x from the
 * previous level. Used in optical flow, feature detection, and
 * scale-space algorithms.
 */
export class Pyramid implements pyramid_t {
  levels: number;
  layers: Matrix[];

  /**
   * @param levels Number of pyramid levels
   */
  constructor(levels: number) {
    this.levels = levels | 0;
    this.layers = new Array(levels);
  }

  /**
   * @brief Allocate all pyramid levels from base dimensions
   */
  allocate(startW: number, startH: number, type: number): void {
    for (let i = 0; i < this.levels; i++) {
      this.layers[i] = new Matrix(startW >> i, startH >> i, type);
    }
  }

  /**
   * @brief Build pyramid using provided downsampling function
   *
   * @param input Base level input matrix
   * @param pyrdown Function performing downsampling between levels
   * @param skipFirst If false, level 0 is overwritten with input
   */
  build(
    input: Matrix,
    pyrdown: (src: Matrix, dst: Matrix) => void,
    skipFirst = true,
  ): void {
    if (!skipFirst) {
      input.copyTo(this.layers[0]);
    }

    let a = input;
    let b = this.layers[1];

    pyrdown(a, b);

    for (let i = 2; i < this.levels; i++) {
      a = b;
      b = this.layers[i];
      pyrdown(a, b);
    }
  }
}
