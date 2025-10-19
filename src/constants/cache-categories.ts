import { CacheCategories } from '../types';

/**
 * Predefined cache categories for common macOS applications and tools
 */
export const CACHE_CATEGORIES: CacheCategories = {
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
      '~/Library/Application Support/Code/Code Cache',
      '~/Library/Application Support/Code/GPUCache',
      '~/Library/Application Support/Code/WebStorage',
      '~/Library/Application Support/Code/Service Worker',
      '~/Library/Application Support/Code/CachedData',
      '~/Library/Application Support/Code - Insiders/Cache',
      '~/Library/Application Support/Code - Insiders/Code Cache',
      '~/Library/Application Support/Code - Insiders/GPUCache',
      '~/Library/Application Support/Code - Insiders/WebStorage',
      '~/Library/Application Support/Code - Insiders/Service Worker',
      '~/Library/Application Support/Code - Insiders/CachedData'
    ],
    requiresSudo: false,
    warning: null
  },
  krisp: {
    name: '🎤 Krisp Cache',
    paths: [
      '~/Library/Application Support/krisp/Cache',
      '~/Library/Application Support/krisp/Code Cache',
      '~/Library/Application Support/krisp/GPUCache',
      '~/Library/Application Support/krisp/WebStorage',
      '~/Library/Application Support/krisp/Service Worker',
      '~/Library/Application Support/krisp/update',
      '~/Library/Application Support/krisp/logs'
    ],
    requiresSudo: false,
    warning: null
  },
  warp: {
    name: '⚡ Warp Terminal Cache',
    paths: [
      '~/Library/Application Support/dev.warp.Warp-Stable/Cache',
      '~/Library/Application Support/dev.warp.Warp-Stable/Code Cache',
      '~/Library/Application Support/dev.warp.Warp-Stable/GPUCache',
      '~/Library/Application Support/dev.warp.Warp-Stable/autoupdate'
    ],
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
