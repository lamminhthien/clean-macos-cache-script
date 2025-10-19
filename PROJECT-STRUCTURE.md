# Project Structure

## Directory Layout

```
clean-macos-cache-script/
├── src/                          # TypeScript source files
│   ├── types/                    # Type definitions
│   │   └── index.ts              # Core interfaces and types
│   │
│   ├── constants/                # Application constants
│   │   ├── cache-categories.ts   # Cache category configurations
│   │   ├── electron.ts           # Electron-related constants
│   │   └── index.ts              # Barrel export
│   │
│   ├── utils/                    # Utility modules
│   │   ├── cleaner.ts            # Cache cleaning operations
│   │   ├── discovery.ts          # Auto-discovery of Electron apps
│   │   ├── display.ts            # Results table formatting
│   │   ├── electron.ts           # Electron app detection
│   │   ├── filesystem.ts         # File system operations
│   │   ├── format.ts             # Data formatting utilities
│   │   ├── path.ts               # Path manipulation
│   │   ├── prompts.ts            # User interaction prompts
│   │   ├── scanner.ts            # Cache scanning logic
│   │   └── index.ts              # Barrel export
│   │
│   └── index.ts                  # Main application entry point
│
├── dist/                         # Compiled output (git-ignored)
│   ├── types/                    # Compiled type definitions
│   ├── constants/                # Compiled constants
│   ├── utils/                    # Compiled utilities
│   ├── index.js                  # Compiled main file
│   ├── index.d.ts                # Type declarations
│   ├── *.js.map                  # Source maps
│   ├── macos-cache-cleaner       # PKG binary
│   └── macOS Cache Cleaner.app/  # macOS app bundle
│
├── node_modules/                 # Dependencies (git-ignored)
│
├── tsconfig.json                 # TypeScript configuration
├── package.json                  # Project metadata and scripts
├── build-app.sh                  # PKG build script
├── .gitignore                    # Git ignore rules
│
├── README.md                     # Main project documentation
├── README-TS.md                  # TypeScript migration documentation
├── MIGRATION-GUIDE.md            # Detailed migration guide
└── PROJECT-STRUCTURE.md          # This file
```

## Module Breakdown

### Types (`src/types/`)

**Purpose:** Central type definitions for the entire application

**Key Types:**
- `CacheCategory` - Configuration for a cache category
- `CacheCategories` - Collection of cache categories
- `CacheResult` - Scanned cache with size information
- `CacheChoice` - Inquirer checkbox option
- `CacheSelectionAnswer` - User selection response
- `ConfirmAnswer` - Confirmation response

### Constants (`src/constants/`)

**Purpose:** Application-wide constant values

**Modules:**
- `cache-categories.ts` - Predefined cache locations for common apps
- `electron.ts` - Common Electron cache directory names
- `index.ts` - Exports all constants

### Utils (`src/utils/`)

**Purpose:** Reusable utility functions organized by responsibility

**Modules:**

| Module | Responsibility | Key Functions |
|--------|---------------|---------------|
| `path.ts` | Path operations | `expandPath()` |
| `format.ts` | Data formatting | `formatBytes()` |
| `filesystem.ts` | File operations | `getMatchingPaths()`, `getDirectorySize()` |
| `electron.ts` | Electron detection | `isElectronApp()`, `getElectronCachePaths()` |
| `discovery.ts` | Auto-discovery | `discoverElectronApps()` |
| `scanner.ts` | Cache scanning | `scanCaches()` |
| `display.ts` | UI display | `displayResults()` |
| `prompts.ts` | User interaction | `selectCaches()`, `confirmCleaning()` |
| `cleaner.ts` | Cache cleaning | `cleanCaches()` |
| `index.ts` | Module exports | Re-exports all utilities |

### Main (`src/index.ts`)

**Purpose:** Application entry point and main workflow orchestration

**Responsibilities:**
- Display welcome banner
- Platform verification (macOS only)
- Orchestrate the cleaning workflow:
  1. Scan caches
  2. Display results
  3. Prompt for selection
  4. Confirm cleaning
  5. Execute cleaning
- Error handling
- Exports for library usage

## Build Artifacts

### Compiled JavaScript (`dist/`)
- Direct transpilation of TypeScript source
- Maintains same directory structure
- Includes `.js`, `.d.ts`, and `.js.map` files

### Binary (`dist/macos-cache-cleaner`)
- Standalone executable created by PKG
- ~58MB (includes Node.js runtime)
- Targets: node18-macos-x64

### App Bundle (`dist/macOS Cache Cleaner.app/`)
- Full macOS application bundle
- Launches in Terminal automatically
- Includes Info.plist metadata

## Code Flow

```
┌─────────────────┐
│   src/index.ts  │  Main entry point
└────────┬────────┘
         │
         ├──> scanCaches()          (utils/scanner.ts)
         │    ├──> discoverElectronApps()  (utils/discovery.ts)
         │    ├──> getMatchingPaths()      (utils/filesystem.ts)
         │    └──> getDirectorySize()      (utils/filesystem.ts)
         │
         ├──> displayResults()      (utils/display.ts)
         │    └──> formatBytes()           (utils/format.ts)
         │
         ├──> selectCaches()        (utils/prompts.ts)
         │
         ├──> confirmCleaning()     (utils/prompts.ts)
         │    └──> formatBytes()           (utils/format.ts)
         │
         └──> cleanCaches()         (utils/cleaner.ts)
              └──> formatBytes()           (utils/format.ts)
```

## Dependencies

### Runtime Dependencies
- `boxen` - Terminal box styling
- `chalk` - Terminal colors
- `cli-table3` - Table formatting
- `inquirer` - Interactive prompts
- `ora` - Loading spinners

### Development Dependencies
- `typescript` - TypeScript compiler
- `@types/node` - Node.js type definitions
- `@types/inquirer` - Inquirer type definitions
- `ts-node` - Direct TypeScript execution
- `pkg` - Binary packaging

## Design Principles

1. **Separation of Concerns**
   - Each module has a single, clear responsibility
   - Types separated from implementation
   - Constants separated from logic

2. **Type Safety**
   - All functions have explicit type signatures
   - Interfaces for all data structures
   - Strict TypeScript configuration

3. **Modularity**
   - Small, focused modules
   - Barrel exports for clean imports
   - Easy to test and maintain

4. **Developer Experience**
   - Clear file organization
   - Descriptive function names
   - Comprehensive type definitions
   - Source maps for debugging

5. **Maintainability**
   - Consistent code style
   - Logical grouping
   - Easy to locate functionality
   - Clear dependency chain
