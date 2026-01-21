# WasmFS Integration for quickjs-emscripten

## Overview

This document outlines the plan to add WasmFS with OPFS backend support to quickjs-emscripten, enabling native filesystem operations without JS boundary crossing.

## Current Architecture

```
QuickJS Code (fs.readFile)
       ↓
JS Bridge (host function call)
       ↓
VirtualFileSystem (@componentor/fs)
       ↓
OPFS (Browser API)
```

**Problem:** Every filesystem call crosses the Wasm↔JS boundary (~1-5ms overhead per call).

## Target Architecture

```
QuickJS Code (fs.readFile)
       ↓
WasmFS (compiled into Wasm module)
       ↓
OPFS Backend (direct access)
```

**Benefit:** Filesystem operations stay in Wasm, no JS boundary crossing.

---

## Implementation Steps

### Step 1: Modify Makefile to Enable WasmFS

In `packages/variant-quickjs-wasmfile-release-sync/Makefile`:

```makefile
# REMOVE this line:
# CFLAGS_WASM+=-s FILESYSTEM=0

# ADD these lines:
CFLAGS_WASM+=-sWASMFS
CFLAGS_WASM+=-sFORCE_FILESYSTEM
CFLAGS_WASM+=-sASYNCIFY  # Required for async OPFS operations
CFLAGS_WASM+=-sEXPORTED_RUNTIME_METHODS=['FS','OPFS']
```

### Step 2: Create WasmFS OPFS Mount Code

Create a new file `c/wasmfs-opfs.c`:

```c
#include <emscripten.h>
#include <emscripten/wasmfs.h>

// Mount OPFS at /opfs
EM_JS(void, mount_opfs, (), {
  // This runs after the module is initialized
  Module['mountOPFS'] = async function() {
    const opfsRoot = await navigator.storage.getDirectory();
    FS.mkdir('/opfs');
    FS.mount(OPFS, { root: opfsRoot }, '/opfs');
    console.log('[WasmFS] OPFS mounted at /opfs');
  };
});

// Initialize WasmFS with OPFS
void init_wasmfs_opfs() {
  mount_opfs();
}
```

### Step 3: Expose Filesystem Functions

Add to `c/interface.c`:

```c
// WasmFS operations for QuickJS
#ifdef __EMSCRIPTEN__
#include <sys/stat.h>
#include <dirent.h>
#include <fcntl.h>
#include <unistd.h>

char* QTS_ReadFile(const char* path, size_t* out_len) {
    int fd = open(path, O_RDONLY);
    if (fd < 0) return NULL;

    struct stat st;
    if (fstat(fd, &st) < 0) {
        close(fd);
        return NULL;
    }

    char* buffer = malloc(st.st_size + 1);
    if (!buffer) {
        close(fd);
        return NULL;
    }

    ssize_t n = read(fd, buffer, st.st_size);
    close(fd);

    if (n < 0) {
        free(buffer);
        return NULL;
    }

    buffer[n] = '\0';
    *out_len = n;
    return buffer;
}

int QTS_WriteFile(const char* path, const char* data, size_t len) {
    int fd = open(path, O_WRONLY | O_CREAT | O_TRUNC, 0644);
    if (fd < 0) return -1;

    ssize_t written = write(fd, data, len);
    close(fd);

    return (written == len) ? 0 : -1;
}

// ... more filesystem operations
#endif
```

### Step 4: Add TypeScript FFI Types

In `packages/quickjs-ffi-types/src/ffi-types.ts`:

```typescript
export interface WasmFSFFI {
  QTS_ReadFile(path: string): { data: Uint8Array | null; length: number }
  QTS_WriteFile(path: string, data: Uint8Array): number
  QTS_Stat(path: string): { isFile: boolean; isDirectory: boolean; size: number } | null
  QTS_Readdir(path: string): string[] | null
  QTS_Mkdir(path: string): number
  QTS_Unlink(path: string): number
  QTS_Rmdir(path: string): number
  // Mount OPFS - must be called before using filesystem
  mountOPFS(): Promise<void>
}
```

### Step 5: Create WasmFS Wrapper Class

New file `packages/quickjs-emscripten-core/src/wasmfs.ts`:

```typescript
export interface WasmFSOptions {
  mountPoint?: string // Default: '/opfs'
}

export class WasmFS {
  private module: EmscriptenModule
  private mounted = false

  constructor(module: EmscriptenModule) {
    this.module = module
  }

  async mount(options: WasmFSOptions = {}): Promise<void> {
    if (this.mounted) return

    const mountPoint = options.mountPoint ?? "/opfs"

    // Call the Emscripten-generated mount function
    await this.module.mountOPFS()

    this.mounted = true
  }

  readFile(path: string): Uint8Array {
    const result = this.module._QTS_ReadFile(path)
    if (!result.data) throw new Error(`Failed to read: ${path}`)
    return result.data
  }

  writeFile(path: string, data: Uint8Array): void {
    const result = this.module._QTS_WriteFile(path, data)
    if (result !== 0) throw new Error(`Failed to write: ${path}`)
  }

  // ... more methods
}
```

---

## File Watching for HMR

WasmFS doesn't have built-in file watching. We need a hybrid approach:

### Option A: JS Watcher Bridge (Recommended)

Keep using JS-side file watching, but use WasmFS for I/O:

```typescript
class HybridFS {
  private wasmfs: WasmFS
  private watcher: OPFSWatcher

  async writeFile(path: string, data: Uint8Array): Promise<void> {
    // Use WasmFS for the write (fast)
    this.wasmfs.writeFile(path, data)

    // Watcher will detect the change via OPFS
    // No manual notification needed - both access same OPFS storage
  }
}
```

**How it works:**

1. WasmFS writes to OPFS
2. Separate JS watcher monitors OPFS for changes
3. Changes trigger HMR notifications

### Option B: Polling (Fallback)

If OPFS watchers don't detect WasmFS changes:

```typescript
class PollingWatcher {
  private interval: number
  private lastMtimes = new Map<string, number>()

  start(paths: string[], callback: (path: string) => void) {
    this.interval = setInterval(() => {
      for (const path of paths) {
        const stat = wasmfs.stat(path)
        const lastMtime = this.lastMtimes.get(path)
        if (stat && stat.mtime !== lastMtime) {
          this.lastMtimes.set(path, stat.mtime)
          if (lastMtime !== undefined) {
            callback(path)
          }
        }
      }
    }, 100) // 100ms polling interval
  }
}
```

---

## Build Commands

### Create New Variant

```bash
# Create a new variant with WasmFS
mkdir -p packages/variant-quickjs-wasmfs-release-sync

# Copy base Makefile
cp packages/variant-quickjs-wasmfile-release-sync/Makefile \
   packages/variant-quickjs-wasmfs-release-sync/Makefile

# Modify Makefile to enable WasmFS (see Step 1)
```

### Build

```bash
# Install Emscripten SDK
./scripts/emcc.sh --version

# Build the WasmFS variant
cd packages/variant-quickjs-wasmfs-release-sync
make clean && make all
```

---

## Integration with WebContainer

### New Package Export

In `packages/quickjs-emscripten/src/index.ts`:

```typescript
export { WasmFS } from "./wasmfs"
export { newQuickJSWASMModuleWithWasmFS } from "./from-variant-wasmfs"
```

### Usage

```typescript
import { newQuickJSWASMModuleWithWasmFS, WasmFS } from "@componentor/quickjs-emscripten"

// Initialize QuickJS with WasmFS
const QuickJS = await newQuickJSWASMModuleWithWasmFS()

// Mount OPFS
const wasmfs = new WasmFS(QuickJS.module)
await wasmfs.mount()

// Now QuickJS code can access /opfs/* directly
const context = QuickJS.newContext()

// This fs.readFile runs entirely in Wasm!
context.evalCode(`
  const fs = require('fs');
  const content = fs.readFileSync('/opfs/project/package.json', 'utf-8');
  console.log(content);
`)
```

---

## Timeline Estimate

| Phase | Task                        | Complexity |
| ----- | --------------------------- | ---------- |
| 1     | Modify Makefile for WasmFS  | Low        |
| 2     | Add C filesystem functions  | Medium     |
| 3     | Build and test basic WasmFS | Medium     |
| 4     | Add OPFS mounting           | Medium     |
| 5     | Create TypeScript wrapper   | Low        |
| 6     | Implement file watching     | Medium     |
| 7     | Integration testing         | High       |

---

## Risks and Mitigations

### Risk 1: OPFS Watcher Compatibility

**Issue:** OPFS watchers might not detect WasmFS writes.
**Mitigation:** Test early. If fails, use polling or manual notifications.

### Risk 2: Asyncify Requirements

**Issue:** OPFS requires async operations, but QuickJS is sync.
**Mitigation:** Use Emscripten's ASYNCIFY to handle this.

### Risk 3: Browser Compatibility

**Issue:** WasmFS OPFS is relatively new.
**Mitigation:** Feature detection and fallback to JS bridge.

---

## Next Steps

1. [ ] Create `variant-quickjs-wasmfs-release-sync` package
2. [ ] Modify Makefile to enable WasmFS
3. [ ] Build and verify basic WasmFS works
4. [ ] Add OPFS mount functionality
5. [ ] Test file reading/writing
6. [ ] Implement HMR watcher integration
7. [ ] Create TypeScript API
8. [ ] Integration test with webcontainer

---

_Last Updated: January 2026_
