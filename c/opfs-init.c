/**
 * OPFS Initialization for WasmFS
 *
 * This file provides early initialization for mounting OPFS directories
 * using the wasmfs_before_preload() hook which runs during WasmFS startup.
 *
 * WasmFS + OPFS requires ASYNCIFY to be enabled because wasmfs_create_opfs_backend()
 * blocks while waiting for the OPFS dedicated worker thread to spawn.
 * Without ASYNCIFY, this causes a deadlock on the main thread.
 *
 * Usage: wasmfs_before_preload() is a WasmFS hook that allows creating backends
 * and mounting them before file preloading occurs.
 */

#ifdef QTS_WASMFS

#include <emscripten.h>
#include <emscripten/wasmfs.h>
#include <emscripten/console.h>
#include <stdio.h>
#include <errno.h>

/**
 * This hook is called by WasmFS during startup, before file preloading.
 *
 * We DON'T mount OPFS here because wasmfs_create_opfs_backend() connects to
 * the OPFS ROOT, not a specific subdirectory. If we mounted OPFS root at /home,
 * we'd get wrong path mappings:
 *   WasmFS /home/home/user → OPFS /home/user (wrong!)
 *
 * Instead, we let JavaScript use wasmfsOPFSGetOrCreateDir() which can mount
 * a specific OPFS subdirectory, giving us the correct 1-to-1 path mapping:
 *   WasmFS /home/user → OPFS /home/user (correct!)
 *
 * This hook just logs that WasmFS is ready for JS to do the mounting.
 */
void wasmfs_before_preload(void) {
    emscripten_console_log("[WasmFS] wasmfs_before_preload() called - WasmFS ready");
    emscripten_console_log("[WasmFS] OPFS mounting will be handled by JavaScript for correct path mapping");

    // Signal to JavaScript that WasmFS is initialized and ready for OPFS mounting
    EM_ASM({
        if (typeof Module !== 'undefined') {
            Module._wasmfsReady = true;
            Module._wasmfsOPFSMounted = false;  // JS will set to true after mounting
        }
    });
}

#endif /* QTS_WASMFS */
