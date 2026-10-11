# @veap/storage

## 0.1.1

### Patch Changes

- Fix native Node.js ESM module resolution, add IoC storage token, normalize local file URLs, and add comprehensive test coverage:
  - Fix missing `.js` extensions across all relative module imports/exports in `src/` and `tests/` ensuring full compliance with native Node.js ESM loaders (`ERR_MODULE_NOT_FOUND` resolution).
  - Add explicit subpath exports (`./providers/local`, `./types`) in `package.json`.
  - Export `STORAGE_SERVICE` DI injection token (`Token<IStorageService>`) and `IStorageService` interface in `src/types.ts`.
  - Register both `StorageService` and `STORAGE_SERVICE` alias token in `StorageServiceProvider`.
  - Add `storageService.getDefaultProviderId()` method to inspect the currently configured default storage driver.
  - Normalize uploaded file URLs in `LocalFileProvider` to always guarantee a leading slash (`/`), avoiding client-side workarounds.
  - Convert `LocalFileProvider` file operations (`mkdir`, `writeFile`, `unlink`) to asynchronous `fs.promises` to avoid blocking the Node.js event loop on file I/O.
  - Add comprehensive test suite in `tests/storage-service.test.ts` covering multi-provider management, fallback handling, IoC container binding, and automatic boot configuration (increasing test count from 4 to 9 passing tests).
- Updated dependencies []:
  - @veap/kernel@0.1.1

## 0.1.0

### Minor Changes

- Initial public scaffold of the Veap storage.
