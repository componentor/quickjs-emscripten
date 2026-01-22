import type {
  TaskExecutor,
  InternalTask,
  WorkerPoolVariant,
  WorkerTaskResult,
  WorkerPoolExecutorOptions,
} from "./types"
import { WorkerWrapper } from "./worker-wrapper"
import { getPlatformWorkerFactory, type PlatformWorkerFactory } from "./platform"
import type { Logger } from "./logger"

const noopLogger: Logger = { log: () => {}, warn: () => {}, error: () => {} }

/**
 * Multi-threaded executor that runs tasks across multiple Web Workers.
 */
export class WorkerPoolExecutor implements TaskExecutor {
  private workers: WorkerWrapper[] = []
  private _alive = true
  private readonly factory: PlatformWorkerFactory
  private workerIdCounter = 0
  /** Worker IDs reserved for sessions (not available for pool tasks) */
  private reservedWorkerIds = new Set<number>()

  private readonly poolSize: number
  private readonly contextOptions: object
  private readonly variant: WorkerPoolVariant
  private readonly opfsMountPath: string | undefined
  private readonly bootstrapCode: string | undefined
  private readonly wasmLocation: string | undefined
  private readonly workerUrl: string | undefined
  private readonly logger: Logger

  private constructor(options: WorkerPoolExecutorOptions) {
    this.poolSize = options.poolSize
    this.contextOptions = options.contextOptions ?? {}
    this.variant = options.variant ?? "singlefile"
    this.opfsMountPath = options.opfsMountPath
    this.bootstrapCode = options.bootstrapCode
    this.wasmLocation = options.wasmLocation
    this.workerUrl = options.workerUrl
    this.logger = options.logger ?? noopLogger
    this.factory = getPlatformWorkerFactory()
  }

  /**
   * Get the worker script URL to use.
   * Uses custom workerUrl if provided, otherwise falls back to factory resolution.
   */
  private getWorkerScriptUrl(): string | URL {
    if (this.workerUrl) {
      this.logger.log(`Using custom worker URL: ${this.workerUrl}`)
      return this.workerUrl
    }
    return this.factory.getWorkerScriptUrl()
  }

  /**
   * Create a new WorkerPoolExecutor.
   */
  static async create(options: WorkerPoolExecutorOptions): Promise<WorkerPoolExecutor> {
    const executor = new WorkerPoolExecutor(options)

    if (options.preWarm) {
      await executor.warmUp()
    }

    return executor
  }

  /**
   * Pre-initialize all workers in the pool.
   */
  private async warmUp(): Promise<void> {
    this.logger.log(`Pre-warming ${this.poolSize} workers...`)
    const workerScriptUrl = this.getWorkerScriptUrl()
    const initPromises: Promise<WorkerWrapper>[] = []

    for (let i = 0; i < this.poolSize; i++) {
      const workerId = ++this.workerIdCounter
      this.logger.log(`Creating worker #${workerId}...`)
      initPromises.push(
        WorkerWrapper.create({
          id: workerId,
          createWorker: () => this.factory.createWorker(workerScriptUrl),
          contextOptions: this.contextOptions,
          variant: this.variant,
          opfsMountPath: this.opfsMountPath,
          bootstrapCode: this.bootstrapCode,
          wasmLocation: this.wasmLocation,
          logger: this.logger,
        }),
      )
    }

    this.workers = await Promise.all(initPromises)
    this.logger.log(`All ${this.poolSize} workers ready`)
  }

  /**
   * Get or create an available worker.
   * Returns null if all workers are busy and pool is at capacity.
   * Skips workers that are reserved for sessions.
   */
  private async getOrCreateWorker(): Promise<WorkerWrapper | null> {
    // Find an available worker (not reserved for a session)
    const available = this.workers.find(
      (w) => w.alive && !w.busy && !this.reservedWorkerIds.has(w.id),
    )
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
      const workerScriptUrl = this.getWorkerScriptUrl()
      const worker = await WorkerWrapper.create({
        id: workerId,
        createWorker: () => this.factory.createWorker(workerScriptUrl),
        contextOptions: this.contextOptions,
        variant: this.variant,
        opfsMountPath: this.opfsMountPath,
        bootstrapCode: this.bootstrapCode,
        wasmLocation: this.wasmLocation,
        logger: this.logger,
      })
      this.workers.push(worker)
      this.logger.log(`Worker #${workerId} ready`)
      return worker
    }

    // All workers busy and at capacity
    this.logger.log("All workers busy, task will wait")
    return null
  }

  /**
   * Reserve a worker for exclusive use by a session.
   * Creates a new worker if needed and pool isn't full.
   * @returns The reserved worker, or null if no workers available
   */
  async reserveWorkerForSession(): Promise<WorkerWrapper | null> {
    if (!this._alive) {
      return null
    }

    // Find an available worker that's not reserved
    let worker = this.workers.find((w) => w.alive && !w.busy && !this.reservedWorkerIds.has(w.id))

    // If no available worker, try to create one
    if (!worker && this.workers.length < this.poolSize) {
      const workerId = ++this.workerIdCounter
      this.logger.log(`Creating worker #${workerId} for session...`)
      const workerScriptUrl = this.getWorkerScriptUrl()
      worker = await WorkerWrapper.create({
        id: workerId,
        createWorker: () => this.factory.createWorker(workerScriptUrl),
        contextOptions: this.contextOptions,
        variant: this.variant,
        opfsMountPath: this.opfsMountPath,
        bootstrapCode: this.bootstrapCode,
        wasmLocation: this.wasmLocation,
        logger: this.logger,
      })
      this.workers.push(worker)
    }

    if (worker) {
      this.reservedWorkerIds.add(worker.id)
      this.logger.log(`Reserved worker #${worker.id} for session`)
      return worker
    }

    return null
  }

  /**
   * Release a reserved worker back to the pool.
   */
  releaseReservedWorker(workerId: number): void {
    if (this.reservedWorkerIds.has(workerId)) {
      this.reservedWorkerIds.delete(workerId)
      this.logger.log(`Released worker #${workerId} from session reservation`)
    }
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
    // Count workers that are alive, not busy, and not reserved for sessions
    const aliveAndFree = this.workers.filter(
      (w) => w.alive && !w.busy && !this.reservedWorkerIds.has(w.id),
    ).length
    const canCreate = this.poolSize - this.workers.length
    return aliveAndFree + canCreate
  }

  /** Number of workers reserved for sessions */
  get reservedCount(): number {
    return this.reservedWorkerIds.size
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
   * Excludes workers reserved for sessions.
   */
  hasAvailableWorker(): boolean {
    return (
      this.workers.some((w) => w.alive && !w.busy && !this.reservedWorkerIds.has(w.id)) ||
      this.workers.length < this.poolSize
    )
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
