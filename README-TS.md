# TypeScript Migration

This project has been migrated to TypeScript with a well-organized folder structure.

## Project Structure

```
src/
├── types/           # TypeScript type definitions
│   └── index.ts     # Core types and interfaces
├── constants/       # Application constants
│   ├── cache-categories.ts  # Cache category definitions
│   ├── electron.ts          # Electron-related constants
│   └── index.ts             # Constants barrel export
├── utils/           # Utility functions
│   ├── cleaner.ts   # Cache cleaning logic
│   ├── discovery.ts # Electron app discovery
│   ├── display.ts   # Results display formatting
│   ├── electron.ts  # Electron app detection
│   ├── filesystem.ts # File system operations
│   ├── format.ts    # Data formatting utilities
│   ├── path.ts      # Path manipulation
│   ├── prompts.ts   # User prompts and interactions
│   ├── scanner.ts   # Cache scanning logic
│   └── index.ts     # Utils barrel export
└── index.ts         # Main entry point
```

## Type Definitions

### Core Types

- `CacheCategory`: Configuration for a cache category
- `CacheCategories`: Collection of cache categories
- `CacheResult`: Scanned cache with calculated size
- `CacheChoice`: Inquirer checkbox choice
- `CacheSelectionAnswer`: Answer from cache selection
- `ConfirmAnswer`: Answer from confirmation prompt

## Development

### Build Commands

#### Full Build (Recommended)
```bash
npm run build
```
Compiles TypeScript and builds the macOS app bundle.

#### TypeScript Only
```bash
npm run build:ts
```
Compiles TypeScript to JavaScript in the `dist/` directory.

#### Package Only (requires TypeScript build)
```bash
npm run build:pkg
```
Creates the macOS app bundle from compiled JavaScript.

#### Development Mode
```bash
npm run dev
```
Run directly from TypeScript source using ts-node.

#### Clean Commands
```bash
npm run clean        # Remove entire dist directory
npm run clean:app    # Remove only app bundle (keep TS build)
```

### Running the App
```bash
npm start                              # Run from compiled JS
npm run dev                            # Run from TS source
./dist/index.js                        # Direct execution
open 'dist/macOS Cache Cleaner.app'    # Run app bundle
```

## Benefits of TypeScript Migration

1. **Type Safety**: Catch errors at compile time instead of runtime
2. **Better IDE Support**: Enhanced autocomplete and IntelliSense
3. **Code Organization**: Clear separation of concerns with modular structure
4. **Documentation**: Types serve as inline documentation
5. **Maintainability**: Easier to refactor and extend
6. **Developer Experience**: Better tooling and error messages

## Migration Notes

- All source code is now in the `src/` directory
- Compiled JavaScript outputs to `dist/`
- Type declarations are generated automatically
- The original JavaScript files remain for backward compatibility
- Build process now includes TypeScript compilation before packaging
