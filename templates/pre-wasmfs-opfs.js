/**
 * WasmFS OPFS Integration
 *
 * This pre-js file adds OPFS mounting functionality to the QuickJS module.
 * It provides methods to mount the browser's Origin Private File System
 * as a WasmFS backend, enabling fast filesystem access without JS boundary crossing.
 *
 * IMPORTANT: OPFS directories must be mounted during module initialization.
 * The wasmfsOPFSGetOrCreateDir function must be called at the right time.
 */

// ============================================================================
// Automatic OPFS Mounting During Initialization
// All async work is done inside preRun with proper run dependency handling.
// ============================================================================

// Check if we're in a browser environment with OPFS
if (typeof navigator !== "undefined" && navigator.storage && navigator.storage.getDirectory) {
  // Debug monitoring
  Module["monitorRunDependencies"] = function (left) {
    console.log("[WasmFS] Run dependencies remaining:", left)
  }

  // preRun hook - called after Wasm is instantiated but before run()
  // ALL async work happens here with proper dependency management
  Module["preRun"] = Module["preRun"] || []
  Module["preRun"].push(function () {
    console.log("[WasmFS preRun] Starting OPFS mount process")

    // Check available methods
    console.log("[WasmFS preRun] Available methods:", {
      wasmfsOPFSGetOrCreateDir: typeof Module["wasmfsOPFSGetOrCreateDir"],
      addRunDependency: typeof Module["addRunDependency"],
      removeRunDependency: typeof Module["removeRunDependency"],
      FS: typeof Module["FS"],
    })

    if (typeof Module["wasmfsOPFSGetOrCreateDir"] !== "function") {
      console.log("[WasmFS preRun] wasmfsOPFSGetOrCreateDir not available, skipping mount")
      return
    }

    if (typeof Module["addRunDependency"] !== "function") {
      console.error("[WasmFS preRun] addRunDependency not available!")
      return
    }

    // Add run dependency FIRST to block execution
    Module["addRunDependency"]("opfs-mount")
    console.log("[WasmFS preRun] Added run dependency 'opfs-mount'")

    // List existing WasmFS directories to see what already exists
    try {
      var rootEntries = Module["FS"].readdir("/")
      console.log("[WasmFS preRun] Existing WasmFS root entries:", rootEntries)
    } catch (e) {
      console.log("[WasmFS preRun] Cannot list root (expected during early init):", e.message)
    }

    // Do all async work here
    ;(async function () {
      try {
        // Discover OPFS directories
        var opfsRoot = await navigator.storage.getDirectory()
        console.log("[WasmFS preRun] Got OPFS root")

        // TEST: Try mounting OPFS root at /opfs to see if the function works at all
        console.log("[WasmFS preRun] TEST: Mounting OPFS root at /opfs...")
        try {
          var testResult = await Module["wasmfsOPFSGetOrCreateDir"](opfsRoot, "/opfs")
          console.log("[WasmFS preRun] TEST: wasmfsOPFSGetOrCreateDir(/opfs) returned:", testResult)
          if (testResult === 0 || testResult === undefined) {
            console.log("[WasmFS preRun] TEST SUCCESS: Function works! Can mount at /opfs")
            // List what's in /opfs
            try {
              var opfsEntries = Module["FS"].readdir("/opfs")
              console.log("[WasmFS preRun] /opfs contents:", opfsEntries)
            } catch (e) {
              console.log("[WasmFS preRun] Cannot list /opfs:", e)
            }
          } else {
            console.error("[WasmFS preRun] TEST FAILED: Function returned error:", testResult)
          }
        } catch (testErr) {
          console.error("[WasmFS preRun] TEST FAILED: Function threw:", testErr)
        }

        var opfsDirs = []
        for await (var entry of opfsRoot.entries()) {
          var name = entry[0]
          var handle = entry[1]
          if (handle.kind === "directory") {
            opfsDirs.push({ name: name, handle: handle })
          }
        }

        console.log(
          "[WasmFS preRun] Found OPFS directories:",
          opfsDirs.map(function (d) {
            return d.name
          }),
        )

        if (opfsDirs.length === 0) {
          console.log("[WasmFS preRun] No OPFS directories to mount")
          return
        }

        // Skip system directories that WasmFS creates by default
        var skipDirs = ["dev", "tmp", "proc", "sys"]
        var mounted = []

        // Mount each OPFS directory
        for (var i = 0; i < opfsDirs.length; i++) {
          var dir = opfsDirs[i]

          if (skipDirs.indexOf(dir.name) !== -1) {
            console.log("[WasmFS preRun] Skipping system dir:", dir.name)
            continue
          }

          var wasmfsPath = "/" + dir.name
          console.log(
            "[WasmFS preRun] Mounting:",
            dir.name,
            "at",
            wasmfsPath,
            "handle:",
            dir.handle,
          )

          // Check if this path already exists in WasmFS (created during WasmFS init)
          var pathExists = false
          try {
            Module["FS"].stat(wasmfsPath)
            pathExists = true
            console.log(
              "[WasmFS preRun] Path",
              wasmfsPath,
              "already exists in WasmFS - will try to remove it first",
            )
          } catch (e) {
            console.log("[WasmFS preRun] Path", wasmfsPath, "does not exist in WasmFS yet - good")
          }

          // If path exists, try to remove it first (only if empty)
          if (pathExists) {
            try {
              var entries = Module["FS"].readdir(wasmfsPath)
              // Filter out . and ..
              entries = entries.filter(function (e) {
                return e !== "." && e !== ".."
              })
              if (entries.length === 0) {
                console.log("[WasmFS preRun] Removing empty WasmFS directory:", wasmfsPath)
                Module["FS"].rmdir(wasmfsPath)
                pathExists = false
              } else {
                console.warn(
                  "[WasmFS preRun] Cannot remove non-empty directory:",
                  wasmfsPath,
                  "contents:",
                  entries,
                )
              }
            } catch (rmErr) {
              console.warn("[WasmFS preRun] Failed to check/remove existing directory:", rmErr)
            }
          }

          try {
            // Call the Emscripten OPFS mounting function
            var result = await Module["wasmfsOPFSGetOrCreateDir"](dir.handle, wasmfsPath)
            console.log(
              "[WasmFS preRun] wasmfsOPFSGetOrCreateDir returned:",
              result,
              "for",
              wasmfsPath,
            )

            if (result === 0 || result === undefined) {
              mounted.push(wasmfsPath)
              console.log("[WasmFS preRun] Successfully mounted OPFS", dir.name, "at", wasmfsPath)
            } else {
              console.warn("[WasmFS preRun] Mount returned error code:", result, "for", dir.name)
              if (result === -29) {
                console.warn("[WasmFS preRun] Error -29: Path conflict or timing issue")
                // If path still exists, try mounting at /opfs/<name> instead
                if (pathExists) {
                  var altPath = "/opfs_" + dir.name
                  console.log("[WasmFS preRun] Trying alternative path:", altPath)
                  try {
                    var altResult = await Module["wasmfsOPFSGetOrCreateDir"](dir.handle, altPath)
                    console.log("[WasmFS preRun] Alternative mount returned:", altResult)
                    if (altResult === 0 || altResult === undefined) {
                      mounted.push(altPath)
                      Module["_opfsPathMapping"] = Module["_opfsPathMapping"] || {}
                      Module["_opfsPathMapping"]["/" + dir.name] = altPath
                      console.log(
                        "[WasmFS preRun] Mounted at alternative path:",
                        altPath,
                        "-> /" + dir.name,
                      )
                    }
                  } catch (altErr) {
                    console.error("[WasmFS preRun] Alternative mount failed:", altErr)
                  }
                }
              }
            }
          } catch (mountErr) {
            console.error("[WasmFS preRun] Mount threw error for", dir.name, ":", mountErr)
          }
        }

        // Store results
        if (mounted.length > 0) {
          Module["_opfsMounted"] = true
          Module["_opfsMountedPaths"] = mounted
          console.log("[WasmFS preRun] Successfully mounted paths:", mounted)
        } else {
          console.warn("[WasmFS preRun] No directories were mounted successfully")
        }

        // List root after mounting
        try {
          var rootAfter = Module["FS"].readdir("/")
          console.log("[WasmFS preRun] WasmFS root after mount:", rootAfter)
        } catch (e) {
          console.log("[WasmFS preRun] Cannot list root after mount:", e.message)
        }
      } catch (e) {
        console.error("[WasmFS preRun] OPFS mount process failed:", e)
      } finally {
        console.log("[WasmFS preRun] Removing run dependency 'opfs-mount'")
        Module["removeRunDependency"]("opfs-mount")
      }
    })()
  })
} else {
  console.log("[WasmFS] OPFS not available (not in browser or no storage API)")
}

// Add OPFS mounting function to Module (for manual mounting - may not work after init)
// mountPoint: where to mount in WasmFS (e.g., "/home")
// opfsPath: which OPFS directory to mount (e.g., "home" for OPFS's /home directory)
//           If not specified or "/", mounts each top-level OPFS directory
Module["mountOPFS"] = async function (mountPoint = "/opfs", opfsPath = null) {
  if (!navigator.storage || !navigator.storage.getDirectory) {
    throw new Error("OPFS is not supported in this browser")
  }

  // Get the OPFS root
  const opfsRoot = await navigator.storage.getDirectory()

  // Helper to mount a single OPFS directory at a WasmFS path
  async function mountSingleDir(opfsDir, wasmfsPath) {
    if (typeof Module["wasmfsOPFSGetOrCreateDir"] === "function") {
      try {
        await Module["wasmfsOPFSGetOrCreateDir"](opfsDir, wasmfsPath)
        return true
      } catch (e) {
        // Check if directory already exists
        try {
          const stat = Module["FS"].stat(wasmfsPath)
          if (stat && typeof stat.mode !== "undefined") {
            console.log("[WasmFS] Mount point already exists at", wasmfsPath)
            return true
          }
        } catch (statErr) {
          // Directory doesn't exist
        }
        throw e
      }
    } else if (Module["FS"] && Module["FS"].filesystems && Module["FS"].filesystems.OPFS) {
      try {
        Module["mkdir"](wasmfsPath)
      } catch (e) {
        if (e.code !== "EEXIST" && e.errno !== 20) {
          throw e
        }
      }
      Module["FS"].mount(Module["FS"].filesystems.OPFS, { root: opfsDir }, wasmfsPath)
      return true
    }
    return false
  }

  // If mounting at root ("/"), mount each top-level OPFS directory
  if (mountPoint === "/" && (opfsPath === null || opfsPath === "/" || opfsPath === "")) {
    const mounted = []
    for await (const [name, handle] of opfsRoot.entries()) {
      if (handle.kind === "directory") {
        const wasmfsPath = "/" + name
        try {
          // Skip directories that already exist in WasmFS (like /dev, /tmp)
          try {
            Module["FS"].stat(wasmfsPath)
            console.log("[WasmFS] Skipping existing directory:", wasmfsPath)
            continue
          } catch (e) {
            // Directory doesn't exist, we can mount
          }
          await mountSingleDir(handle, wasmfsPath)
          mounted.push(wasmfsPath)
          console.log("[WasmFS] Mounted OPFS", name, "at", wasmfsPath)
        } catch (e) {
          console.warn("[WasmFS] Failed to mount", name, ":", e.message)
        }
      }
    }
    console.log("[WasmFS] OPFS mounted directories:", mounted)
    return mounted.length > 0 ? "/" : null
  }

  // If opfsPath is specified, get that subdirectory from OPFS
  let opfsDir = opfsRoot
  if (opfsPath && opfsPath !== "/" && opfsPath !== "") {
    // Navigate to the specified OPFS subdirectory
    const parts = opfsPath.split("/").filter(Boolean)
    for (const part of parts) {
      opfsDir = await opfsDir.getDirectoryHandle(part, { create: true })
    }
  }

  // Mount the OPFS directory at the WasmFS mount point
  const success = await mountSingleDir(opfsDir, mountPoint)
  if (!success) {
    throw new Error("WasmFS OPFS backend not available. Ensure -lopfs.js is in build flags.")
  }

  console.log(
    "[WasmFS] OPFS mounted at",
    mountPoint,
    opfsPath ? "(OPFS path: " + opfsPath + ")" : "",
  )
  return mountPoint
}

// Add file watching support via polling (OPFS doesn't have native watch API in WasmFS)
Module["watchFiles"] = function (paths, callback, intervalMs = 100) {
  const mtimes = new Map()

  // Initialize mtimes
  for (const path of paths) {
    try {
      const stat = Module["FS"].stat(path)
      mtimes.set(path, stat.mtime.getTime())
    } catch (e) {
      // File doesn't exist yet
      mtimes.set(path, 0)
    }
  }

  // Start polling
  const intervalId = setInterval(() => {
    for (const path of paths) {
      try {
        const stat = Module["FS"].stat(path)
        const newMtime = stat.mtime.getTime()
        const oldMtime = mtimes.get(path)

        if (newMtime !== oldMtime) {
          mtimes.set(path, newMtime)
          if (oldMtime !== 0) {
            // File changed (not just first stat)
            callback(path, "change")
          }
        }
      } catch (e) {
        const oldMtime = mtimes.get(path)
        if (oldMtime !== 0) {
          // File was deleted
          mtimes.set(path, 0)
          callback(path, "delete")
        }
      }
    }
  }, intervalMs)

  // Return cleanup function
  return {
    close: function () {
      clearInterval(intervalId)
    },
    addPath: function (path) {
      if (!paths.includes(path)) {
        paths.push(path)
        try {
          const stat = Module["FS"].stat(path)
          mtimes.set(path, stat.mtime.getTime())
        } catch (e) {
          mtimes.set(path, 0)
        }
      }
    },
    removePath: function (path) {
      const idx = paths.indexOf(path)
      if (idx !== -1) {
        paths.splice(idx, 1)
        mtimes.delete(path)
      }
    },
  }
}

// Watch a directory recursively
Module["watchDirectory"] = function (dirPath, callback, intervalMs = 100) {
  const watchedFiles = new Map() // path -> mtime

  function scanDirectory(path) {
    const files = []
    try {
      // Use the Module-level readdir wrapper (handles minification)
      const entries = Module["readdir"](path)
      for (const entry of entries) {
        if (entry === "." || entry === "..") continue
        const fullPath = path + "/" + entry
        try {
          const stat = Module["FS"].stat(fullPath)
          if (stat.isDirectory()) {
            files.push(...scanDirectory(fullPath))
          } else {
            files.push({ path: fullPath, mtime: stat.mtime.getTime() })
          }
        } catch (e) {
          // Skip inaccessible files
        }
      }
    } catch (e) {
      // Directory doesn't exist or not accessible
    }
    return files
  }

  // Initial scan
  const initialFiles = scanDirectory(dirPath)
  for (const file of initialFiles) {
    watchedFiles.set(file.path, file.mtime)
  }

  // Start polling
  const intervalId = setInterval(() => {
    const currentFiles = scanDirectory(dirPath)
    const currentPaths = new Set()

    for (const file of currentFiles) {
      currentPaths.add(file.path)
      const oldMtime = watchedFiles.get(file.path)

      if (oldMtime === undefined) {
        // New file
        watchedFiles.set(file.path, file.mtime)
        callback(file.path, "add")
      } else if (file.mtime !== oldMtime) {
        // Changed file
        watchedFiles.set(file.path, file.mtime)
        callback(file.path, "change")
      }
    }

    // Check for deleted files
    for (const [path] of watchedFiles) {
      if (!currentPaths.has(path)) {
        watchedFiles.delete(path)
        callback(path, "delete")
      }
    }
  }, intervalMs)

  return {
    close: function () {
      clearInterval(intervalId)
    },
  }
}

// ============================================================================
// FS Wrapper Functions
// These wrappers provide a stable API on Module that calls FS methods directly.
// The closure-externs.js file ensures these FS method names are NOT minified.
// ============================================================================

// Read file as Uint8Array
Module["readFile"] = function (path) {
  return Module["FS"].readFile(path)
}

// Read file as string (convenience wrapper)
Module["readFileString"] = function (path) {
  var data = Module["FS"].readFile(path)
  return new TextDecoder().decode(data)
}

// Write Uint8Array to file
Module["writeFile"] = function (path, data) {
  Module["FS"].writeFile(path, data)
}

// Write string to file (convenience wrapper)
Module["writeFileString"] = function (path, content) {
  var data = new TextEncoder().encode(content)
  Module["FS"].writeFile(path, data)
}

// Read directory contents
Module["readdir"] = function (path) {
  return Module["FS"].readdir(path)
}

// Stat a file/directory
Module["stat"] = function (path) {
  return Module["FS"].stat(path)
}

// Create a directory
Module["mkdir"] = function (path) {
  return Module["FS"].mkdir(path)
}

// Remove a file
Module["unlink"] = function (path) {
  return Module["FS"].unlink(path)
}

// Remove a directory
Module["rmdir"] = function (path) {
  return Module["FS"].rmdir(path)
}

// Rename/move a file or directory
Module["rename"] = function (oldPath, newPath) {
  return Module["FS"].rename(oldPath, newPath)
}

// Check if path exists (returns true/false, doesn't throw)
Module["exists"] = function (path) {
  try {
    Module["FS"].stat(path)
    return true
  } catch (e) {
    return false
  }
}

// Sync OPFS to ensure all writes are persisted
Module["syncOPFS"] = async function () {
  var FS = Module["FS"]
  if (FS && typeof FS.syncfs === "function") {
    return new Promise(function (resolve, reject) {
      FS.syncfs(false, function (err) {
        if (err) reject(err)
        else resolve()
      })
    })
  }
}

// ============================================================================
// Export guard - prevents Closure Compiler from removing wrapper functions
// This creates references that Closure can't eliminate as dead code
// ============================================================================
Module["__wasmfs_exports__"] = {
  mountOPFS: Module["mountOPFS"],
  readFile: Module["readFile"],
  readFileString: Module["readFileString"],
  writeFile: Module["writeFile"],
  writeFileString: Module["writeFileString"],
  readdir: Module["readdir"],
  stat: Module["stat"],
  mkdir: Module["mkdir"],
  unlink: Module["unlink"],
  rmdir: Module["rmdir"],
  rename: Module["rename"],
  exists: Module["exists"],
  syncOPFS: Module["syncOPFS"],
  watchFiles: Module["watchFiles"],
  watchDirectory: Module["watchDirectory"],
}
