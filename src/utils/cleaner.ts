import { execSync } from 'child_process';
import * as fs from 'fs';
import ora from 'ora';
import chalk from 'chalk';
import boxen from 'boxen';
import { CacheResult } from '../types';
import { formatBytes } from './format';

/**
 * Cleans selected caches
 * @param caches - Array of all caches
 * @param selectedKeys - Array of selected cache keys to clean
 */
export async function cleanCaches(caches: CacheResult[], selectedKeys: string[]): Promise<void> {
  const selectedCaches = caches.filter(c => selectedKeys.includes(c.key));
  let totalCleaned = 0;
  let successCount = 0;
  let failCount = 0;

  for (const cache of selectedCaches) {
    const spinner = ora(`Cleaning ${cache.name}...`).start();

    try {
      // Execute command if specified
      if (cache.command) {
        try {
          execSync(cache.command, { stdio: 'ignore' });
          spinner.succeed(chalk.green(`✓ ${cache.name} - command executed`));
          successCount++;
        } catch (err) {
          spinner.fail(chalk.red(`✗ ${cache.name} - command failed`));
          failCount++;
        }
        continue;
      }

      // Clean directories
      let cleaned = false;
      for (const dirPath of cache.paths) {
        if (fs.existsSync(dirPath)) {
          const sizeBeforeClean = cache.size;

          if (cache.requiresSudo) {
            try {
              execSync(`sudo rm -rf "${dirPath}"`, { stdio: 'ignore' });
              cleaned = true;
            } catch (err) {
              spinner.fail(chalk.red(`✗ ${cache.name} - permission denied or error`));
              failCount++;
              break;
            }
          } else {
            try {
              fs.rmSync(dirPath, { recursive: true, force: true });
              cleaned = true;
            } catch (err) {
              const errorMessage = err instanceof Error ? err.message : 'Unknown error';
              spinner.fail(chalk.red(`✗ ${cache.name} - error: ${errorMessage}`));
              failCount++;
              break;
            }
          }

          if (cleaned) {
            totalCleaned += sizeBeforeClean;
          }
        }
      }

      if (cleaned) {
        spinner.succeed(chalk.green(`✓ ${cache.name} - ${formatBytes(cache.size)} cleaned`));
        successCount++;
      } else if (failCount === 0) {
        spinner.info(chalk.gray(`${cache.name} - no files to clean`));
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      spinner.fail(chalk.red(`✗ ${cache.name} - error: ${errorMessage}`));
      failCount++;
    }
  }

  console.log('\n' + boxen(
    chalk.bold.green(`Cleaning Complete!\n\n`) +
    chalk.green(`✓ Success: ${successCount}\n`) +
    (failCount > 0 ? chalk.red(`✗ Failed: ${failCount}\n`) : '') +
    chalk.bold.cyan(`Total cleaned: ${formatBytes(totalCleaned)}`),
    { padding: 1, margin: 1, borderStyle: 'round', borderColor: 'green' }
  ));
}
