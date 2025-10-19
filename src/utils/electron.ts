import * as fs from 'fs';
import * as path from 'path';
import { ELECTRON_CACHE_DIRS } from '../constants';

/**
 * Checks if a directory is an Electron app by looking for Electron cache patterns
 * @param appPath - Path to the application directory
 * @returns True if the directory appears to be an Electron app
 */
export function isElectronApp(appPath: string): boolean {
  try {
    if (!fs.existsSync(appPath) || !fs.statSync(appPath).isDirectory()) {
      return false;
    }

    // Check for at least one common Electron cache directory
    const hasElectronCache = ELECTRON_CACHE_DIRS.some(cacheDir => {
      const cachePath = path.join(appPath, cacheDir);
      return fs.existsSync(cachePath);
    });

    return hasElectronCache;
  } catch (err) {
    return false;
  }
}

/**
 * Gets all Electron cache paths for a given app directory
 * @param appPath - Path to the application directory
 * @returns Array of found cache directory paths
 */
export function getElectronCachePaths(appPath: string): string[] {
  const cachePaths: string[] = [];

  for (const cacheDir of ELECTRON_CACHE_DIRS) {
    const cachePath = path.join(appPath, cacheDir);
    if (fs.existsSync(cachePath)) {
      cachePaths.push(cachePath);
    }
  }

  return cachePaths;
}
