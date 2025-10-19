/**
 * Common cache subdirectories found in Electron-based applications
 */
export const ELECTRON_CACHE_DIRS: ReadonlyArray<string> = [
  'Cache',
  'Code Cache',
  'GPUCache',
  'WebStorage',
  'Service Worker',
  'IndexedDB',
  'blob_storage',
  'Session Storage',
  'databases',
  'Local Storage'
] as const;
