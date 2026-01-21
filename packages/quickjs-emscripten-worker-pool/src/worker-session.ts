import type { Logger } from "./logger"
import type { WorkerWrapper } from "./worker-wrapper"
import type { WorkerSession, WorkerTaskResult, SessionEvalOptions, InternalTask } from "./types"

/**
 * Implementation of WorkerSession that pins evaluations to a single worker.
 */
export class WorkerSessionImpl implements WorkerSession {
  private _alive = true
  private taskIdCounter = 0

  constructor(
    readonly sessionId: string,
    private readonly worker: WorkerWrapper,
    private readonly onRelease: (session: WorkerSessionImpl) => void,
    private readonly logger: Logger,
  ) {}

  get workerId(): number {
    return this.worker.id
  }

  get alive(): boolean {
    return this._alive && this.worker.alive
  }

  async evalCode(code: string, options?: SessionEvalOptions): Promise<WorkerTaskResult> {
    if (!this._alive) {
      return {
        error: {
          name: "SessionReleasedError",
          message: "Session has been released",
        },
      }
    }

    if (!this.worker.alive) {
      this._alive = false
      return {
        error: {
          name: "WorkerCrashedError",
          message: "Worker has crashed",
          isWorkerCrash: true,
        },
      }
    }

    const taskId = `${this.sessionId}-task-${++this.taskIdCounter}`

    const task: InternalTask = {
      code,
      taskId,
      filename: options?.filename,
      timeout: options?.timeout,
      enqueuedAt: Date.now(),
    }

    this.logger.log(`Session ${this.sessionId}: Evaluating on worker #${this.worker.id}`)

    try {
      const result = await this.worker.execute(task)
      this.logger.log(`Session ${this.sessionId}: Evaluation complete`)
      return result
    } catch (error) {
      this.logger.error(`Session ${this.sessionId}: Evaluation failed`, error)
      return {
        error: {
          name: "Error",
          message: error instanceof Error ? error.message : String(error),
        },
      }
    }
  }

  release(): void {
    if (!this._alive) {
      return
    }

    this._alive = false
    this.logger.log(
      `Session ${this.sessionId}: Released, returning worker #${this.worker.id} to pool`,
    )
    this.onRelease(this)
  }

  dispose(): void {
    this.release()
  }

  [Symbol.dispose](): void {
    this.dispose()
  }
}
