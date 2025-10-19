import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { expandPath } from './path';

/**
 * Gets all matching paths for glob patterns
 * @param pattern - File path pattern (supports * wildcard and ~)
 * @returns Array of matching absolute paths
 */
export function getMatchingPaths(pattern: string): string[] {
  const expandedPattern = expandPath(pattern);

  // Check if pattern contains wildcards
  if (expandedPattern.includes('*')) {
    const dir = path.dirname(expandedPattern.replace(/\*/g, ''));
    const basePattern = path.basename(expandedPattern);

    try {
      if (!fs.existsSync(dir)) {
        return [];
      }

      const entries = fs.readdirSync(dir, { withFileTypes: true });
      const matches: string[] = [];

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (basePattern.includes('*')) {
          const regex = new RegExp('^' + basePattern.replace(/\*/g, '.*') + '$');
          if (regex.test(entry.name)) {
            // For Chrome profiles, find all Electron cache subdirectories
            if (entry.isDirectory() && expandedPattern.includes('Google/Chrome')) {
              const chromeCacheDirs = ['Cache', 'Code Cache', 'GPUCache', 'WebStorage', 'Service Worker'];
              for (const subDir of chromeCacheDirs) {
                const subPath = path.join(fullPath, subDir);
                if (fs.existsSync(subPath)) {
                  matches.push(subPath);
                }
              }
            } else {
              matches.push(fullPath);
            }
          }
        }
      }

      return matches;
    } catch (err) {
      return [];
    }
  }

  return [expandedPattern];
}

/**
 * Calculates directory size using the du command
 * @param dirPath - Path to the directory
 * @returns Size in bytes
 */
export function getDirectorySize(dirPath: string): number {
  try {
    if (!fs.existsSync(dirPath)) {
      return 0;
    }

    const stat = fs.statSync(dirPath);
    if (!stat.isDirectory()) {
      return stat.size;
    }

    // Use du command for accurate size calculation
    const result = execSync(`du -sk "${dirPath}" 2>/dev/null || echo "0"`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore']
    });
    const size = parseInt(result.split('\t')[0]) * 1024; // Convert KB to bytes
    return size || 0;
  } catch (err) {
    return 0;
  }
}
