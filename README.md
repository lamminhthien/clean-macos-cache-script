# macOS Cache Cleanup Tool

An interactive terminal tool for cleaning various cache locations on macOS with a beautiful, colorful UI.

## Features

- **Interactive checkbox interface** with keyboard navigation
- **Colorful terminal UI** for better user experience
- **Dynamic folder size calculation** for each cache location
- **Smart detection**:
  - Automatically detects all Chrome profiles (Default, Profile 1, Profile 2, etc.)
  - Detects multiple cache types per Chrome profile (Cache, Code Cache, GPUCache, WebStorage, Service Worker)
  - Detects installed VSCode variants (checks for actual app installation)
- **Permission handling**:
  - Checks for sudo privileges at startup
  - Warns about caches that require elevated permissions
  - Option to continue without sudo (with warnings)
- **Safety warnings** for critical folders (e.g., .gradle, system temp files)
- **Universal paths** using `~` instead of hardcoded user paths
- **Comprehensive cache coverage**:
  - Package managers (Yarn, npm, pnpm, Homebrew, CocoaPods)
  - Browsers (All Chrome cache types for all profiles)
  - IDEs (VSCode variants with multiple cache types, Xcode DerivedData & UserData)
  - Applications (Teams v1 & v2, Krisp, Warp, Google Updater)
  - System caches (User cache, CoreSimulator, Logs, Temp files)
  - Development caches (Gradle, general cache)

## Installation

1. Clone or download this repository
2. Make the script executable:
   ```bash
   chmod +x clean-cache.sh
   ```

## Usage

Run the script:
```bash
./clean-cache.sh
```

For more efficient cleaning (recommended for system caches):
```bash
sudo ./clean-cache.sh
```

**Note:** Some cache locations require sudo privileges to delete effectively. The script will warn you if you're not running with sudo and give you the option to continue anyway.

### Navigation

- **↑/↓** or **j/k** - Navigate up/down through the list
- **SPACE** - Toggle selection (check/uncheck)
- **ENTER** - Confirm selection and proceed to cleanup
- **q** - Quit without cleaning

### Workflow

1. The tool scans all cache locations and displays their sizes
2. Use keyboard navigation to select which caches you want to clean
3. Press ENTER to confirm your selection
4. Confirm the cleanup action (y/N)
5. The tool will delete selected caches and show results

## Cache Locations Cleaned

### Package Managers
- `~/Library/Caches/Yarn`
- `~/.npm`
- `~/Library/pnpm`
- `~/Library/Caches/Homebrew`
- `~/Library/Caches/CocoaPods`

### Browsers
- Chrome (all profiles, dynamically detected):
  - Cache & Code Cache (both in Application Support and Library/Caches)
  - GPUCache
  - WebStorage
  - Service Worker

### IDEs
- VSCode variants (Code, Code Insiders, Cursor, Windsurf):
  - Cache, CachedData, Code Cache, GPUCache
- Xcode:
  - DerivedData
  - UserData

### Applications
- Microsoft Teams (v1 & v2):
  - Cache folders
  - Service Worker, WebStorage
  - Logs
- Krisp:
  - Cache, Code Cache, GPUCache
  - Update files
  - Logs
- Warp:
  - Main cache
  - Autoupdate files
- Google Updater

### System & Development
- User Library Caches
- Media Analysis Cache
- CoreSimulator Caches (requires sudo)
- System Logs (requires sudo)
- Temp files in /private/var/tmp (requires sudo, with warning)
- Gradle caches (with warning)
- General ~/.cache

## Safety Features

- **Sudo privilege check** - Detects if running without sudo and warns about potential issues
- **Non-destructive scanning** - The tool only reads sizes until you confirm cleanup
- **Warnings for critical folders** - Special warnings for:
  - `.gradle` - May require re-downloading dependencies
  - `/private/var/tmp` - May contain important temporary files
  - System folders requiring sudo permissions
- **Smart IDE detection** - Only shows cache for actually installed applications
- **Confirmation prompt** - Double confirmation before any deletion
- **Permission handling** - Gracefully handles permission denied errors
- **Skip missing folders** - Automatically skips folders that don't exist

## Requirements

- macOS (Darwin)
- Bash (included with macOS)
- No external dependencies required

## Notes

- The script uses `rm -rf` for deletion, so be careful with your selections
- **Running with sudo is recommended** for complete cache cleanup, especially for:
  - CoreSimulator caches
  - System logs
  - Temporary system files
- Cache sizes are calculated using `du -sh` which may take a moment for large directories
- The tool will skip any cache locations that don't exist on your system
- Chrome caches are cleaned from both:
  - `~/Library/Application Support/Google/Chrome/` (WebStorage, Service Worker, etc.)
  - `~/Library/Caches/Google/Chrome/` (System caches)
- IDE detection checks if apps are installed in `/Applications` or `~/Applications` before showing cache options

## License

MIT License - Feel free to use and modify as needed.
