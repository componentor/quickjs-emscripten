[**quickjs-emscripten**](../../README.md)

***

[quickjs-emscripten](../../packages.md) / @componentor/quickjs-asmjs-mjs-release-sync

# @componentor/quickjs-asmjs-mjs-release-sync

Compiled to pure Javascript, no WebAssembly required.

This generated package is part of [quickjs-emscripten](https://github.com/componentor/quickjs-emscripten).
It contains a variant of the quickjs WASM library, and can be used with @componentor/quickjs-emscripten-core.

```typescript
import variant from "@componentor/quickjs-asmjs-mjs-release-sync"
import { newQuickJSWASMModuleFromVariant } from "@componentor/quickjs-emscripten-core"
const QuickJS = await newQuickJSWASMModuleFromVariant(variant)
```

This variant was built with the following settings:

## Library: quickjs

The original [bellard/quickjs](https://github.com/bellard/quickjs) library.

Version [2024-02-14+36911f0d](https://github.com/bellard/quickjs/commit/36911f0d3ab1a4c190a4d5cbe7c2db225a455389) vendored to quickjs-emscripten on 2024-06-15.

## Release mode: release

Optimized for performance; use when building/deploying your application.

## Exports: import

Exports the following in package.json for the package entrypoint:

- Exports a NodeJS-compatible ESModule. Cannot be imported synchronously from a NodeJS CommonJS module.

## Extra async magic? No

The default, normal build. Note that both variants support regular async functions.

## Single-file, or separate .wasm file? asmjs

The C library code is compiled to Javascript, no WebAssembly used. Sometimes called "asmjs". This is the slowest possible option, and is intended for constrained environments that do not support WebAssembly, like quickjs-for-quickjs.

## More details

Full variant JSON description:

```json
{
  "library": "quickjs",
  "releaseMode": "release",
  "syncMode": "sync",
  "description": "Compiled to pure Javascript, no WebAssembly required.",
  "emscriptenInclusion": "asmjs",
  "exports": {
    "import": {
      "emscriptenEnvironment": ["web", "worker", "node"]
    }
  }
}
```

Variant-specific Emscripten build flags:

```json
[
  "-Oz",
  "-flto",
  "--closure 1",
  "-s FILESYSTEM=0",
  "--pre-js $(TEMPLATES)/pre-extension.js",
  "--pre-js $(TEMPLATES)/pre-wasmMemory.js",
  "-s WASM=0",
  "-s SINGLE_FILE=1"
]
```

## Variables

### default

> `const` **default**: [`QuickJSSyncVariant`](../quickjs-emscripten/interfaces/QuickJSSyncVariant.md)

Defined in: [index.ts:19](https://github.com/componentor/quickjs-emscripten/blob/main/packages/variant-quickjs-asmjs-mjs-release-sync/src/index.ts#L19)

### @componentor/quickjs-asmjs-mjs-release-sync

[Docs](https://github.com/componentor/quickjs-emscripten/blob/main/doc/@componentor/quickjs-asmjs-mjs-release-sync/README.md) |
Compiled to pure Javascript, no WebAssembly required.

| Variable            |    Setting                     |    Description    |
| --                  | --                             | --                |
| library             | quickjs             | The original [bellard/quickjs](https://github.com/bellard/quickjs) library. Version [2024-02-14+36911f0d](https://github.com/bellard/quickjs/commit/36911f0d3ab1a4c190a4d5cbe7c2db225a455389) vendored to quickjs-emscripten on 2024-06-15. |
| releaseMode         | release         | Optimized for performance; use when building/deploying your application. |
| syncMode            | sync            | The default, normal build. Note that both variants support regular async functions. |
| emscriptenInclusion | asmjs | The C library code is compiled to Javascript, no WebAssembly used. Sometimes called "asmjs". This is the slowest possible option, and is intended for constrained environments that do not support WebAssembly, like quickjs-for-quickjs. |
| exports             | import                  | Has these package.json export conditions |
