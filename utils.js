const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const ora = require('ora');
const chalk = require('chalk');
const inquirer = require('inquirer');
const Table = require('cli-table3');
const boxen = require('boxen');
const { CACHE_CATEGORIES, ELECTRON_CACHE_DIRS } = require('./constants');

// Utility function to expand home directory
function expandPath(filePath) {
  if (filePath.startsWith('~/')) {
    return path.join(os.homedir(), filePath.slice(2));
  }
  return filePath;
}

// Check if a directory is an Electron app by looking for Electron cache patterns
function isElectronApp(appPath) {
  try {
    if (!fs.existsSync(appPath) || !fs.statSync(appPath).isDirectory()) {
      return false;
    }

    // Check for at least one common Electron cache directory
    const hasElectronCache = ELECTRON_CACHE_DIRS.some(cacheDir => {
      const cachePath = path.join(appPath, cacheDir);
      return fs.existsSync(cachePath);
    });

    return hasElectronCache;
  } catch (err) {
    return false;
  }
}

// Get all Electron cache paths for a given app directory
function getElectronCachePaths(appPath) {
  const cachePaths = [];

  for (const cacheDir of ELECTRON_CACHE_DIRS) {
    const cachePath = path.join(appPath, cacheDir);
    if (fs.existsSync(cachePath)) {
      cachePaths.push(cachePath);
    }
  }

  return cachePaths;
}

// Auto-discover Electron apps in Application Support
function discoverElectronApps() {
  const appSupportPath = path.join(os.homedir(), 'Library/Application Support');
  const electronApps = {};

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

  // Discover Electron apps automatically
  spinner.text = 'Discovering Electron apps...';
  const discoveredElectronApps = discoverElectronApps();

  // Merge discovered apps with predefined categories
  const allCategories = { ...CACHE_CATEGORIES, ...discoveredElectronApps };

  spinner.text = 'Scanning cache directories...';

  for (const [key, category] of Object.entries(allCategories)) {
    let totalSize = 0;
    const foundPaths = [];

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

module.exports = {
  expandPath,
  isElectronApp,
  getElectronCachePaths,
  discoverElectronApps,
  getMatchingPaths,
  getDirectorySize,
  formatBytes,
  scanCaches,
  displayResults,
  selectCaches,
  confirmCleaning,
  cleanCaches
};
