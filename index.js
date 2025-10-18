#!/usr/bin/env node

const chalk = require('chalk');
const boxen = require('boxen');
const {
  scanCaches,
  displayResults,
  selectCaches,
  confirmCleaning,
  cleanCaches
} = require('./utils');

// Main function
async function main() {
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
    console.error(chalk.red(`\n❌ Error: ${err.message}`));
    process.exit(1);
  }
}

// Run main function
if (require.main === module) {
  main();
}

module.exports = { scanCaches, cleanCaches };
