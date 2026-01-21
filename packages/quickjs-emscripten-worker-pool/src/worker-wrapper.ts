import type { ContextOptions, Disposable } from "@componentor/quickjs-emscripten-core"

import { WorkerCrashError } from "./errors"
import type { Logger } from "./logger"
import type { PlatformWorker } from "./platform"
import type { WorkerToMainMessage, InitMessage, EvalMessage } from "./serialization"
import type { InternalTask, WorkerPoolVariant, WorkerTaskResult, WorkerTaskError } from "./types"

/**
 * Options for creating a WorkerWrapper.
 * @internal
 */
export interface WorkerWrapperOptions {
  /** Unique worker ID */
  id: number
  /** Factory function to create the platform worker */
  createWorker: () => PlatformWorker
  /** Context options for QuickJS */
  contextOptions?: ContextOptions
  /** QuickJS variant to use */
  variant?: WorkerPoolVariant
  /** OPFS mount path for wasmfs variant */
  opfsMountPath?: string
  /** Bootstrap code to run on initialization */
  bootstrapCode?: string
  /** URL/path to the WASM file */
  wasmLocation?: string
  /** Logger instance */
  logger?: Logger
}

interface PendingTask {
  taskId: string
  resolve: (result: WorkerTaskResult) => void
  reject: (error: Error) => void
  timeoutHandle?: ReturnType<typeof setTimeout>
}

const noopLogger: Logger = { log: () => {}, warn: () => {}, error: () => {} }

/**
 * Manages a single worker's lifecycle and task execution.
 */
export class WorkerWrapper implements Disposable {
  private worker: PlatformWorker | null = null
  private currentTask: PendingTask | null = null
  private initialized = false
  private _alive = true
  private initResolve: (() => void) | null = null
  private initReject: ((error: Error) => void) | null = null

  private readonly _id: number
  private readonly createWorkerFn: () => PlatformWorker
  private readonly contextOptions: object
  private readonly variant: WorkerPoolVariant
  private readonly opfsMountPath: string | undefined
  private readonly bootstrapCode: string | undefined
  private readonly wasmLocation: string | undefined
  private readonly logger: Logger

  private constructor(options: WorkerWrapperOptions) {
    this._id = options.id
    this.createWorkerFn = options.createWorker
    this.contextOptions = options.contextOptions ?? {}
    this.variant = options.variant ?? "singlefile"
    this.opfsMountPath = options.opfsMountPath
    this.bootstrapCode = options.bootstrapCode
    this.wasmLocation = options.wasmLocation
    this.logger = options.logger ?? noopLogger
  }

  /**
   * Create and initialize a new WorkerWrapper.
   */
  static async create(options: WorkerWrapperOptions): Promise<WorkerWrapper> {
    const wrapper = new WorkerWrapper(options)
    await wrapper.initialize()
    return wrapper
  }

  get id(): number {
    return this._id
  }

  private async initialize(): Promise<void> {
    this.logger.log(`Worker #${this._id}: Spawning worker thread...`)
    this.worker = this.createWorkerFn()

    // Set up message handling
    this.worker.onMessage((message) => this.handleMessage(message))
    this.worker.onError((error) => this.handleError(error))

    // Wait for worker to be ready
    await new Promise<void>((resolve, reject) => {
      this.initResolve = resolve
      this.initReject = reject

      // Send init message
      const initMessage: InitMessage = {
        type: "init",
        contextOptions: this.contextOptions,
        variant: this.variant,
        opfsMountPath: this.opfsMountPath,
        bootstrapCode: this.bootstrapCode,
        wasmLocation: this.wasmLocation,
      }
      this.worker!.postMessage(initMessage)
    })

    this.initialized = true
  }

  private handleMessage(message: WorkerToMainMessage): void {
    switch (message.type) {
      case "ready":
        this.logger.log(`Worker #${this._id}: QuickJS runtime initialized`)
        if (this.initResolve) {
          this.initResolve()
          this.initResolve = null
          this.initReject = null
        }
        break

      case "init-error":
        // Handle initialization errors (bootstrap code failures, WASM load errors, etc.)
        this.logger.error(`Worker #${this._id}: Initialization failed:`, message.error.message)
        if (message.error.stack) {
          this.logger.error(`Worker #${this._id}: Stack:`, message.error.stack)
        }
        if (this.initReject) {
          this.initReject(new Error(`Worker initialization failed: ${message.error.message}`))
          this.initResolve = null
          this.initReject = null
        }
        break

      case "result":
        if (this.currentTask && this.currentTask.taskId === message.taskId) {
          this.logger.log(`Worker #${this._id}: Task ${message.taskId} completed`)
          this.clearTaskTimeout()
          this.currentTask.resolve({ value: message.value })
          this.currentTask = null
        }
        break

      case "error":
        // Handle task errors
        if (this.currentTask && this.currentTask.taskId === message.taskId) {
          this.logger.warn(
            `Worker #${this._id}: Task ${message.taskId} errored:`,
            message.error.message,
          )
          this.clearTaskTimeout()
          this.currentTask.resolve({ error: message.error })
          this.currentTask = null
        }
        break
    }
  }

  private handleError(error: Error): void {
    this.logger.error(`Worker #${this._id}: Worker crashed!`, error.message)

    // Worker crashed
    if (this.initReject) {
      this.initReject(error)
      this.initResolve = null
      this.initReject = null
      return
    }

    if (this.currentTask) {
      this.clearTaskTimeout()
      this.currentTask.reject(new WorkerCrashError(this.currentTask.taskId, error))
      this.currentTask = null
    }

    // Mark as dead - worker needs to be recreated
    this._alive = false
  }

  private clearTaskTimeout(): void {
    if (this.currentTask?.timeoutHandle) {
      clearTimeout(this.currentTask.timeoutHandle)
    }
  }

  get alive(): boolean {
    return this._alive && this.initialized
  }

  get busy(): boolean {
    return this.currentTask !== null
  }

  /**
   * Execute a task on this worker.
   * @throws Error if worker is busy or not alive
   */
  async execute(task: InternalTask): Promise<WorkerTaskResult> {
    if (!this._alive || !this.worker) {
      throw new Error("Worker is not alive")
    }

    if (this.currentTask) {
      throw new Error("Worker is busy")
    }

    this.logger.log(`Worker #${this._id}: Starting ${task.taskId}`)

    return new Promise<WorkerTaskResult>((resolve, reject) => {
      this.currentTask = {
        taskId: task.taskId,
        resolve,
        reject,
      }

      // Set up timeout
      if (task.timeout && task.timeout > 0) {
        this.currentTask.timeoutHandle = setTimeout(() => {
          if (this.currentTask && this.currentTask.taskId === task.taskId) {
            this.logger.warn(
              `Worker #${this._id}: Task ${task.taskId} timed out after ${task.timeout}ms`,
            )
            // Send cancel message to worker
            this.worker?.postMessage({ type: "cancel", taskId: task.taskId })

            const error: WorkerTaskError = {
              name: "TimeoutError",
              message: `Task timed out after ${task.timeout}ms`,
              isTimeout: true,
            }
            this.currentTask.resolve({ error })
            this.currentTask = null
          }
        }, task.timeout)
      }

      // Send eval message
      const evalMessage: EvalMessage = {
        type: "eval",
        taskId: task.taskId,
        code: task.code,
        filename: task.filename,
        timeout: task.timeout,
      }
      this.worker!.postMessage(evalMessage)
    })
  }

  /**
   * Cancel the current task if one is running.
   */
  cancelCurrentTask(): void {
    if (this.currentTask && this.worker) {
      this.clearTaskTimeout()
      this.worker.postMessage({ type: "cancel", taskId: this.currentTask.taskId })

      const error: WorkerTaskError = {
        name: "CancelledError",
        message: "Task was cancelled",
        isCancelled: true,
      }
      this.currentTask.resolve({ error })
      this.currentTask = null
    }
  }

  dispose(): void {
    if (!this._alive) {
      return
    }

    this._alive = false

    // Cancel current task
    if (this.currentTask) {
      this.clearTaskTimeout()
      this.currentTask.reject(new Error("Worker disposed"))
      this.currentTask = null
    }

    // Terminate worker
    if (this.worker) {
      this.worker.postMessage({ type: "terminate" })
      this.worker.terminate()
      this.worker = null
    }
  }

  [Symbol.dispose](): void {
    this.dispose()
  }
}
