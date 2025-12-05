/**
 * @file core/data.ts
 * @brief Aligned memory buffer with typed array views
 */

import { data_t } from '../types';

/**
 * @class Data
 * @implements data_t
 * @brief 8-byte aligned memory buffer with multiple typed views
 *
 * Holds a single ArrayBuffer with pre-constructed typed array views
 * (u8, i32, f32, f64) for efficient memory access across different
 * numeric types without reallocation.
 */
export class Data implements data_t {
  size: number;
  buffer: ArrayBuffer;
  u8: Uint8Array;
  i32: Int32Array;
  f32: Float32Array;
  f64: Float64Array;

  /**
   * @param sizeInBytes Size requested (aligned to 8 bytes)
   * @param existing Optional external ArrayBuffer to wrap
   */
  constructor(sizeInBytes: number, existing?: ArrayBuffer) {
    this.size = (sizeInBytes + 7) & -8; // Align to 8 bytes
    this.buffer = existing ?? new ArrayBuffer(this.size);

    // Create typed views
    this.u8 = new Uint8Array(this.buffer);
    this.i32 = new Int32Array(this.buffer);
    this.f32 = new Float32Array(this.buffer);
    this.f64 = new Float64Array(this.buffer);
  }
}
