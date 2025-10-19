import ora from 'ora';
import { CacheResult } from '../types';
import { CACHE_CATEGORIES } from '../constants';
import { discoverElectronApps } from './discovery';
import { getMatchingPaths, getDirectorySize } from './filesystem';

/**
 * Scans all cache categories and returns results sorted by size
 * @returns Promise resolving to array of cache results
 */
export async function scanCaches(): Promise<CacheResult[]> {
  const spinner = ora('Scanning cache directories...').start();
  const results: CacheResult[] = [];

  // Discover Electron apps automatically
  spinner.text = 'Discovering Electron apps...';
  const discoveredElectronApps = discoverElectronApps();

  // Merge discovered apps with predefined categories
  const allCategories = { ...CACHE_CATEGORIES, ...discoveredElectronApps };

  spinner.text = 'Scanning cache directories...';

  for (const [key, category] of Object.entries(allCategories)) {
    let totalSize = 0;
    const foundPaths: string[] = [];

    // For auto-discovered apps, paths are already resolved
    if (category.isAutoDiscovered) {
      for (const dirPath of category.paths) {
        const size = getDirectorySize(dirPath);
        if (size > 0) {
          totalSize += size;
          foundPaths.push(dirPath);
        }
      }
    } else {
      // Original logic for predefined categories
      for (const pathPattern of category.paths) {
        const matchingPaths = getMatchingPaths(pathPattern);

        for (const matchedPath of matchingPaths) {
          const size = getDirectorySize(matchedPath);
          if (size > 0) {
            totalSize += size;
            foundPaths.push(matchedPath);
          }
        }
      }
    }

    if (totalSize > 0 || category.command) {
      results.push({
        key,
        name: category.name,
        size: totalSize,
        paths: foundPaths,
        requiresSudo: category.requiresSudo,
        warning: category.warning,
        command: category.command,
        isAutoDiscovered: category.isAutoDiscovered || false
      });
    }
  }

  spinner.succeed('Scan completed!');
  return results.sort((a, b) => b.size - a.size);
}
