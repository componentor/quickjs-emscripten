[**quickjs-emscripten**](../../README.md)

***

[quickjs-emscripten](../../packages.md) / @componentor/quickjs-singlefile-cjs-release-sync

# @componentor/quickjs-singlefile-cjs-release-sync

Variant with the WASM data embedded into a universal (Node and Browser compatible) CommonJS module.

This generated package is part of [quickjs-emscripten](https://github.com/componentor/quickjs-emscripten).
It contains a variant of the quickjs WASM library, and can be used with @componentor/quickjs-emscripten-core.

```typescript
import variant from "@componentor/quickjs-singlefile-cjs-release-sync"
import { newQuickJSWASMModuleFromVariant } from "@componentor/quickjs-emscripten-core"
const QuickJS = await newQuickJSWASMModuleFromVariant(variant)
```

This variant was built with the following settings:

## Library: quickjs

The original [bellard/quickjs](https://github.com/bellard/quickjs) library.

Version [2024-02-14+36911f0d](https://github.com/bellard/quickjs/commit/36911f0d3ab1a4c190a4d5cbe7c2db225a455389) vendored to quickjs-emscripten on 2024-06-15.

## Release mode: release

Optimized for performance; use when building/deploying your application.

## Exports: require

Exports the following in package.json for the package entrypoint:

- Exports a NodeJS-compatible CommonJS module, which is faster to load and run compared to an ESModule.

## Extra async magic? No

The default, normal build. Note that both variants support regular async functions.

## Single-file, or separate .wasm file? singlefile

The WASM runtime is included directly in the JS file. Use if you run into issues with missing .wasm files when building or deploying your app.

## More details

Full variant JSON description:

```json
{
  "library": "quickjs",
  "releaseMode": "release",
  "syncMode": "sync",
  "description": "Variant with the WASM data embedded into a universal (Node and Browser compatible) CommonJS module.",
  "emscriptenInclusion": "singlefile",
  "exports": {
    "require": {
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
  "-s SINGLE_FILE=1"
]
```

## Variables

### default

> `const` **default**: [`QuickJSSyncVariant`](../quickjs-emscripten/interfaces/QuickJSSyncVariant.md)

Defined in: [index.ts:18](https://github.com/componentor/quickjs-emscripten/blob/main/packages/variant-quickjs-singlefile-cjs-release-sync/src/index.ts#L18)

### @componentor/quickjs-singlefile-cjs-release-sync

[Docs](https://github.com/componentor/quickjs-emscripten/blob/main/doc/@componentor/quickjs-singlefile-cjs-release-sync/README.md) |
Variant with the WASM data embedded into a universal (Node and Browser compatible) CommonJS module.

| Variable            |    Setting                     |    Description    |
| --                  | --                             | --                |
| library             | quickjs             | The original [bellard/quickjs](https://github.com/bellard/quickjs) library. Version [2024-02-14+36911f0d](https://github.com/bellard/quickjs/commit/36911f0d3ab1a4c190a4d5cbe7c2db225a455389) vendored to quickjs-emscripten on 2024-06-15. |
| releaseMode         | release         | Optimized for performance; use when building/deploying your application. |
| syncMode            | sync            | The default, normal build. Note that both variants support regular async functions. |
| emscriptenInclusion | singlefile | The WASM runtime is included directly in the JS file. Use if you run into issues with missing .wasm files when building or deploying your app. |
| exports             | require                  | Has these package.json export conditions |
