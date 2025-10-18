# 🧹 macOS Cache Cleaner

An interactive terminal tool to clean cache directories and free up disk space on macOS.

## Features

- 🎨 **Colorful Interactive UI** - Beautiful terminal interface with colors, icons, and progress bars
- 📊 **Size Calculation** - Shows exact size of each cache category before cleaning
- ☑️  **Interactive Selection** - Choose which caches to clean with checkboxes
- 🔐 **Sudo Handling** - Automatically requests elevated permissions when needed
- ⚠️  **Smart Warnings** - Alerts you about important caches (e.g., Gradle cache affects build times)
- 🌐 **Multi-Profile Support** - Detects and cleans all Chrome profiles automatically
- 📦 **Comprehensive Coverage** - Cleans caches from popular development tools and applications

## What Gets Cleaned

### Development Tools
- 🧶 Yarn Cache
- 📦 NPM Cache
- 📦 PNPM Store
- 📦 CocoaPods Cache
- 🍺 Homebrew Downloads
- 🐘 Gradle Cache (with warning)
- 🔨 Xcode DerivedData & UserData
- 📱 iOS Simulator Cache

### Applications
- 🌐 Chrome Cache (all profiles)
- 💻 VSCode & VSCode Insiders Cache
- 🎤 Krisp Cache
- ⚡ Warp Terminal Cache
- 📞 Microsoft Teams Cache
- 🔄 Google Updater

### System
- 📁 User Cache Directory (~/.cache)
- 🗑️  System Temp Files (requires sudo)
- 📝 System Logs (requires sudo)
- 🎬 Media Analysis Cache

## Installation

### Prerequisites

- Node.js >= 14.0.0
- macOS

### Install Dependencies

```bash
npm install
```

## Usage

### Run the tool

```bash
npm start
```

Or if you've installed it globally:

```bash
clean-cache
```

### How to Use

1. **Scan** - The tool automatically scans all cache directories
2. **Review** - See a table showing cache sizes for each category
3. **Select** - Use arrow keys to navigate, Space to select/deselect caches
4. **Confirm** - Review warnings and confirm before cleaning
5. **Clean** - Watch as the tool cleans selected caches with progress indicators

### Keyboard Controls

- `↑/↓` - Navigate through options
- `Space` - Select/deselect item
- `a` - Toggle all items
- `Enter` - Confirm selection

## Example Output

```
╔════════════════════════════════════════╗
║                                        ║
║        🧹 macOS Cache Cleaner          ║
║   Clean up cache and free disk space   ║
║                                        ║
╚════════════════════════════════════════╝

✔ Scan completed!

┌────────────────────────────────────┬─────────────┬──────────────────┐
│ Category                           │ Size        │ Status           │
├────────────────────────────────────┼─────────────┼──────────────────┤
│ 🌐 Chrome Cache                    │ 1.23 GB     │ Ready            │
│ 🔨 Xcode Cache                     │ 856.42 MB   │ Ready            │
│ 💻 VSCode Cache                    │ 234.56 MB   │ Ready            │
│ 🧶 Yarn Cache                      │ 156.78 MB   │ Ready            │
└────────────────────────────────────┴─────────────┴──────────────────┘

╭───────────────────────────────╮
│                               │
│  Total Cache Size: 2.45 GB    │
│                               │
╰───────────────────────────────╯
```

## Warnings

### Important Notes

- **Gradle Cache**: Cleaning this requires re-installing modules for mobile projects. First build after cleaning will be slower.
- **System Directories**: Some directories require sudo privileges. You'll be prompted when needed.
- **Backup**: While safe, consider backing up important data before cleaning system directories.

## Development

### Project Structure

```
.
├── index.js           # Main CLI tool
├── package.json       # Project configuration
├── instruction.md     # Original requirements
└── README.md         # This file
```

### Dependencies

- `chalk` - Terminal colors
- `inquirer` - Interactive prompts
- `ora` - Spinners and progress indicators
- `cli-table3` - Beautiful tables
- `boxen` - Bordered boxes

## License

MIT

## Contributing

Issues and pull requests are welcome!

## Safety

This tool:
- ✅ Only cleans cache and temporary files
- ✅ Shows warnings before cleaning important caches
- ✅ Requires confirmation before any deletion
- ✅ Uses safe deletion methods
- ✅ Handles permissions properly

**Note**: This tool is designed for macOS only and will not run on other operating systems.
