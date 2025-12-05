/**
 * @file index.ts
 * @brief Main entry point for flamslam-js library
 */

// Core data structures
export { Data, Matrix, Pyramid, Keypoint } from './core';

// Memory management
export { PoolNode, Cache } from './memory';

// Image processing
export { ImageProcessing } from './image';

// Constants and enums
export {
  EPSILON,
  FLT_MIN,
  DataType,
  Channels,
  ColorConversion,
  BOX_BLUR_NOSCALE,
  SVD_U_T,
  SVD_V_T,
  getDataType,
  getChannel,
  getDataTypeSize,
} from './constants';

// Type definitions
export type {
  data_t,
  matrix_t,
  pyramid_t,
  keypoint_t,
  pool_node,
} from './types';
