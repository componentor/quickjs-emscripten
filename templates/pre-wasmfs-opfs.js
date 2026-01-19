/**
 * WasmFS OPFS Integration
 *
 * This pre-js file adds OPFS mounting functionality to the QuickJS module.
 * It provides methods to mount the browser's Origin Private File System
 * as a WasmFS backend, enabling fast filesystem access without JS boundary crossing.
 *
 * IMPORTANT: OPFS directories must be mounted during module initialization (preRun phase).
 * Calling wasmfsOPFSGetOrCreateDir after initialization returns error -29.
 */

// ============================================================================
// Automatic OPFS Mounting During Initialization
// This runs during preRun when wasmfsOPFSGetOrCreateDir actually works
// We use addRunDependency/removeRunDependency to make Emscripten wait for async ops
// ============================================================================
Module["preRun"] = Module["preRun"] || []
Module["preRun"].push(function () {
  if (typeof navigator === "undefined" || !navigator.storage || !navigator.storage.getDirectory) {
    console.log("[WasmFS] OPFS not available (not in browser or no storage API)")
    return
  }

  if (typeof Module["wasmfsOPFSGetOrCreateDir"] !== "function") {
    console.log("[WasmFS] wasmfsOPFSGetOrCreateDir not available")
    return
  }

  // Add a run dependency to block module execution until OPFS mounting completes
  Module["addRunDependency"]("opfs-mount")

  async function mountOPFSDirectories() {
    try {
      var opfsRoot = await navigator.storage.getDirectory()
      var mounted = []

      // Mount each top-level OPFS directory at matching WasmFS paths (1-to-1 mapping)
      // e.g., OPFS "home" -> WasmFS "/home", OPFS "usr" -> WasmFS "/usr"
      for await (var entry of opfsRoot.entries()) {
        var name = entry[0]
        var handle = entry[1]
        if (handle.kind === "directory") {
          var wasmfsPath = "/" + name
          try {
            // Check if this path already exists in WasmFS (skip /dev, /tmp, etc.)
            try {
              Module["FS"].stat(wasmfsPath)
              console.log("[WasmFS preRun] Skipping existing:", wasmfsPath)
              continue
            } catch (e) {
              // Doesn't exist, we can mount
            }

            var result = await Module["wasmfsOPFSGetOrCreateDir"](handle, wasmfsPath)
            if (result === 0 || result === undefined) {
              mounted.push(wasmfsPath)
              console.log("[WasmFS preRun] Mounted OPFS", name, "at", wasmfsPath)
            } else {
              console.warn("[WasmFS preRun] Failed to mount", name, "error code:", result)
            }
          } catch (e) {
            console.warn("[WasmFS preRun] Error mounting", name, ":", e.message)
          }
        }
      }

      if (mounted.length > 0) {
        console.log("[WasmFS preRun] Successfully mounted:", mounted)
        Module["_opfsMounted"] = true
        Module["_opfsMountedPaths"] = mounted
      }
    } catch (e) {
      console.error("[WasmFS preRun] OPFS initialization failed:", e)
    } finally {
      // Remove the run dependency to allow module execution to continue
      Module["removeRunDependency"]("opfs-mount")
    }
  }

  mountOPFSDirectories()
})

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
