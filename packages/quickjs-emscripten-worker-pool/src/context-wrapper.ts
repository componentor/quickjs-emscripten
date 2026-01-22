import type { Disposable, ContextEvalOptions } from "@componentor/quickjs-emscripten-core"
import type { QuickJSWorkerPool } from "./pool"
import type { WorkerTaskError } from "./types"

/**
 * Result type that mirrors QuickJSContextResult from the main runtime.
 * Provides a familiar API for clients using the worker pool.
 */
export type WorkerPoolContextResult<T = unknown> =
  | { value: T; error?: undefined }
  | { error: WorkerTaskError; value?: undefined }

/**
 * Options for evalCodeAsync, mirroring the main runtime API.
 */
export interface WorkerPoolEvalOptions extends ContextEvalOptions {
  /** Timeout in milliseconds */
  timeout?: number
  /** Filename for error messages */
  filename?: string
}

/**
 * A context-like wrapper around QuickJSWorkerPool that provides an API
 * similar to QuickJSAsyncContext for seamless integration.
 *
 * This allows clients to use a familiar interface while automatically
 * benefiting from parallel worker execution when available.
 *
 * Key differences from QuickJSAsyncContext:
 * - No handle-based operations (newFunction, newObject, etc.)
 * - Values are automatically serialized/deserialized across worker boundaries
 * - Multiple concurrent evalCodeAsync calls are distributed across workers
 * - State is isolated per-worker (use sessions for persistent state)
 *
 * @example
 * ```typescript
 * // Create a pool-backed context
 * const pool = await newWorkerPool({ poolSize: 4 })
 * const context = new WorkerPoolContext(pool)
 *
 * // Use like QuickJSAsyncContext
 * const result = await context.evalCodeAsync('1 + 1')
 * if (result.value !== undefined) {
 *   console.log('Result:', result.value) // 2
 * }
 *
 * // Parallel execution - multiple calls are distributed across workers
 * const results = await Promise.all([
 *   context.evalCodeAsync('Math.sqrt(16)'),
 *   context.evalCodeAsync('Math.pow(2, 10)'),
 *   context.evalCodeAsync('[1,2,3].map(x => x * 2)'),
 * ])
 *
 * context.dispose()
 * ```
 */
export class WorkerPoolContext implements Disposable {
  private _pool: QuickJSWorkerPool
  private _alive = true

  /**
   * Create a new WorkerPoolContext wrapping the given pool.
   *
   * @param pool The worker pool to use for code execution
   */
  constructor(pool: QuickJSWorkerPool) {
    this._pool = pool
  }

  /**
   * Whether the context is still alive (not disposed).
   */
  get alive(): boolean {
    return this._alive && this._pool.alive
  }

  /**
   * Whether the underlying pool is using multi-threading.
   */
  get isMultiThreaded(): boolean {
    return this._pool.isMultiThreaded
  }

  /**
   * Evaluate JavaScript code asynchronously.
   *
   * This method mirrors QuickJSAsyncContext.evalCodeAsync() but routes
   * execution to a worker pool for parallel processing.
   *
   * @param code JavaScript code to evaluate
   * @param filenameOrOptions Filename string or evaluation options
   * @returns Promise resolving to the evaluation result
   *
   * @example
   * ```typescript
   * // Simple usage
   * const result = await context.evalCodeAsync('1 + 1')
   *
   * // With filename
   * const result = await context.evalCodeAsync('throw new Error("oops")', 'test.js')
   *
   * // With options
   * const result = await context.evalCodeAsync('while(true){}', {
   *   filename: 'infinite.js',
   *   timeout: 1000,
   * })
   * ```
   */
  async evalCodeAsync(
    code: string,
    filenameOrOptions?: string | WorkerPoolEvalOptions,
  ): Promise<WorkerPoolContextResult> {
    if (!this._alive) {
      return {
        error: {
          name: "DisposedError",
          message: "Context has been disposed",
        },
      }
    }

    // Parse options
    let filename: string | undefined
    let timeout: number | undefined

    if (typeof filenameOrOptions === "string") {
      filename = filenameOrOptions
    } else if (filenameOrOptions) {
      filename = filenameOrOptions.filename
      timeout = filenameOrOptions.timeout
    }

    // Route to pool
    const result = await this._pool.evalCode(code, {
      filename,
      timeout,
    })

    return result
  }

  /**
   * Evaluate multiple code snippets in parallel.
   *
   * This takes advantage of the worker pool to execute all tasks
   * concurrently across available workers.
   *
   * @param tasks Array of code snippets or task objects
   * @returns Promise resolving to array of results in the same order
   *
   * @example
   * ```typescript
   * const results = await context.evalCodeBatch([
   *   '1 + 1',
   *   '2 * 2',
   *   'Math.sqrt(16)',
   * ])
   * console.log(results.map(r => r.value)) // [2, 4, 4]
   *
   * // With options
   * const results = await context.evalCodeBatch([
   *   { code: 'compute()', timeout: 5000 },
   *   { code: 'process()', timeout: 10000 },
   * ])
   * ```
   */
  async evalCodeBatch(
    tasks: (string | { code: string; filename?: string; timeout?: number })[],
  ): Promise<WorkerPoolContextResult[]> {
    if (!this._alive) {
      return tasks.map(() => ({
        error: {
          name: "DisposedError",
          message: "Context has been disposed",
        },
      }))
    }

    const normalizedTasks = tasks.map((task) => (typeof task === "string" ? { code: task } : task))

    return this._pool.evalCodeBatch(normalizedTasks)
  }

  /**
   * Unwrap a result, throwing if it's an error.
   *
   * This is a convenience method that mirrors QuickJSContext.unwrapResult().
   *
   * @param result The result to unwrap
   * @returns The value if successful
   * @throws Error if the result contains an error
   */
  unwrapResult<T>(result: WorkerPoolContextResult<T>): T {
    if (result.error) {
      const error = new Error(result.error.message)
      error.name = result.error.name
      if (result.error.stack) {
        error.stack = result.error.stack
      }
      throw error
    }
    return result.value
  }

  /**
   * Dispose of the context.
   *
   * Note: This does NOT dispose the underlying pool. The pool should be
   * disposed separately when no longer needed.
   */
  dispose(): void {
    this._alive = false
  }

  [Symbol.dispose](): void {
    this.dispose()
  }
}

/**
 * Create a context-like wrapper around a worker pool.
 *
 * This provides an API similar to QuickJSAsyncContext while routing
 * code execution to workers for parallel processing.
 *
 * @param pool The worker pool to wrap
 * @returns A context-like interface to the pool
 */
export function newWorkerPoolContext(pool: QuickJSWorkerPool): WorkerPoolContext {
  return new WorkerPoolContext(pool)
}
