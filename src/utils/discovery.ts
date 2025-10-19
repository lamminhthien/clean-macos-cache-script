import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { CacheCategories } from '../types';
import { CACHE_CATEGORIES } from '../constants';
import { expandPath } from './path';
import { isElectronApp, getElectronCachePaths } from './electron';

/**
 * Auto-discovers Electron apps in Application Support directory
 * @returns Object containing discovered Electron app cache categories
 */
export function discoverElectronApps(): CacheCategories {
  const appSupportPath = path.join(os.homedir(), 'Library/Application Support');
  const electronApps: CacheCategories = {};

  try {
    if (!fs.existsSync(appSupportPath)) {
      return electronApps;
    }

    const entries = fs.readdirSync(appSupportPath, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const appPath = path.join(appSupportPath, entry.name);

        // Skip apps that are already explicitly defined in CACHE_CATEGORIES
        const alreadyDefined = Object.values(CACHE_CATEGORIES).some(category =>
          category.paths.some(p => expandPath(p).includes(entry.name))
        );

        if (!alreadyDefined && isElectronApp(appPath)) {
          const cachePaths = getElectronCachePaths(appPath);

          if (cachePaths.length > 0) {
            // Create a sanitized key from the app name
            const key = entry.name.toLowerCase().replace(/[^a-z0-9]/g, '');

            electronApps[key] = {
              name: `⚡ ${entry.name}`,
              paths: cachePaths,
              requiresSudo: false,
              warning: null,
              isAutoDiscovered: true
            };
          }
        }
      }
    }
  } catch (err) {
    // Silently fail if we can't read the directory
  }

  return electronApps;
}
