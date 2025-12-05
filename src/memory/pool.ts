/**
 * @file memory/pool.ts
 * @brief Memory pool node with resizable buffer
 */

import { pool_node } from '../types';
import { Data } from '../core/data';

/**
 * @class PoolNode
 * @implements pool_node
 * @brief Node in a linked-list memory pool
 *
 * Wraps a Data buffer and maintains a reference to the next node.
 * Used by Cache to implement a free-list allocator for temporary
 * buffers in image processing algorithms.
 */
export class PoolNode implements pool_node {
  next: PoolNode | null = null;
  data: Data;
  size: number;

  /**
   * @param sizeInBytes Size for internal Data buffer
   */
  constructor(sizeInBytes: number) {
    this.data = new Data(sizeInBytes);
    this.size = this.data.size;
  }

  /**
   * @brief Resize this node's internal memory buffer
   */
  resize(sizeInBytes: number): void {
    this.data = new Data(sizeInBytes);
    this.size = this.data.size;
  }
}
