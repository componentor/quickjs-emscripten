/**
 * Thrown when a task times out.
 */
export class WorkerTaskTimeoutError extends Error {
  readonly name = "WorkerTaskTimeoutError"
  readonly isTimeout = true

  constructor(
    public readonly taskId: string,
    public readonly timeoutMs: number,
  ) {
    super(`Task ${taskId} timed out after ${timeoutMs}ms`)
  }
}

/**
 * Thrown when a task is cancelled.
 */
export class WorkerTaskCancelledError extends Error {
  readonly name = "WorkerTaskCancelledError"
  readonly isCancelled = true

  constructor(public readonly taskId: string) {
    super(`Task ${taskId} was cancelled`)
  }
}

/**
 * Thrown when a worker crashes unexpectedly.
 */
export class WorkerCrashError extends Error {
  readonly name = "WorkerCrashError"
  readonly isWorkerCrash = true

  constructor(
    public readonly taskId: string,
    public readonly originalError?: Error,
  ) {
    super(`Worker crashed while executing task ${taskId}`)
  }
}

/**
 * Thrown when the pool is disposed while tasks are pending.
 */
export class PoolDisposedError extends Error {
  readonly name = "PoolDisposedError"

  constructor() {
    super("Worker pool has been disposed")
  }
}

/**
 * Thrown when the task queue is full and cannot accept more tasks.
 */
export class QueueFullError extends Error {
  readonly name = "QueueFullError"

  constructor(public readonly maxSize: number) {
    super(`Task queue is full (max: ${maxSize})`)
  }
}

/**
 * Thrown when multi-threading is required but not available.
 */
export class MultiThreadingNotSupportedError extends Error {
  readonly name = "MultiThreadingNotSupportedError"

  constructor() {
    super(
      "Multi-threading is required but SharedArrayBuffer is not available. " +
        "Ensure your server sends the required COOP/COEP headers: " +
        "Cross-Origin-Opener-Policy: same-origin and " +
        "Cross-Origin-Embedder-Policy: require-corp",
    )
  }
}
