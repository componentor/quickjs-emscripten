/**
 * Worker entry point.
 * This file runs inside a Web Worker or Node.js worker_threads.
 *
 * Supports two modes:
 * - Asyncify variants (singlefile): Full top-level await (TLA) support
 * - WasmFS sync variant: Shared OPFS filesystem with pthreads for async I/O
 */

import {
  newQuickJSAsyncWASMModuleFromVariant,
  newQuickJSWASMModuleFromVariant,
  newVariant,
  type QuickJSAsyncWASMModule,
  type QuickJSAsyncContext,
  type QuickJSAsyncVariant,
  type QuickJSWASMModule,
  type QuickJSContext,
  type QuickJSSyncVariant,
  type QuickJSRuntime,
} from "@componentor/quickjs-emscripten-core"
import type {
  MainToWorkerMessage,
  WorkerToMainMessage,
  InitMessage,
  EvalMessage,
} from "../serialization"
import type { WorkerPoolVariant, WorkerTaskError } from "../types"

// Support both async and sync modules/contexts
let asyncModule: QuickJSAsyncWASMModule | null = null
let asyncContext: QuickJSAsyncContext | null = null
let syncModule: QuickJSWASMModule | null = null
let syncContext: QuickJSContext | null = null

let cancelledTaskId: string | null = null
let currentVariant: WorkerPoolVariant = "singlefile"
let isAsyncVariant = true // true for asyncify variants, false for sync (wasmfs)

/**
 * Get the current context (async or sync).
 */
function getContext(): QuickJSAsyncContext | QuickJSContext | null {
  return isAsyncVariant ? asyncContext : syncContext
}

/**
 * Get the current runtime.
 */
function getRuntime(): QuickJSRuntime | null {
  const ctx = getContext()
  return ctx?.runtime ?? null
}

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
async function loadAsyncVariant(wasmLocation?: string): Promise<QuickJSAsyncVariant> {
  // Load the asyncify variant for TLA support
  const variantModule = await import("@componentor/quickjs-singlefile-cjs-release-asyncify")
  const baseVariant = (variantModule.default ?? variantModule) as unknown as QuickJSAsyncVariant

  // Configure WASM location if provided
  if (wasmLocation) {
    return newVariant(baseVariant, {
      wasmLocation,
      locateFile: (path: string) => {
        if (path.endsWith(".wasm")) {
          return wasmLocation
        }
        const wasmDir = wasmLocation.substring(0, wasmLocation.lastIndexOf("/") + 1)
        return wasmDir + path
      },
    })
  }

  return baseVariant
}

/**
 * Load the WasmFS sync variant with shared OPFS filesystem.
 */
async function loadWasmFSVariant(wasmLocation?: string): Promise<QuickJSSyncVariant> {
  // Load the WasmFS sync variant (uses pthreads for OPFS)
  const variantModule = await import("@componentor/quickjs-wasmfs-release-sync")
  const baseVariant = (variantModule.default ?? variantModule) as unknown as QuickJSSyncVariant

  // Configure WASM location if provided
  if (wasmLocation) {
    return newVariant(baseVariant, {
      wasmLocation,
      locateFile: (path: string) => {
        if (path.endsWith(".wasm")) {
          return wasmLocation
        }
        // For WasmFS, also handle worker file location
        if (path.endsWith(".js") && path.includes("worker")) {
          const wasmDir = wasmLocation.substring(0, wasmLocation.lastIndexOf("/") + 1)
          return wasmDir + path
        }
        const wasmDir = wasmLocation.substring(0, wasmLocation.lastIndexOf("/") + 1)
        return wasmDir + path
      },
    })
  }

  return baseVariant
}

/**
 * Known exports for common Node.js modules.
 */
const moduleExports: Record<string, string[]> = {
  perf_hooks: ["performance", "PerformanceObserver", "PerformanceEntry", "monitorEventLoopDelay"],
  path: [
    "join",
    "resolve",
    "dirname",
    "basename",
    "extname",
    "normalize",
    "relative",
    "isAbsolute",
    "parse",
    "format",
    "sep",
    "delimiter",
    "posix",
    "win32",
  ],
  fs: [
    "readFile",
    "readFileSync",
    "writeFile",
    "writeFileSync",
    "existsSync",
    "exists",
    "mkdir",
    "mkdirSync",
    "readdir",
    "readdirSync",
    "stat",
    "statSync",
    "unlink",
    "unlinkSync",
    "rmdir",
    "rmdirSync",
    "rename",
    "renameSync",
    "copyFile",
    "copyFileSync",
    "access",
    "accessSync",
    "open",
    "openSync",
    "close",
    "closeSync",
    "read",
    "readSync",
    "write",
    "writeSync",
    "appendFile",
    "appendFileSync",
    "createReadStream",
    "createWriteStream",
    "watch",
    "watchFile",
    "unwatchFile",
    "promises",
    "constants",
  ],
  url: [
    "URL",
    "URLSearchParams",
    "parse",
    "format",
    "resolve",
    "fileURLToPath",
    "pathToFileURL",
    "domainToASCII",
    "domainToUnicode",
    "urlToHttpOptions",
    "Url",
  ],
  util: [
    "promisify",
    "inherits",
    "inspect",
    "format",
    "debuglog",
    "deprecate",
    "callbackify",
    "types",
    "isDeepStrictEqual",
    "TextEncoder",
    "TextDecoder",
  ],
  events: ["EventEmitter", "once", "on", "getEventListeners", "setMaxListeners", "listenerCount"],
  stream: [
    "Readable",
    "Writable",
    "Duplex",
    "Transform",
    "PassThrough",
    "Stream",
    "pipeline",
    "finished",
  ],
  buffer: ["Buffer", "constants", "kMaxLength", "kStringMaxLength", "SlowBuffer", "transcode"],
  crypto: [
    "createHash",
    "createHmac",
    "randomBytes",
    "randomUUID",
    "randomInt",
    "randomFillSync",
    "getRandomValues",
    "subtle",
    "timingSafeEqual",
  ],
  os: [
    "platform",
    "arch",
    "cpus",
    "totalmem",
    "freemem",
    "homedir",
    "tmpdir",
    "hostname",
    "type",
    "release",
    "networkInterfaces",
    "userInfo",
    "EOL",
    "endianness",
  ],
  process: [
    "env",
    "cwd",
    "chdir",
    "exit",
    "nextTick",
    "argv",
    "platform",
    "arch",
    "version",
    "versions",
    "pid",
    "ppid",
    "hrtime",
    "memoryUsage",
    "uptime",
    "stdout",
    "stderr",
    "stdin",
    "on",
    "off",
    "once",
    "emit",
  ],
  timers: [
    "setTimeout",
    "setInterval",
    "setImmediate",
    "clearTimeout",
    "clearInterval",
    "clearImmediate",
  ],
  assert: [
    "ok",
    "equal",
    "notEqual",
    "deepEqual",
    "notDeepEqual",
    "strictEqual",
    "notStrictEqual",
    "deepStrictEqual",
    "notDeepStrictEqual",
    "fail",
    "throws",
    "doesNotThrow",
    "ifError",
    "rejects",
    "doesNotReject",
    "match",
    "doesNotMatch",
    "AssertionError",
  ],
  querystring: ["parse", "stringify", "escape", "unescape", "encode", "decode"],
  zlib: [
    "createGzip",
    "createGunzip",
    "createDeflate",
    "createInflate",
    "gzip",
    "gunzip",
    "deflate",
    "inflate",
    "gzipSync",
    "gunzipSync",
    "deflateSync",
    "inflateSync",
    "constants",
  ],
}

/**
 * Set up module loader for ES module imports.
 */
function setupModuleLoader(runtime: QuickJSRuntime): void {
  runtime.setModuleLoader((moduleName: string, _ctx: unknown) => {
    console.log(`[Worker] Module loader called for: ${moduleName}`)
    try {
      // Strip node: prefix if present
      const normalizedName = moduleName.startsWith("node:") ? moduleName.slice(5) : moduleName
      console.log(`[Worker] Normalized module name: ${normalizedName}`)

      // Get known exports for this module
      const knownExports = moduleExports[normalizedName] || []
      console.log(`[Worker] Known exports for ${normalizedName}:`, knownExports.length)

      // Generate named exports
      const namedExports = knownExports
        .map((name) => `export var ${name} = _mod.${name};`)
        .join("\n")

      // Return module code that exports the polyfilled module
      const moduleCode = `var _builtins = globalThis.__builtinModules;
if (!_builtins) throw new Error('__builtinModules not found');
var _mod = _builtins['${normalizedName}'];
if (!_mod) throw new Error("Module '${moduleName}' not found in polyfills. Available: " + Object.keys(_builtins || {}).join(', '));
${namedExports}
export default _mod;
`
      console.log(`[Worker] Returning module code (${moduleCode.length} bytes)`)
      return moduleCode
    } catch (err) {
      console.error(`[Worker] Module loader error:`, err)
      return { error: err instanceof Error ? err : new Error(String(err)) }
    }
  })
}

async function handleInit(message: InitMessage): Promise<void> {
  try {
    currentVariant = message.variant ?? "singlefile"
    isAsyncVariant = currentVariant !== "wasmfs"

    console.log(
      `[Worker] Initializing with variant: ${currentVariant}, isAsync: ${isAsyncVariant}`,
    )

    if (isAsyncVariant) {
      // Load async variant (singlefile with asyncify)
      const variant = await loadAsyncVariant(message.wasmLocation)
      asyncModule = await newQuickJSAsyncWASMModuleFromVariant(variant)
      asyncContext = asyncModule.newContext(message.contextOptions)
      console.log("[Worker] Async context created")
    } else {
      // Load WasmFS sync variant (with pthreads for OPFS)
      const variant = await loadWasmFSVariant(message.wasmLocation)
      syncModule = await newQuickJSWASMModuleFromVariant(variant)
      syncContext = syncModule.newContext(message.contextOptions)
      console.log("[Worker] WasmFS sync context created")
    }

    const context = getContext()
    if (!context) {
      throw new Error("Failed to create context")
    }

    // Run bootstrap code if provided
    if (message.bootstrapCode) {
      console.log("[Worker] Running bootstrap code...")
      if (isAsyncVariant && asyncContext) {
        const result = await asyncContext.evalCodeAsync(message.bootstrapCode, "<bootstrap>")
        if (result.error) {
          const errorValue = asyncContext.dump(result.error)
          result.error.dispose()
          postToMain({
            type: "init-error",
            error: {
              name: "BootstrapError",
              message: `Bootstrap code failed: ${formatError(errorValue)}`,
              stack: getErrorStack(errorValue),
            },
          })
          return
        }
        result.value.dispose()
      } else if (syncContext) {
        const result = syncContext.evalCode(message.bootstrapCode, "<bootstrap>")
        if (result.error) {
          const errorValue = syncContext.dump(result.error)
          result.error.dispose()
          postToMain({
            type: "init-error",
            error: {
              name: "BootstrapError",
              message: `Bootstrap code failed: ${formatError(errorValue)}`,
              stack: getErrorStack(errorValue),
            },
          })
          return
        }
        result.value.dispose()
      }
      console.log("[Worker] Bootstrap code completed")

      // Set up module loader
      const runtime = getRuntime()
      if (runtime) {
        setupModuleLoader(runtime)
      }
    }

    postToMain({ type: "ready" })
  } catch (error) {
    console.error("[Worker] Init error:", error)
    postToMain({
      type: "init-error",
      error: {
        name: "InitializationError",
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
    })
  }
}

/**
 * Format an error value for display.
 */
function formatError(errorValue: unknown): string {
  if (typeof errorValue === "object" && errorValue && "message" in errorValue) {
    return String((errorValue as { message: unknown }).message)
  }
  return String(errorValue)
}

/**
 * Get stack trace from an error value.
 */
function getErrorStack(errorValue: unknown): string | undefined {
  if (typeof errorValue === "object" && errorValue && "stack" in errorValue) {
    return (errorValue as { stack: string }).stack
  }
  return undefined
}

/**
 * Strip shebang from source code.
 */
function stripShebang(source: string): string {
  if (source.startsWith("#!")) {
    const newlineIndex = source.indexOf("\n")
    if (newlineIndex !== -1) {
      return source.substring(newlineIndex + 1)
    }
    return ""
  }
  return source
}

/**
 * Check if code appears to be an ES module.
 */
function isESModule(source: string): boolean {
  return /^\s*(import|export)\s/m.test(source)
}

async function handleEval(message: EvalMessage): Promise<void> {
  const context = getContext()

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

  // Preprocess code
  const code = stripShebang(message.code)
  const isModule = isESModule(code)

  console.log(
    `[Worker] evalCode called with ${code.length} bytes, filename: ${message.filename}, isModule: ${isModule}, variant: ${currentVariant}`,
  )
  console.log(`[Worker] Code preview (first 500 chars):`, code.slice(0, 500))

  // Check if cancelled
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
      if (cancelledTaskId === message.taskId) {
        cancelledTaskId = null
        return true
      }
      if (deadline && Date.now() > deadline) {
        timedOut = true
        return true
      }
      return false
    })

    try {
      let result: { value?: unknown; error?: unknown }

      if (isAsyncVariant && asyncContext) {
        // Use evalCodeAsync for TLA support
        const asyncResult = await asyncContext.evalCodeAsync(code, message.filename ?? "eval.js")
        if (asyncResult.error) {
          result = { error: asyncContext.dump(asyncResult.error) }
          asyncResult.error.dispose()
        } else {
          result = { value: asyncContext.dump(asyncResult.value) }
          asyncResult.value.dispose()
        }
      } else if (syncContext) {
        // Use evalCode for sync variant (WasmFS uses pthreads for async I/O)
        const syncResult = syncContext.evalCode(code, message.filename ?? "eval.js")
        if (syncResult.error) {
          result = { error: syncContext.dump(syncResult.error) }
          syncResult.error.dispose()
        } else {
          result = { value: syncContext.dump(syncResult.value) }
          syncResult.value.dispose()
        }
      } else {
        throw new Error("No context available")
      }

      // Check if cancelled during evaluation
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

      if (result.error) {
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

        const errorValue = result.error
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

      postToMain({
        type: "result",
        taskId: message.taskId,
        value: result.value,
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
  cancelledTaskId = taskId
}

function handleTerminate(): void {
  if (asyncContext) {
    asyncContext.dispose()
    asyncContext = null
  }
  if (syncContext) {
    syncContext.dispose()
    syncContext = null
  }
  asyncModule = null
  syncModule = null

  if (typeof process !== "undefined" && process.exit) {
    process.exit(0)
  }
}

// Initialize the message listener
setupMessageListener()
