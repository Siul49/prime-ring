# Technical Improvements

This document outlines identified technical debts and proposed improvements for the PrimeRing project.

## 1. Asynchronous I/O in Electron Main Process
**Current State**: The `save-file` IPC handler in `electron/main.ts` uses `fs.writeFileSync`, which is a synchronous operation.
**Problem**: Synchronous I/O blocks the Electron main process event loop. In a desktop application, this can lead to temporary UI freezes or unresponsiveness during data saving, especially as the data size grows.
**Proposed Improvement**: Convert `fs.writeFileSync` to `fs.promises.writeFile` to perform non-blocking asynchronous I/O.

## 2. Schema Validation for Local Data
**Current State**: Data loaded from local JSON files (e.g., `diaries.json`, `events.json`) is parsed using `JSON.parse` and cast to types in `DiaryService.ts` and `EventService.ts`.
**Problem**: Local files can be manually edited or corrupted. Relying solely on type casting doesn't guarantee data integrity at runtime, which can lead to application crashes or unexpected behavior.
**Proposed Improvement**: Integrate a schema validation library (such as **Zod**, which is currently a transitive dependency) to explicitly validate the structure and content of loaded data before it's used in the application state.

## 3. Removal of Deprecated Firebase Dependencies
**Current State**: The project has migrated to a local-first architecture using WebLLM and local JSON files, but `firebase` remains in `package.json` and `src/lib/firebase/config.ts` still exists.
**Problem**: Unused dependencies increase the bundle size and maintenance overhead. They can also cause confusion for new developers.
**Proposed Improvement**: Remove the `firebase` package from `package.json` and delete the deprecated configuration files and any remaining unused Firebase service calls.
