import * as path from 'path';
import * as os from 'os';

/**
 * Expands tilde (~) in file paths to the user's home directory
 * @param filePath - Path that may contain ~
 * @returns Expanded absolute path
 */
export function expandPath(filePath: string): string {
  if (filePath.startsWith('~/')) {
    return path.join(os.homedir(), filePath.slice(2));
  }
  return filePath;
}
