/**
 * Worker entry point.
 * This file runs inside a Web Worker or Node.js worker_threads.
 */

import {
  newQuickJSWASMModuleFromVariant,
  type QuickJSWASMModule,
  type QuickJSContext,
  type QuickJSSyncVariant,
} from "@componentor/quickjs-emscripten-core"
import type {
  MainToWorkerMessage,
  WorkerToMainMessage,
  InitMessage,
  EvalMessage,
} from "../serialization"
import type { WorkerPoolVariant, WorkerTaskError } from "../types"

let module: QuickJSWASMModule | null = null
let context: QuickJSContext | null = null
let cancelledTaskId: string | null = null
let currentVariant: WorkerPoolVariant = "singlefile"

/**
 * Post a message to the main thread.
 * Works in both browser Web Workers and Node.js worker_threads.
 */
function postToMain(message: WorkerToMainMessage): void {
  if (typeof self !== "undefined" && typeof self.postMessage === "function") {
    // Browser Web Worker
    self.postMessage(message)
  } else if (typeof require !== "undefined" && typeof process !== "undefined") {
    // Node.js worker_threads
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { parentPort } = require("worker_threads") as {
      parentPort?: { postMessage: (msg: unknown) => void }
    }
    parentPort?.postMessage(message)
  }
}

/**
 * Set up message listener.
 */
function setupMessageListener(): void {
  const handler = async (data: MainToWorkerMessage | { data: MainToWorkerMessage }) => {
    // Handle both browser (MessageEvent) and Node.js (raw data) formats
    const message =
      "data" in data && typeof data.data === "object" ? data.data : (data as MainToWorkerMessage)

    switch (message.type) {
      case "init":
        await handleInit(message)
        break
      case "eval":
        await handleEval(message)
        break
      case "cancel":
        handleCancel(message.taskId)
        break
      case "terminate":
        handleTerminate()
        break
    }
  }

  if (typeof self !== "undefined" && typeof self.addEventListener === "function") {
    // Browser Web Worker
    self.addEventListener("message", (event) => handler(event.data))
  } else if (typeof require !== "undefined" && typeof process !== "undefined") {
    // Node.js worker_threads
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { parentPort } = require("worker_threads") as {
      parentPort?: { on: (event: string, handler: unknown) => void }
    }
    parentPort?.on("message", handler)
  }
}

/**
 * Load the appropriate QuickJS variant based on configuration.
 */
async function loadVariant(variantName: WorkerPoolVariant): Promise<QuickJSSyncVariant> {
  switch (variantName) {
    case "wasmfs": {
      // WasmFS variant with shared OPFS filesystem
      const variantModule = await import("@componentor/quickjs-wasmfs-release-sync")
      return (variantModule.default ?? variantModule) as unknown as QuickJSSyncVariant
    }
    case "singlefile":
    default: {
      // Default singlefile variant - isolated, no shared state
      const variantModule = await import("@componentor/quickjs-singlefile-cjs-release-sync")
      return (variantModule.default ?? variantModule) as unknown as QuickJSSyncVariant
    }
  }
}

async function handleInit(message: InitMessage): Promise<void> {
  try {
    currentVariant = message.variant ?? "singlefile"

    // Load the appropriate variant
    const variant = await loadVariant(currentVariant)
    module = await newQuickJSWASMModuleFromVariant(variant)
    context = module.newContext(message.contextOptions)

    // For wasmfs variant, the OPFS is automatically mounted at /root by the variant
    // Additional mounts can be configured via the variant's module if needed

    postToMain({ type: "ready" })
  } catch (error) {
    postToMain({
      type: "error",
      taskId: "init",
      error: {
        name: "InitializationError",
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
    })
  }
}

async function handleEval(message: EvalMessage): Promise<void> {
  if (!context) {
    postToMain({
      type: "error",
      taskId: message.taskId,
      error: {
        name: "Error",
        message: "Worker not initialized",
      },
    })
    return
  }

  // Check if this task was already cancelled
  if (cancelledTaskId === message.taskId) {
    cancelledTaskId = null
    postToMain({
      type: "error",
      taskId: message.taskId,
      error: {
        name: "CancelledError",
        message: "Task was cancelled",
        isCancelled: true,
      },
    })
    return
  }

  try {
    // Set up interrupt handler for timeout and cancellation
    let timedOut = false
    const deadline = message.timeout ? Date.now() + message.timeout : 0

    context.runtime.setInterruptHandler(() => {
      // Check for cancellation
      if (cancelledTaskId === message.taskId) {
        cancelledTaskId = null
        return true
      }

      // Check for timeout
      if (deadline && Date.now() > deadline) {
        timedOut = true
        return true
      }

      return false
    })

    try {
      const result = context.evalCode(message.code, message.filename ?? "eval.js")

      // Check if cancelled during execution
      if (cancelledTaskId === message.taskId) {
        cancelledTaskId = null
        if (result.error) {
          result.error.dispose()
        } else {
          result.value.dispose()
        }
        postToMain({
          type: "error",
          taskId: message.taskId,
          error: {
            name: "CancelledError",
            message: "Task was cancelled",
            isCancelled: true,
          },
        })
        return
      }

      if (result.error) {
        const errorValue = context.dump(result.error)
        result.error.dispose()

        if (timedOut) {
          postToMain({
            type: "error",
            taskId: message.taskId,
            error: {
              name: "TimeoutError",
              message: `Task timed out after ${message.timeout}ms`,
              isTimeout: true,
            },
          })
          return
        }

        let error: WorkerTaskError
        if (errorValue && typeof errorValue === "object" && "message" in errorValue) {
          error = {
            name: (errorValue as { name?: string }).name ?? "Error",
            message: String((errorValue as { message?: unknown }).message),
            stack: (errorValue as { stack?: string }).stack,
          }
        } else {
          error = {
            name: "Error",
            message: String(errorValue),
          }
        }

        postToMain({
          type: "error",
          taskId: message.taskId,
          error,
        })
        return
      }

      const value = context.dump(result.value)
      result.value.dispose()

      postToMain({
        type: "result",
        taskId: message.taskId,
        value,
      })
    } finally {
      context.runtime.removeInterruptHandler()
    }
  } catch (error) {
    postToMain({
      type: "error",
      taskId: message.taskId,
      error: {
        name: "Error",
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
    })
  }
}

function handleCancel(taskId: string): void {
  // Mark this task as cancelled - the interrupt handler will pick it up
  cancelledTaskId = taskId
}

function handleTerminate(): void {
  if (context) {
    context.dispose()
    context = null
  }
  module = null

  // In Node.js, we need to exit the process
  if (typeof process !== "undefined" && process.exit) {
    process.exit(0)
  }
}

// Initialize the message listener
setupMessageListener()
