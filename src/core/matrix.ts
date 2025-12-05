/**
 * @file core/matrix.ts
 * @brief General-purpose multi-channel numeric matrix
 */

import { matrix_t } from '../types';
import {
  DataType,
  Channels,
  getDataType,
  getChannel,
  getDataTypeSize,
} from '../constants';
import { Data } from './data';

/**
 * @class Matrix
 * @implements matrix_t
 * @brief 2D array with 1-4 channels for images, gradients, and buffers
 *
 * Memory is stored in a Data instance with typed array views.
 * Supports U8, S32, F32, S64, F64 data types with automatic
 * view selection and efficient resize operations.
 */
export class Matrix implements matrix_t {
  cols: number;
  rows: number;
  type: DataType;
  channels: Channels;
  buffer!: Data;
  data!: Uint8Array | Int32Array | Float32Array | Float64Array;

  /**
   * @param cols Matrix width
   * @param rows Matrix height
   * @param type Combined DataType + Channels bitmask
   * @param existingBuffer Optional external Data buffer
   */
  constructor(cols: number, rows: number, type: number, existingBuffer?: Data) {
    this.cols = cols | 0;
    this.rows = rows | 0;
    this.type = getDataType(type);
    this.channels = getChannel(type);

    if (existingBuffer) {
      this.buffer = existingBuffer;
      this.data = this.selectTypedView();
    } else {
      this.allocate();
    }
  }

  /**
   * @brief Allocate or reallocate storage
   */
  allocate(): void {
    const elements = this.cols * this.rows * this.channels;
    const bytes = elements * getDataTypeSize(this.type);

    this.buffer = new Data(bytes);
    this.data = this.selectTypedView();
  }

  /**
   * @brief Copy matrix contents to another matrix
   */
  copyTo(other: Matrix): void {
    const src = this.data;
    const dst = other.data;
    const n = this.cols * this.rows * this.channels;

    for (let i = 0; i < n; i++) {
      dst[i] = src[i];
    }
  }

  /**
   * @brief Resize matrix; reallocate only if needed
   */
  resize(cols: number, rows: number, ch: Channels = this.channels): void {
    const newSize = cols * rows * ch * getDataTypeSize(this.type);

    this.cols = cols;
    this.rows = rows;
    this.channels = ch;

    if (newSize > this.buffer.size) {
      this.allocate();
    }
  }

  /**
   * @brief Select appropriate typed array view based on data type
   */
  private selectTypedView():
    | Uint8Array
    | Int32Array
    | Float32Array
    | Float64Array {
    switch (this.type) {
      case DataType.U8:
        return this.buffer.u8;
      case DataType.S32:
        return this.buffer.i32;
      case DataType.F32:
        return this.buffer.f32;
      case DataType.S64:
      case DataType.F64:
        return this.buffer.f64;
    }
  }
}
