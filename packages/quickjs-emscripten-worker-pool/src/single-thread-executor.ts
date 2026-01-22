import {
  newQuickJSAsyncWASMModuleFromVariant,
  type QuickJSAsyncWASMModule,
  type QuickJSAsyncContext,
  type ContextOptions,
  type QuickJSAsyncVariant,
} from "@componentor/quickjs-emscripten-core"
import type { TaskExecutor, InternalTask, WorkerTaskResult } from "./types"
import type { Logger } from "./logger"

/**
 * Single-threaded executor that runs tasks sequentially on the main thread.
 * Used as a fallback when SharedArrayBuffer is not available.
 *
 * Uses asyncify variant with evalCodeAsync for full top-level await support,
 * matching how the worker-entry.ts handles async operations.
 */
export class SingleThreadExecutor implements TaskExecutor {
  private module: QuickJSAsyncWASMModule | null = null
  private context: QuickJSAsyncContext | null = null
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
    this.logger.log("Loading QuickJS asyncify WASM module (single-threaded mode)...")
    // Dynamically import the asyncify variant for full TLA support
    const variantModule = await import("@componentor/quickjs-singlefile-cjs-release-asyncify")
    // Handle both ESM default export and CJS module.exports patterns
    const variant = (variantModule.default ?? variantModule) as unknown as QuickJSAsyncVariant
    this.module = await newQuickJSAsyncWASMModuleFromVariant(variant)
    this.context = this.module.newContext(this.contextOptions)
    this.logger.log("QuickJS asyncify context initialized")

    // Run bootstrap code if provided
    if (this.bootstrapCode && this.context) {
      this.logger.log("Running bootstrap code...")
      // Use evalCodeAsync for TLA support in bootstrap code
      const result = await this.context.evalCodeAsync(this.bootstrapCode, "<bootstrap>")
      if (result.error) {
        const errorValue = this.context.dump(result.error)
        result.error.dispose()
        throw new Error(
          `Bootstrap code failed: ${typeof errorValue === "object" && errorValue && "message" in errorValue ? (errorValue as { message: string }).message : String(errorValue)}`,
        )
      }
      result.value.dispose()
      this.logger.log("Bootstrap code completed")
    }
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
        // Use evalCodeAsync for full top-level await support
        const result = await this.context.evalCodeAsync(task.code, task.filename ?? "eval.js")

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

        // With asyncify, TLA and promises are handled automatically by evalCodeAsync
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
