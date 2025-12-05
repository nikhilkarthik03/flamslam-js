/**
 * @file types.ts
 * @brief Type definitions for core data structures
 */

import { DataType, Channels } from './constants';

/**
 * @interface data_t
 * @brief Low-level typed memory buffer structure
 */
export interface data_t {
  size: number;
  buffer: ArrayBuffer;
  u8: Uint8Array;
  i32: Int32Array;
  f32: Float32Array;
  f64: Float64Array;
}

/**
 * @interface matrix_t
 * @brief Matrix structure and operations
 */
export interface matrix_t {
  cols: number;
  rows: number;
  type: DataType;
  channels: Channels;
  buffer: data_t;
  data: Uint8Array | Int32Array | Float32Array | Float64Array;

  allocate(): void;
  copyTo(other: matrix_t): void;
  resize(cols: number, rows: number, channels?: Channels): void;
}

/**
 * @interface pyramid_t
 * @brief Multi-level image pyramid structure
 */
export interface pyramid_t {
  levels: number;
  layers: matrix_t[];

  allocate(startW: number, startH: number, type: number): void;
  build(
    input: matrix_t,
    pyrdown: (src: matrix_t, dst: matrix_t) => void,
    skipFirst?: boolean,
  ): void;
}

/**
 * @interface keypoint_t
 * @brief Detected feature point representation
 */
export interface keypoint_t {
  x: number;
  y: number;
  score: number;
  level: number;
  angle: number;
}

/**
 * @interface pool_node
 * @brief Node in a memory pool linked list
 */
export interface pool_node {
  next: pool_node | null;
  data: data_t;
  size: number;
  resize(sizeInBytes: number): void;
}
