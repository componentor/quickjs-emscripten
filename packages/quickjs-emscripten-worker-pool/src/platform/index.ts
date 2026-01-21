import type { MainToWorkerMessage, WorkerToMainMessage } from "../serialization"
import { detectPlatform } from "../capabilities"
import { createRequire } from "module"
import { fileURLToPath } from "url"
import { dirname, resolve } from "path"

/**
 * Platform-agnostic worker interface.
 */
export interface PlatformWorker {
  /** Send a message to the worker */
  postMessage(message: MainToWorkerMessage): void

  /** Set the message handler */
  onMessage(handler: (message: WorkerToMainMessage) => void): void

  /** Set the error handler */
  onError(handler: (error: Error) => void): void

  /** Terminate the worker */
  terminate(): void
}

/**
 * Factory for creating platform-specific workers.
 */
export interface PlatformWorkerFactory {
  /**
   * Create a new worker.
   * @param workerScript The URL or path to the worker script
   */
  createWorker(workerScript: string | URL): PlatformWorker

  /**
   * Get the URL/path to the bundled worker script.
   */
  getWorkerScriptUrl(): string | URL
}

/**
 * Get the appropriate worker factory for the current platform.
 */
export function getPlatformWorkerFactory(): PlatformWorkerFactory {
  const platform = detectPlatform()

  if (platform === "node") {
    return new NodeWorkerFactory()
  }

  return new BrowserWorkerFactory()
}

/**
 * Browser Web Worker factory.
 */
class BrowserWorkerFactory implements PlatformWorkerFactory {
  createWorker(workerScript: string | URL): PlatformWorker {
    const worker = new Worker(workerScript, { type: "module" })
    return new BrowserWorkerWrapper(worker)
  }

  getWorkerScriptUrl(): URL {
    // The worker script is in the /worker subdirectory as a self-contained bundle
    if (typeof import.meta !== "undefined" && import.meta.url) {
      return new URL("./worker/worker-entry.mjs", import.meta.url)
    }
    // Fallback for environments without import.meta
    return new URL("./worker/worker-entry.mjs", location.href)
  }
}

/**
 * Browser Web Worker wrapper.
 */
class BrowserWorkerWrapper implements PlatformWorker {
  constructor(private readonly worker: Worker) {}

  postMessage(message: MainToWorkerMessage): void {
    this.worker.postMessage(message)
  }

  onMessage(handler: (message: WorkerToMainMessage) => void): void {
    this.worker.onmessage = (event) => handler(event.data)
  }

  onError(handler: (error: Error) => void): void {
    this.worker.onerror = (event) => {
      handler(new Error(event.message || "Worker error"))
    }
  }

  terminate(): void {
    this.worker.terminate()
  }
}

/**
 * Node.js worker_threads factory.
 */
class NodeWorkerFactory implements PlatformWorkerFactory {
  private require: NodeRequire

  constructor() {
    // Create a require function that works in both ESM and CJS
    if (typeof import.meta !== "undefined" && import.meta.url) {
      this.require = createRequire(import.meta.url)
    } else {
      // In CJS, use the global require
      this.require = require
    }
  }

  createWorker(workerScript: string | URL): PlatformWorker {
    const { Worker } = this.require("worker_threads")
    const scriptPath = workerScript instanceof URL ? fileURLToPath(workerScript) : workerScript
    const worker = new Worker(scriptPath)
    return new NodeWorkerWrapper(worker)
  }

  getWorkerScriptUrl(): string {
    // In Node.js with ESM, use import.meta.url if available
    if (typeof import.meta !== "undefined" && import.meta.url) {
      const currentDir = dirname(fileURLToPath(import.meta.url))
      return resolve(currentDir, "./worker/worker-entry.mjs")
    }
    // Fallback for CJS
    return resolve(__dirname, "./worker/worker-entry.js")
  }
}

/**
 * Node.js worker_threads wrapper.
 */
class NodeWorkerWrapper implements PlatformWorker {
  // Using 'any' here because we can't import worker_threads types in a browser-compatible way
  constructor(private readonly worker: any) {}

  postMessage(message: MainToWorkerMessage): void {
    this.worker.postMessage(message)
  }

  onMessage(handler: (message: WorkerToMainMessage) => void): void {
    this.worker.on("message", handler)
  }

  onError(handler: (error: Error) => void): void {
    this.worker.on("error", handler)
  }

  terminate(): void {
    this.worker.terminate()
  }
}
