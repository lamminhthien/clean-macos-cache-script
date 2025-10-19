import chalk from 'chalk';
import Table from 'cli-table3';
import boxen from 'boxen';
import { CacheResult } from '../types';
import { formatBytes } from './format';

/**
 * Displays cache scan results in a formatted table
 * @param caches - Array of cache results to display
 */
export function displayResults(caches: CacheResult[]): void {
  const table = new Table({
    head: [chalk.cyan('Category'), chalk.cyan('Size'), chalk.cyan('Status')],
    colWidths: [40, 15, 20]
  });

  let totalSize = 0;

  for (const cache of caches) {
    totalSize += cache.size;
    const statusInfo: string[] = [];

    if (cache.requiresSudo) {
      statusInfo.push(chalk.yellow('Needs sudo'));
    }
    if (cache.warning) {
      statusInfo.push(chalk.red('⚠️'));
    }
    if (cache.command) {
      statusInfo.push(chalk.blue('Command'));
    }

    table.push([
      cache.name,
      chalk.green(formatBytes(cache.size)),
      statusInfo.join(' ') || chalk.gray('Ready')
    ]);
  }

  console.log('\n' + table.toString());
  console.log(boxen(
    chalk.bold.green(`Total Cache Size: ${formatBytes(totalSize)}`),
    { padding: 1, margin: 1, borderStyle: 'round', borderColor: 'green' }
  ));
}
