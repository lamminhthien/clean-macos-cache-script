import inquirer from 'inquirer';
import chalk from 'chalk';
import { CacheResult, CacheChoice, CacheSelectionAnswer, ConfirmAnswer } from '../types';
import { formatBytes } from './format';

/**
 * Prompts user to select caches to clean
 * @param caches - Array of available caches
 * @returns Promise resolving to array of selected cache keys
 */
export async function selectCaches(caches: CacheResult[]): Promise<string[]> {
  const choices: CacheChoice[] = caches.map(cache => {
    let name = `${cache.name} (${formatBytes(cache.size)})`;
    if (cache.warning) {
      name += ` ${chalk.yellow('⚠️')}`;
    }
    if (cache.requiresSudo) {
      name += ` ${chalk.red('🔐')}`;
    }

    return {
      name,
      value: cache.key,
      checked: false
    };
  });

  const answers = await inquirer.prompt<CacheSelectionAnswer>([
    {
      type: 'checkbox',
      name: 'selected',
      message: 'Select caches to clean:',
      choices: [
        new inquirer.Separator('Use ↑↓ to move, Space to select, a to toggle all, Enter to confirm'),
        ...choices
      ],
      pageSize: 15
    }
  ]);

  return answers.selected;
}

/**
 * Shows warnings and prompts user to confirm cleaning operation
 * @param caches - Array of all caches
 * @param selectedKeys - Array of selected cache keys
 * @returns Promise resolving to true if user confirms, false otherwise
 */
export async function confirmCleaning(caches: CacheResult[], selectedKeys: string[]): Promise<boolean> {
  const selectedCaches = caches.filter(c => selectedKeys.includes(c.key));
  const warnings = selectedCaches.filter(c => c.warning);

  if (warnings.length > 0) {
    console.log(chalk.yellow('\n⚠️  Warnings:'));
    for (const cache of warnings) {
      console.log(chalk.yellow(`   ${cache.name}: ${cache.warning}`));
    }
  }

  const requiresSudo = selectedCaches.some(c => c.requiresSudo);
  if (requiresSudo) {
    console.log(chalk.red('\n🔐 Some operations require sudo privileges'));
  }

  const totalSize = selectedCaches.reduce((sum, c) => sum + c.size, 0);
  console.log(chalk.bold(`\nTotal size to be cleaned: ${chalk.green(formatBytes(totalSize))}\n`));

  const answer = await inquirer.prompt<ConfirmAnswer>([
    {
      type: 'confirm',
      name: 'confirm',
      message: 'Are you sure you want to proceed?',
      default: false
    }
  ]);

  return answer.confirm;
}
