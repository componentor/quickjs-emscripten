/**
 * Worker entry point.
 * This file runs inside a Web Worker or Node.js worker_threads.
 *
 * Uses sync variants for WasmFS support (shared filesystem).
 * Async operations are handled via executePendingJobs() loops,
 * matching how the main runtime handles promises and async work.
 */

import {
  newQuickJSWASMModuleFromVariant,
  newVariant,
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
 * Load the appropriate QuickJS sync variant based on configuration.
 * Uses sync variants for WasmFS support (shared filesystem).
 */
async function loadVariant(
  variantName: WorkerPoolVariant,
  wasmLocation?: string,
): Promise<QuickJSSyncVariant> {
  switch (variantName) {
    case "wasmfs": {
      // WasmFS variant with shared OPFS filesystem
      const variantModule = await import("@componentor/quickjs-wasmfs-release-sync")
      const baseVariant = (variantModule.default ?? variantModule) as unknown as QuickJSSyncVariant

      // Configure WASM location if provided
      if (wasmLocation) {
        return newVariant(baseVariant, {
          wasmLocation,
          locateFile: (path: string) => {
            // Handle WASM file
            if (path.endsWith(".wasm")) {
              return wasmLocation
            }
            // Handle pthread worker - typically in same directory as WASM
            if (path.endsWith(".worker.js") || path.includes("worker")) {
              return wasmLocation.replace(/\.wasm$/, "-worker.js")
            }
            // Default: use wasmLocation directory
            const wasmDir = wasmLocation.substring(0, wasmLocation.lastIndexOf("/") + 1)
            return wasmDir + path
          },
        })
      }

      return baseVariant
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

    // Load the appropriate sync variant with WASM location if provided
    const variant = await loadVariant(currentVariant, message.wasmLocation)
    module = await newQuickJSWASMModuleFromVariant(variant)
    context = module.newContext(message.contextOptions)

    // For wasmfs variant, the OPFS is automatically mounted at /root by the variant
    // Additional mounts can be configured via the variant's module if needed

    // Run bootstrap code if provided (for setting up polyfills, globals, etc.)
    if (message.bootstrapCode && context) {
      const result = context.evalCode(message.bootstrapCode, "<bootstrap>")
      if (result.error) {
        const errorValue = context.dump(result.error)
        result.error.dispose()
        postToMain({
          type: "init-error",
          error: {
            name: "BootstrapError",
            message: `Bootstrap code failed: ${typeof errorValue === "object" && errorValue && "message" in errorValue ? (errorValue as { message: string }).message : String(errorValue)}`,
            stack:
              typeof errorValue === "object" && errorValue && "stack" in errorValue
                ? (errorValue as { stack: string }).stack
                : undefined,
          },
        })
        return
      }
      result.value.dispose()

      // Execute any pending jobs from bootstrap (promises, async work)
      executePendingJobsLoop(context, 100)

      // Set up module loader for ES module imports (dynamic import() calls)
      // This allows polyfilled modules to be loaded via import() syntax
      // Known exports for common Node.js modules that need named ESM exports
      const moduleExports: Record<string, string[]> = {
        perf_hooks: [
          "performance",
          "PerformanceObserver",
          "PerformanceEntry",
          "monitorEventLoopDelay",
        ],
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
        events: [
          "EventEmitter",
          "once",
          "on",
          "getEventListeners",
          "setMaxListeners",
          "listenerCount",
        ],
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
        buffer: [
          "Buffer",
          "constants",
          "kMaxLength",
          "kStringMaxLength",
          "SlowBuffer",
          "transcode",
        ],
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

      context.runtime.setModuleLoader((moduleName, _ctx) => {
        console.log(`[Worker] Module loader called for: ${moduleName}`)
        try {
          // Strip node: prefix if present
          const normalizedName = moduleName.startsWith("node:") ? moduleName.slice(5) : moduleName
          console.log(`[Worker] Normalized module name: ${normalizedName}`)

          // Get known exports for this module
          const knownExports = moduleExports[normalizedName] || []
          console.log(`[Worker] Known exports for ${normalizedName}:`, knownExports.length)

          // Generate named exports using 'var' (not 'const') to match main runtime pattern
          // Use direct property access (not optional chaining) for better QuickJS compatibility
          const namedExports = knownExports
            .map((name) => `export var ${name} = _mod.${name};`)
            .join("\n")

          // Return module code that exports the polyfilled module
          // The bootstrap code should have set up globalThis.__builtinModules
          // Use 'var' declarations and explicit error checking to match main runtime pattern
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
          // Return error wrapped in { error: ... } to match JSModuleLoadResult type
          return { error: err instanceof Error ? err : new Error(String(err)) }
        }
      })
    }

    postToMain({ type: "ready" })
  } catch (error) {
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
 * Strip shebang from source code (e.g., #!/usr/bin/env node)
 * QuickJS doesn't understand shebangs, so they must be removed.
 */
function stripShebang(source: string): string {
  if (source.startsWith("#!")) {
    const newlineIndex = source.indexOf("\n")
    if (newlineIndex !== -1) {
      return source.substring(newlineIndex + 1)
    }
    return "" // Entire file is just a shebang
  }
  return source
}

/**
 * Check if code appears to be an ES module (has import/export statements).
 * This helps QuickJS parse the code correctly.
 */
function isESModule(source: string): boolean {
  // Check for common ESM patterns at the start of lines
  // - import ... from
  // - import "..."
  // - export ...
  // - export default
  return /^\s*(import|export)\s/m.test(source)
}

/**
 * Execute pending jobs (promises, microtasks) in a loop.
 * This is how the main runtime handles async operations with sync QuickJS variants.
 *
 * @param ctx - The QuickJS context
 * @param maxIterations - Maximum number of iterations to prevent infinite loops
 * @returns True if any jobs were executed
 */
function executePendingJobsLoop(ctx: QuickJSContext, maxIterations: number = 1000): boolean {
  let hadJobs = false
  let iterations = 0
  let noJobIterations = 0
  const maxNoJobIterations = 10 // Stop after 10 iterations with no jobs

  while (iterations < maxIterations && noJobIterations < maxNoJobIterations) {
    const result = ctx.runtime.executePendingJobs()

    if (result.error) {
      // Log error but continue - some errors are recoverable
      const errorValue = ctx.dump(result.error)
      result.error.dispose()
      console.error("[Worker] Error in pending job:", errorValue)
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

  // Preprocess code: strip shebang
  const code = stripShebang(message.code)

  // Detect if this is an ES module
  const isModule = isESModule(code)

  // Debug: log code info
  console.log(
    `[Worker] evalCode called with ${code.length} bytes, filename: ${message.filename}, isModule: ${isModule}`,
  )
  console.log(`[Worker] Code preview (first 500 chars):`, code.slice(0, 500))

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
      // Evaluate the code with the appropriate type option
      // For ES modules, pass { type: 'module' } to enable import/export parsing
      const evalOptions = isModule ? { type: "module" as const } : undefined
      const result = context.evalCode(code, message.filename ?? "eval.js", evalOptions)

      // Check if cancelled during evaluation
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

      // Execute pending jobs (promises, async work) in a loop
      // This is critical for handling dynamic imports, promises, and other async operations
      // Match the main runtime's approach
      let iterations = 0
      const maxIterations = message.timeout ? Math.max(message.timeout / 10, 100) : 1000
      let noJobIterations = 0
      const maxNoJobIterations = 50 // Allow 50 iterations with no jobs before considering done

      while (iterations < maxIterations && noJobIterations < maxNoJobIterations) {
        // Check for cancellation
        if (cancelledTaskId === message.taskId) {
          cancelledTaskId = null
          result.value.dispose()
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

        // Check for timeout
        if (deadline && Date.now() > deadline) {
          result.value.dispose()
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

        const pendingResult = context.runtime.executePendingJobs()

        if (pendingResult.error) {
          // Log error but continue - some errors are recoverable
          const errorValue = context.dump(pendingResult.error)
          pendingResult.error.dispose()
          console.error("[Worker] Error in pending job:", errorValue)
          noJobIterations = 0
        } else if (pendingResult.value > 0) {
          noJobIterations = 0
        } else {
          noJobIterations++
        }

        iterations++

        // Give async operations a chance to queue more work
        await new Promise((resolve) => setTimeout(resolve, 10))
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
