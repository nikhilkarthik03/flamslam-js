/**
 * @file constants.ts
 * @brief Constants, enums, and utility functions for type handling
 */

/**
 * @brief Smallest representable epsilon for numerical operations
 */
export const EPSILON = 0.0000001192092896;

/**
 * @brief Very small floating point number to avoid division by zero
 */
export const FLT_MIN = 1e-37;

/**
 * @enum DataType
 * @brief Bitmask identifiers for matrix storage types
 */
export enum DataType {
  U8 = 0x0100,
  S32 = 0x0200,
  F32 = 0x0400,
  S64 = 0x0800,
  F64 = 0x1000,
}

/**
 * @enum Channels
 * @brief Number of channels per pixel/element
 */
export enum Channels {
  C1 = 0x01,
  C2 = 0x02,
  C3 = 0x03,
  C4 = 0x04,
}

/**
 * @enum ColorConversion
 * @brief Grayscale conversion operation identifiers
 */
export enum ColorConversion {
  RGBA2GRAY = 0,
  RGB2GRAY = 1,
  BGRA2GRAY = 2,
  BGR2GRAY = 3,
}

/**
 * @brief Box blur mode flags
 */
export const BOX_BLUR_NOSCALE = 0x01;

/**
 * @brief SVD options for U and V transposition
 */
export const SVD_U_T = 0x01;
export const SVD_V_T = 0x02;

/**
 * @brief Lookup table for element size in bytes
 */
const DATA_TYPE_SIZE = {
  [DataType.U8]: 1,
  [DataType.S32]: 4,
  [DataType.F32]: 4,
  [DataType.S64]: 8,
  [DataType.F64]: 8,
} as const;

/**
 * @brief Extract raw data type from combined flags
 */
export function getDataType(value: number): DataType {
  return (value & 0xff00) as DataType;
}

/**
 * @brief Extract channel count from combined flags
 */
export function getChannel(value: number): Channels {
  return (value & 0xff) as Channels;
}

/**
 * @brief Get size of one element in bytes for a DataType
 */
export function getDataTypeSize(type: DataType): number {
  return DATA_TYPE_SIZE[type];
}
