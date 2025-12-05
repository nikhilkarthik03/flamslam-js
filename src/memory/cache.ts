/**
 * @file memory/cache.ts
 * @brief Free-list memory pool for temporary buffers
 */

import { PoolNode } from './pool';

/**
 * @class Cache
 * @brief Free-list allocator for reusable Data buffers
 *
 * Maintains a linked list of pre-allocated buffers to avoid repeated
 * allocations during intensive image processing operations. Implements
 * get/put semantics for borrowing and returning buffers.
 */
export class Cache {
  private head: PoolNode | null = null;
  private tail: PoolNode | null = null;

  /**
   * @brief Pre-allocate a chain of memory buffers
   * @param capacity Number of buffers to allocate
   * @param sizeInBytes Size of each buffer
   */
  allocate(capacity: number, sizeInBytes: number): void {
    let node = new PoolNode(sizeInBytes);
    this.head = this.tail = node;

    for (let i = 0; i < capacity; i++) {
      const next = new PoolNode(sizeInBytes);
      this.tail!.next = next;
      this.tail = next;
    }
  }

  /**
   * @brief Borrow a buffer from the pool
   * @returns A PoolNode with a usable Data buffer
   * @throws Error if pool is exhausted
   */
  get_buffer(sizeInBytes: number): PoolNode {
    if (!this.head) {
      throw new Error('Cache exhausted — consider increasing capacity');
    }

    const node = this.head;
    this.head = this.head.next;

    // Auto-resize if requested size exceeds node capacity
    if (sizeInBytes > node.size) {
      node.resize(sizeInBytes);
    }

    return node;
  }

  /**
   * @brief Return a buffer to the pool
   */
  put_buffer(node: PoolNode): void {
    this.tail!.next = node;
    this.tail = node;
    node.next = null;
  }
}
