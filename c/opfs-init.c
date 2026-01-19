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
 * We use it to create the OPFS backend and mount it at /home.
 *
 * The path /home is chosen to match the @componentor/fs OPFS storage location,
 * allowing both WasmFS and @componentor/fs to access the same OPFS files.
 */
void wasmfs_before_preload(void) {
    int err;

    emscripten_console_log("[WasmFS] wasmfs_before_preload() called - creating OPFS backend");

    // Create the OPFS backend
    // This may block waiting for the OPFS worker to spawn, which is why ASYNCIFY is required
    backend_t opfs = wasmfs_create_opfs_backend();
    if (opfs == NULL) {
        emscripten_console_error("[WasmFS] ERROR: Failed to create OPFS backend");
        return;
    }
    emscripten_console_log("[WasmFS] OPFS backend created successfully");

    // Mount the OPFS backend at /home
    // This creates a directory at /home backed by OPFS storage
    err = wasmfs_create_directory("/home", 0777, opfs);
    if (err != 0) {
        char msg[128];
        snprintf(msg, sizeof(msg), "[WasmFS] ERROR: Failed to mount OPFS at /home, error: %d (errno: %d)", err, errno);
        emscripten_console_error(msg);
        return;
    }
    emscripten_console_log("[WasmFS] OPFS mounted at /home successfully");

    // Signal success to JavaScript
    EM_ASM({
        if (typeof Module !== 'undefined') {
            Module._wasmfsOPFSMounted = true;
            Module._wasmfsOPFSMountPath = '/home';
        }
    });
}

#endif /* QTS_WASMFS */
