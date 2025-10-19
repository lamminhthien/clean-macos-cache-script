#!/usr/bin/env node

import chalk from 'chalk';
import boxen from 'boxen';
import {
  scanCaches,
  displayResults,
  selectCaches,
  confirmCleaning,
  cleanCaches
} from './utils';

/**
 * Main function - Entry point for the cache cleaner
 */
async function main(): Promise<void> {
  console.clear();

  // Display banner
  console.log(boxen(
    chalk.bold.cyan('🧹 macOS Cache Cleaner\n') +
    chalk.gray('Clean up cache directories and free disk space'),
    { padding: 1, margin: 1, borderStyle: 'double', borderColor: 'cyan' }
  ));

  // Check if running on macOS
  if (process.platform !== 'darwin') {
    console.log(chalk.red('❌ This tool is designed for macOS only!'));
    process.exit(1);
  }

  try {
    // Scan caches
    const caches = await scanCaches();

    if (caches.length === 0) {
      console.log(chalk.yellow('\n✨ No caches found to clean!'));
      process.exit(0);
    }

    // Display results
    displayResults(caches);

    // Select caches
    const selectedKeys = await selectCaches(caches);

    if (selectedKeys.length === 0) {
      console.log(chalk.yellow('\n👋 No caches selected. Exiting...'));
      process.exit(0);
    }

    // Confirm cleaning
    const confirmed = await confirmCleaning(caches, selectedKeys);

    if (!confirmed) {
      console.log(chalk.yellow('\n👋 Cleaning cancelled. Exiting...'));
      process.exit(0);
    }

    // Clean caches
    await cleanCaches(caches, selectedKeys);

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error(chalk.red(`\n❌ Error: ${errorMessage}`));
    process.exit(1);
  }
}

// Run main function
if (require.main === module) {
  main();
}

export { scanCaches, cleanCaches };
