/**
 * @file image/processing.ts
 * @brief High-accuracy image processing operations
 */

import { Matrix } from '../core/matrix';
import { ColorConversion, Channels } from '../constants';

/**
 * @class ImageProcessing
 * @brief OpenCV-style image processing with float precision
 *
 * Provides grayscale conversion using accurate floating-point luminance
 * calculations (Y = 0.299*R + 0.587*G + 0.114*B) with SIMD-style
 * unrolled loops for performance.
 */
export class ImageProcessing {
  /**
   * @brief Convert RGB/BGR/RGBA/BGRA image to grayscale
   *
   * Uses OpenCV luminance formula with float precision:
   *   Y = 0.299 * R + 0.587 * G + 0.114 * B
   *
   * @param src Raw pixel buffer (Uint8Array from canvas/video)
   * @param w Image width
   * @param h Image height
   * @param dst Output grayscale matrix (U8C1), auto-resized
   * @param code ColorConversion enum for input format
   */
  public grayscale(
    src: Uint8Array,
    w: number,
    h: number,
    dst: Matrix,
    code: ColorConversion = ColorConversion.RGBA2GRAY,
  ): void {
    // Determine channel layout
    let cn = 4; // channels per pixel
    let idxR = 0,
      idxG = 1,
      idxB = 2;

    // BGR/BGRA swap R and B indices
    if (
      code === ColorConversion.BGRA2GRAY ||
      code === ColorConversion.BGR2GRAY
    ) {
      idxR = 2;
      idxG = 1;
      idxB = 0;
    }

    // 3-channel images (RGB/BGR)
    if (
      code === ColorConversion.RGB2GRAY ||
      code === ColorConversion.BGR2GRAY
    ) {
      cn = 3;
    }

    // Resize output to grayscale U8C1
    dst.resize(w, h, Channels.C1);
    const dst_u8 = dst.data as Uint8Array;

    // OpenCV-accurate floating-point luminance weights
    const WR = 0.299;
    const WG = 0.587;
    const WB = 0.114;

    let i = 0; // src index
    let j = 0; // dst index

    const step = cn; // stride per pixel in src
    const stride4 = cn * 4; // for unrolled loop (4 pixels)

    // Process each row
    for (let y = 0; y < h; y++) {
      let rowStartSrc = y * w * cn;
      let rowStartDst = y * w;

      i = rowStartSrc;
      j = rowStartDst;

      const limit = rowStartDst + (w - 4);

      // Unrolled loop: process 4 pixels per iteration
      while (j <= limit) {
        // Pixel 0
        const g0 = WR * src[i + idxR] + WG * src[i + idxG] + WB * src[i + idxB];

        // Pixel 1
        const g1 =
          WR * src[i + step + idxR] +
          WG * src[i + step + idxG] +
          WB * src[i + step + idxB];

        // Pixel 2
        const g2 =
          WR * src[i + step * 2 + idxR] +
          WG * src[i + step * 2 + idxG] +
          WB * src[i + step * 2 + idxB];

        // Pixel 3
        const g3 =
          WR * src[i + step * 3 + idxR] +
          WG * src[i + step * 3 + idxG] +
          WB * src[i + step * 3 + idxB];

        // Convert to int and store
        dst_u8[j] = g0 | 0;
        dst_u8[j + 1] = g1 | 0;
        dst_u8[j + 2] = g2 | 0;
        dst_u8[j + 3] = g3 | 0;

        i += stride4;
        j += 4;
      }

      // Process remaining pixels (< 4)
      while (j < rowStartDst + w) {
        dst_u8[j++] =
          (WR * src[i + idxR] + WG * src[i + idxG] + WB * src[i + idxB]) | 0;

        i += step;
      }
    }
  }
}
