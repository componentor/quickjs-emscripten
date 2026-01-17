[**quickjs-emscripten**](../../../README.md)

***

[quickjs-emscripten](../../../packages.md) / [@componentor/quickjs-emscripten-core](../README.md) / JSModuleNormalizer

# Interface: JSModuleNormalizer()

Defined in: [packages/quickjs-emscripten-core/src/types.ts:107](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-emscripten-core/src/types.ts#L107)

## Extends

- [`JSModuleNormalizerAsync`](JSModuleNormalizerAsync.md)

## Call Signature

> **JSModuleNormalizer**(`baseModuleName`, `requestedName`, `vm`): [`JSModuleNormalizeResult`](../README.md#jsmodulenormalizeresult)

Defined in: [packages/quickjs-emscripten-core/src/types.ts:108](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-emscripten-core/src/types.ts#L108)

### Parameters

#### baseModuleName

`string`

#### requestedName

`string`

#### vm

[`QuickJSContext`](../classes/QuickJSContext.md)

### Returns

[`JSModuleNormalizeResult`](../README.md#jsmodulenormalizeresult)

## Call Signature

> **JSModuleNormalizer**(`baseModuleName`, `requestedName`, `vm`): [`JSModuleNormalizeResult`](../README.md#jsmodulenormalizeresult) \| `Promise`\<[`JSModuleNormalizeResult`](../README.md#jsmodulenormalizeresult)\>

Defined in: [packages/quickjs-emscripten-core/src/types.ts:107](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-emscripten-core/src/types.ts#L107)

### Parameters

#### baseModuleName

`string`

#### requestedName

`string`

#### vm

[`QuickJSAsyncContext`](../classes/QuickJSAsyncContext.md)

### Returns

[`JSModuleNormalizeResult`](../README.md#jsmodulenormalizeresult) \| `Promise`\<[`JSModuleNormalizeResult`](../README.md#jsmodulenormalizeresult)\>
