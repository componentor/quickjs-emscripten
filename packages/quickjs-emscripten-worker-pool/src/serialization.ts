import type { ContextOptions } from "@componentor/quickjs-emscripten-core"
import type { WorkerPoolVariant, WorkerTaskError } from "./types"

/**
 * Messages sent from the main thread to a worker.
 */
export type MainToWorkerMessage = InitMessage | EvalMessage | CancelMessage | TerminateMessage

export interface InitMessage {
  type: "init"
  contextOptions: ContextOptions
  /** Which QuickJS variant to use */
  variant: WorkerPoolVariant
  /** OPFS mount path (only for wasmfs variant) */
  opfsMountPath?: string
  /** JavaScript code to run after context initialization */
  bootstrapCode?: string
  /** Location of the WASM file (used by workers to locate the WASM binary) */
  wasmLocation?: string
}

export interface EvalMessage {
  type: "eval"
  taskId: string
  code: string
  filename?: string
  timeout?: number
}

export interface CancelMessage {
  type: "cancel"
  taskId: string
}

export interface TerminateMessage {
  type: "terminate"
}

/**
 * Messages sent from a worker to the main thread.
 */
export type WorkerToMainMessage = ReadyMessage | InitErrorMessage | ResultMessage | ErrorMessage

export interface ReadyMessage {
  type: "ready"
}

export interface InitErrorMessage {
  type: "init-error"
  error: WorkerTaskError
}

export interface ResultMessage {
  type: "result"
  taskId: string
  value: unknown
}

export interface ErrorMessage {
  type: "error"
  taskId: string
  error: WorkerTaskError
}
