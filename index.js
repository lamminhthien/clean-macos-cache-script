#!/usr/bin/env node

const { execSync, exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const chalk = require('chalk');
const inquirer = require('inquirer');
const ora = require('ora');
const Table = require('cli-table3');
const boxen = require('boxen');

// Cache categories configuration
const CACHE_CATEGORIES = {
  yarn: {
    name: '🧶 Yarn Cache',
    paths: ['~/Library/Caches/Yarn/v6'],
    requiresSudo: false,
    warning: null
  },
  chrome: {
    name: '🌐 Chrome Cache',
    paths: [
      '~/Library/Caches/Google/Chrome/*/Cache',
      '~/Library/Caches/Google/Chrome/*/Code Cache',
      '~/Library/Application Support/Google/Chrome/*/WebStorage',
      '~/Library/Application Support/Google/Chrome/*/Service Worker'
    ],
    requiresSudo: false,
    warning: null
  },
  googleUpdater: {
    name: '🔄 Google Updater',
    paths: ['~/Library/Application Support/Google/GoogleUpdater'],
    requiresSudo: false,
    warning: null
  },
  cocoapods: {
    name: '📦 CocoaPods Cache',
    paths: ['~/Library/Caches/CocoaPods/Pods'],
    requiresSudo: false,
    warning: null
  },
  homebrew: {
    name: '🍺 Homebrew Cache',
    paths: ['~/Library/Caches/Homebrew/downloads'],
    requiresSudo: false,
    warning: null,
    command: 'brew cleanup'
  },
  vscode: {
    name: '💻 VSCode Cache',
    paths: [
      '~/Library/Application Support/Code/Cache',
      '~/Library/Application Support/Code/WebStorage',
      '~/Library/Application Support/Code/CachedData',
      '~/Library/Application Support/Code - Insiders/Cache',
      '~/Library/Application Support/Code - Insiders/WebStorage',
      '~/Library/Application Support/Code - Insiders/CachedData'
    ],
    requiresSudo: false,
    warning: null
  },
  krisp: {
    name: '🎤 Krisp Cache',
    paths: [
      '~/Library/Application Support/krisp/update',
      '~/Library/Application Support/krisp/Code Cache',
      '~/Library/Application Support/krisp/Cache',
      '~/Library/Application Support/krisp/GPUCache',
      '~/Library/Application Support/krisp/logs'
    ],
    requiresSudo: false,
    warning: null
  },
  warp: {
    name: '⚡ Warp Terminal Cache',
    paths: ['~/Library/Application Support/dev.warp.Warp-Stable/autoupdate'],
    requiresSudo: false,
    warning: null
  },
  teams: {
    name: '📞 Microsoft Teams Cache',
    paths: [
      '~/Library/Containers/com.microsoft.teams2/Data/Library/Caches',
      '~/Library/Containers/com.microsoft.teams2/Data/Library/Application Support/Microsoft/MSTeams/EBWebView/WV2Profile_tfw/Service Worker',
      '~/Library/Containers/com.microsoft.teams2/Data/Library/Application Support/Microsoft/MSTeams/EBWebView/WV2Profile_tfw/Session Storage',
      '~/Library/Containers/com.microsoft.teams2/Data/Library/Application Support/Microsoft/MSTeams/EBWebView/WV2Profile_tfw/WebStorage',
      '~/Library/Group Containers/UBF8T346G9.com.microsoft.teams/Library/Application Support/Logs'
    ],
    requiresSudo: false,
    warning: null
  },
  xcode: {
    name: '🔨 Xcode Cache',
    paths: [
      '~/Library/Developer/Xcode/DerivedData',
      '~/Library/Developer/Xcode/UserData'
    ],
    requiresSudo: false,
    warning: null
  },
  gradle: {
    name: '🐘 Gradle Cache',
    paths: ['~/.gradle'],
    requiresSudo: false,
    warning: '⚠️  Cleaning this will require re-installing modules for mobile projects (first build will be slower)'
  },
  userCache: {
    name: '📁 User Cache Directory',
    paths: ['~/.cache'],
    requiresSudo: false,
    warning: null
  },
  mediaAnalysis: {
    name: '🎬 Media Analysis Cache',
    paths: ['~/Library/Containers/com.apple.mediaanalysisd/Data/Library/Caches/com.apple.mediaanalysisd/com.apple.e5rt.e5bundlecache'],
    requiresSudo: false,
    warning: null
  },
  systemTemp: {
    name: '🗑️  System Temp',
    paths: ['/private/var/tmp'],
    requiresSudo: true,
    warning: '⚠️  Requires sudo - cleaning system-level temporary files'
  },
  simulator: {
    name: '📱 iOS Simulator Cache',
    paths: ['/Library/Developer/CoreSimulator/Caches'],
    requiresSudo: true,
    warning: '⚠️  Requires sudo'
  },
  systemLogs: {
    name: '📝 System Logs',
    paths: ['/Library/Logs'],
    requiresSudo: true,
    warning: '⚠️  Requires sudo - cleaning system-level logs'
  },
  npm: {
    name: '📦 NPM Cache',
    paths: [],
    requiresSudo: false,
    warning: null,
    command: 'npm cache clean --force'
  },
  pnpm: {
    name: '📦 PNPM Store',
    paths: [],
    requiresSudo: false,
    warning: null,
    command: 'pnpm store prune'
  }
};

// Utility function to expand home directory
function expandPath(filePath) {
  if (filePath.startsWith('~/')) {
    return path.join(os.homedir(), filePath.slice(2));
  }
  return filePath;
}

// Get all matching paths for glob patterns
function getMatchingPaths(pattern) {
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
      const matches = [];

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (basePattern.includes('*')) {
          const regex = new RegExp('^' + basePattern.replace(/\*/g, '.*') + '$');
          if (regex.test(entry.name)) {
            // For Chrome profiles, find Cache and Code Cache subdirectories
            if (entry.isDirectory() && expandedPattern.includes('Google/Chrome')) {
              const subDirs = ['Cache', 'Code Cache', 'WebStorage', 'Service Worker'];
              for (const subDir of subDirs) {
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

// Calculate directory size
function getDirectorySize(dirPath) {
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

// Format bytes to human readable
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Scan all cache categories
async function scanCaches() {
  const spinner = ora('Scanning cache directories...').start();
  const results = [];

  for (const [key, category] of Object.entries(CACHE_CATEGORIES)) {
    let totalSize = 0;
    const foundPaths = [];

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

    if (totalSize > 0 || category.command) {
      results.push({
        key,
        name: category.name,
        size: totalSize,
        paths: foundPaths,
        requiresSudo: category.requiresSudo,
        warning: category.warning,
        command: category.command
      });
    }
  }

  spinner.succeed('Scan completed!');
  return results.sort((a, b) => b.size - a.size);
}

// Display results in a table
function displayResults(caches) {
  const table = new Table({
    head: [chalk.cyan('Category'), chalk.cyan('Size'), chalk.cyan('Status')],
    colWidths: [40, 15, 20]
  });

  let totalSize = 0;

  for (const cache of caches) {
    totalSize += cache.size;
    const statusInfo = [];

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

// Select caches to clean
async function selectCaches(caches) {
  const choices = caches.map(cache => {
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

  const answers = await inquirer.prompt([
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

// Show warnings for selected caches
async function confirmCleaning(caches, selectedKeys) {
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

  const answer = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: 'Are you sure you want to proceed?',
      default: false
    }
  ]);

  return answer.confirm;
}

// Clean selected caches
async function cleanCaches(caches, selectedKeys) {
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
              spinner.fail(chalk.red(`✗ ${cache.name} - error: ${err.message}`));
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
      spinner.fail(chalk.red(`✗ ${cache.name} - error: ${err.message}`));
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
