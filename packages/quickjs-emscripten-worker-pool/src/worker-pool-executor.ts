import type { ContextOptions } from "@componentor/quickjs-emscripten-core"
import type { TaskExecutor, InternalTask, WorkerTaskResult } from "./types"
import { WorkerWrapper } from "./worker-wrapper"
import { getPlatformWorkerFactory, type PlatformWorkerFactory } from "./platform"
import type { Logger } from "./logger"

/**
 * Multi-threaded executor that runs tasks across multiple Web Workers.
 */
export class WorkerPoolExecutor implements TaskExecutor {
  private workers: WorkerWrapper[] = []
  private _alive = true
  private readonly factory: PlatformWorkerFactory
  private workerIdCounter = 0

  private constructor(
    private readonly poolSize: number,
    private readonly contextOptions: ContextOptions,
    private readonly logger: Logger,
  ) {
    this.factory = getPlatformWorkerFactory()
  }

  /**
   * Create a new WorkerPoolExecutor.
   *
   * @param poolSize Number of workers in the pool
   * @param contextOptions Options to pass to each worker's QuickJS context
   * @param preWarm If true, initialize all workers immediately
   * @param logger Logger instance for verbose output
   */
  static async create(
    poolSize: number,
    contextOptions: ContextOptions = {},
    preWarm = false,
    logger?: Logger,
  ): Promise<WorkerPoolExecutor> {
    const noopLogger = { log: () => {}, warn: () => {}, error: () => {} }
    const executor = new WorkerPoolExecutor(poolSize, contextOptions, logger ?? noopLogger)

    if (preWarm) {
      await executor.warmUp()
    }

    return executor
  }

  /**
   * Pre-initialize all workers in the pool.
   */
  private async warmUp(): Promise<void> {
    this.logger.log(`Pre-warming ${this.poolSize} workers...`)
    const workerScriptUrl = this.factory.getWorkerScriptUrl()
    const initPromises: Promise<WorkerWrapper>[] = []

    for (let i = 0; i < this.poolSize; i++) {
      const workerId = ++this.workerIdCounter
      this.logger.log(`Creating worker #${workerId}...`)
      initPromises.push(
        WorkerWrapper.create(
          workerId,
          () => this.factory.createWorker(workerScriptUrl),
          this.contextOptions,
          this.logger,
        ),
      )
    }

    this.workers = await Promise.all(initPromises)
    this.logger.log(`All ${this.poolSize} workers ready`)
  }

  /**
   * Get or create an available worker.
   * Returns null if all workers are busy and pool is at capacity.
   */
  private async getOrCreateWorker(): Promise<WorkerWrapper | null> {
    // Find an available worker
    const available = this.workers.find((w) => w.alive && !w.busy)
    if (available) {
      this.logger.log(`Reusing worker #${available.id}`)
      return available
    }

    // If pool isn't full, create a new worker (lazy initialization)
    if (this.workers.length < this.poolSize) {
      const workerId = ++this.workerIdCounter
      this.logger.log(
        `Creating new worker #${workerId} (lazy init, ${this.workers.length + 1}/${this.poolSize})`,
      )
      const workerScriptUrl = this.factory.getWorkerScriptUrl()
      const worker = await WorkerWrapper.create(
        workerId,
        () => this.factory.createWorker(workerScriptUrl),
        this.contextOptions,
        this.logger,
      )
      this.workers.push(worker)
      this.logger.log(`Worker #${workerId} ready`)
      return worker
    }

    // All workers busy and at capacity
    this.logger.log("All workers busy, task will wait")
    return null
  }

  get alive(): boolean {
    return this._alive
  }

  get isMultiThreaded(): boolean {
    return true
  }

  get busyCount(): number {
    return this.workers.filter((w) => w.alive && w.busy).length
  }

  get availableCount(): number {
    const aliveAndFree = this.workers.filter((w) => w.alive && !w.busy).length
    const canCreate = this.poolSize - this.workers.length
    return aliveAndFree + canCreate
  }

  get maxConcurrency(): number {
    return this.poolSize
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

    // Get an available worker
    const worker = await this.getOrCreateWorker()

    if (!worker) {
      // This shouldn't happen if the pool is being used correctly
      // (tasks should be queued at the pool level, not here)
      return {
        error: {
          name: "Error",
          message: "No available workers",
        },
      }
    }

    try {
      return await worker.execute(task)
    } catch (error) {
      // Worker might have crashed - try to recover
      if (!worker.alive) {
        // Remove dead worker
        const index = this.workers.indexOf(worker)
        if (index >= 0) {
          this.workers.splice(index, 1)
        }
      }

      return {
        error: {
          name: "WorkerError",
          message: error instanceof Error ? error.message : String(error),
          isWorkerCrash: true,
        },
      }
    }
  }

  /**
   * Check if an available worker exists (without waiting).
   */
  hasAvailableWorker(): boolean {
    return this.workers.some((w) => w.alive && !w.busy) || this.workers.length < this.poolSize
  }

  dispose(): void {
    if (!this._alive) {
      return
    }

    this._alive = false

    // Dispose all workers
    for (const worker of this.workers) {
      worker.dispose()
    }
    this.workers = []
  }

  [Symbol.dispose](): void {
    this.dispose()
  }
}
