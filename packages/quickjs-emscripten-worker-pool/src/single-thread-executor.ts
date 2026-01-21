import {
  newQuickJSWASMModuleFromVariant,
  type QuickJSWASMModule,
  type QuickJSContext,
  type ContextOptions,
  type QuickJSSyncVariant,
} from "@componentor/quickjs-emscripten-core"
import type { TaskExecutor, InternalTask, WorkerTaskResult } from "./types"
import type { Logger } from "./logger"

/**
 * Single-threaded executor that runs tasks sequentially on the main thread.
 * Used as a fallback when SharedArrayBuffer is not available.
 *
 * Uses sync variant with executePendingJobs() loops for async operations,
 * matching how the worker-entry.ts handles promises and async work.
 */
export class SingleThreadExecutor implements TaskExecutor {
  private module: QuickJSWASMModule | null = null
  private context: QuickJSContext | null = null
  private busy = false
  private _alive = true

  private constructor(
    private readonly contextOptions: ContextOptions,
    private readonly bootstrapCode: string | undefined,
    private readonly logger: Logger,
  ) {}

  /**
   * Create a new SingleThreadExecutor.
   * Initializes the QuickJS sync module and context.
   */
  static async create(
    contextOptions: ContextOptions = {},
    bootstrapCode?: string,
    logger?: Logger,
  ): Promise<SingleThreadExecutor> {
    const noopLogger = { log: () => {}, warn: () => {}, error: () => {} }
    const executor = new SingleThreadExecutor(contextOptions, bootstrapCode, logger ?? noopLogger)
    await executor.initialize()
    return executor
  }

  private async initialize(): Promise<void> {
    this.logger.log("Loading QuickJS sync WASM module (single-threaded mode)...")
    // Dynamically import the sync variant
    const variantModule = await import("@componentor/quickjs-singlefile-cjs-release-sync")
    // Handle both ESM default export and CJS module.exports patterns
    const variant = (variantModule.default ?? variantModule) as unknown as QuickJSSyncVariant
    this.module = await newQuickJSWASMModuleFromVariant(variant)
    this.context = this.module.newContext(this.contextOptions)
    this.logger.log("QuickJS sync context initialized")

    // Run bootstrap code if provided
    if (this.bootstrapCode && this.context) {
      this.logger.log("Running bootstrap code...")
      const result = this.context.evalCode(this.bootstrapCode, "<bootstrap>")
      if (result.error) {
        const errorValue = this.context.dump(result.error)
        result.error.dispose()
        throw new Error(
          `Bootstrap code failed: ${typeof errorValue === "object" && errorValue && "message" in errorValue ? (errorValue as { message: string }).message : String(errorValue)}`,
        )
      }
      result.value.dispose()
      // Execute any pending jobs from bootstrap
      this.executePendingJobsLoop(100)
      this.logger.log("Bootstrap code completed")
    }
  }

  /**
   * Execute pending jobs (promises, microtasks) in a loop.
   * This handles async operations with sync QuickJS variants.
   */
  private executePendingJobsLoop(maxIterations: number = 1000): boolean {
    if (!this.context) return false

    let hadJobs = false
    let iterations = 0
    let noJobIterations = 0
    const maxNoJobIterations = 10

    while (iterations < maxIterations && noJobIterations < maxNoJobIterations) {
      const result = this.context.runtime.executePendingJobs()

      if (result.error) {
        const errorValue = this.context.dump(result.error)
        result.error.dispose()
        this.logger.error("Error in pending job:", errorValue)
        hadJobs = true
        noJobIterations = 0
      } else if (result.value > 0) {
        hadJobs = true
        noJobIterations = 0
      } else {
        noJobIterations++
      }

      iterations++
    }

    return hadJobs
  }

  get alive(): boolean {
    return this._alive
  }

  get isMultiThreaded(): boolean {
    return false
  }

  get busyCount(): number {
    return this.busy ? 1 : 0
  }

  get availableCount(): number {
    return this.busy ? 0 : 1
  }

  get maxConcurrency(): number {
    return 1
  }

  async execute(task: InternalTask): Promise<WorkerTaskResult> {
    if (!this._alive) {
      return {
        error: {
          name: "PoolDisposedError",
          message: "Executor has been disposed",
        },
      }
    }

    if (!this.context) {
      return {
        error: {
          name: "Error",
          message: "Executor not initialized",
        },
      }
    }

    this.busy = true

    try {
      // Set up timeout via interrupt handler
      let timedOut = false
      if (task.timeout && task.timeout > 0) {
        const deadline = Date.now() + task.timeout
        this.context.runtime.setInterruptHandler(() => {
          if (Date.now() > deadline) {
            timedOut = true
            return true // Interrupt execution
          }
          return false
        })
      }

      try {
        // Use evalCode with executePendingJobs() loop for async operations
        const result = this.context.evalCode(task.code, task.filename ?? "eval.js")

        if (result.error) {
          const errorValue = this.context.dump(result.error)
          result.error.dispose()

          if (timedOut) {
            return {
              error: {
                name: "TimeoutError",
                message: `Task timed out after ${task.timeout}ms`,
                isTimeout: true,
              },
            }
          }

          // Handle the error value
          if (errorValue && typeof errorValue === "object" && "message" in errorValue) {
            return {
              error: {
                name: (errorValue as { name?: string }).name ?? "Error",
                message: String((errorValue as { message?: unknown }).message),
                stack: (errorValue as { stack?: string }).stack,
              },
            }
          }

          return {
            error: {
              name: "Error",
              message: String(errorValue),
            },
          }
        }

        // Execute pending jobs (promises, async work) in a loop
        const maxIterations = task.timeout ? Math.max(task.timeout / 10, 100) : 1000
        this.executePendingJobsLoop(maxIterations)

        const value = this.context.dump(result.value)
        result.value.dispose()

        return { value }
      } finally {
        // Remove interrupt handler
        if (task.timeout && task.timeout > 0) {
          this.context.runtime.removeInterruptHandler()
        }
      }
    } catch (e) {
      return {
        error: {
          name: "Error",
          message: e instanceof Error ? e.message : String(e),
          stack: e instanceof Error ? e.stack : undefined,
        },
      }
    } finally {
      this.busy = false
    }
  }

  dispose(): void {
    if (!this._alive) {
      return
    }
    this._alive = false

    if (this.context) {
      this.context.dispose()
      this.context = null
    }
    // Module doesn't need to be disposed - it will be garbage collected
    this.module = null
  }

  [Symbol.dispose](): void {
    this.dispose()
  }
}
