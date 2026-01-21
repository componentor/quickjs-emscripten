import type { QueuedTask } from "./types"

/**
 * Priority queue for pending tasks.
 * Tasks with higher priority values are executed first.
 * Tasks with equal priority are executed in FIFO order.
 */
export class TaskQueue {
  private queue: QueuedTask[] = []

  constructor(private readonly maxSize: number = 0) {}

  /**
   * Add a task to the queue.
   * @throws Error if the queue is full (maxSize > 0 and queue.length >= maxSize)
   */
  enqueue(task: QueuedTask): void {
    if (this.maxSize > 0 && this.queue.length >= this.maxSize) {
      throw new Error(`Queue is full (max: ${this.maxSize})`)
    }

    // Insert in priority order (higher priority first)
    // For equal priority, maintain FIFO order
    const priority = task.task.priority ?? 0
    let insertIndex = this.queue.length

    for (let i = 0; i < this.queue.length; i++) {
      const existingPriority = this.queue[i].task.priority ?? 0
      if (priority > existingPriority) {
        insertIndex = i
        break
      }
    }

    this.queue.splice(insertIndex, 0, task)
  }

  /**
   * Remove and return the highest priority task.
   * Skips cancelled tasks.
   * @returns The next task, or undefined if the queue is empty
   */
  dequeue(): QueuedTask | undefined {
    while (this.queue.length > 0) {
      const task = this.queue.shift()
      if (task && !task.cancelled) {
        return task
      }
    }
    return undefined
  }

  /**
   * Cancel a task by its ID.
   * @returns true if the task was found and cancelled
   */
  cancel(taskId: string): boolean {
    const task = this.queue.find((t) => t.task.taskId === taskId)
    if (task) {
      task.cancelled = true
      return true
    }
    return false
  }

  /**
   * Get all pending (non-cancelled) tasks.
   */
  getPending(): QueuedTask[] {
    return this.queue.filter((t) => !t.cancelled)
  }

  /**
   * Remove all cancelled tasks from the queue.
   */
  compact(): void {
    this.queue = this.queue.filter((t) => !t.cancelled)
  }

  /**
   * Clear all tasks from the queue.
   * @returns The removed tasks
   */
  clear(): QueuedTask[] {
    const tasks = this.queue
    this.queue = []
    return tasks
  }

  get length(): number {
    return this.queue.filter((t) => !t.cancelled).length
  }

  get isFull(): boolean {
    return this.maxSize > 0 && this.queue.length >= this.maxSize
  }

  get isEmpty(): boolean {
    return this.length === 0
  }
}
