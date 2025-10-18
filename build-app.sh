#!/bin/bash

set -e

echo "🔨 Building macOS Cache Cleaner Application..."

# Clean previous build
echo "📦 Cleaning previous build..."
rm -rf dist

# Build executable with pkg
echo "🏗️  Building executable..."
npm run build

# Create app bundle structure
echo "📁 Creating app bundle structure..."
mkdir -p "dist/macOS Cache Cleaner.app/Contents/MacOS"
mkdir -p "dist/macOS Cache Cleaner.app/Contents/Resources"

# Copy executable
echo "📋 Copying executable..."
cp dist/macos-cache-cleaner "dist/macOS Cache Cleaner.app/Contents/MacOS/macos-cache-cleaner-bin"
chmod +x "dist/macOS Cache Cleaner.app/Contents/MacOS/macos-cache-cleaner-bin"

# Create launcher script
echo "🚀 Creating launcher script..."
cat > "dist/macOS Cache Cleaner.app/Contents/MacOS/macos-cache-cleaner" << 'EOF'
#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Open Terminal and run the executable
osascript <<APPLESCRIPT
tell application "Terminal"
    activate
    do script "cd '$DIR' && ./macos-cache-cleaner-bin; exit"
end tell
APPLESCRIPT
EOF

chmod +x "dist/macOS Cache Cleaner.app/Contents/MacOS/macos-cache-cleaner"

# Create Info.plist
echo "📝 Creating Info.plist..."
cat > "dist/macOS Cache Cleaner.app/Contents/Info.plist" << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleExecutable</key>
    <string>macos-cache-cleaner</string>
    <key>CFBundleIdentifier</key>
    <string>com.github.macos-cache-cleaner</string>
    <key>CFBundleName</key>
    <string>macOS Cache Cleaner</string>
    <key>CFBundleVersion</key>
    <string>1.0.0</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0.0</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleIconFile</key>
    <string>AppIcon</string>
    <key>LSMinimumSystemVersion</key>
    <string>10.13</string>
    <key>NSHighResolutionCapable</key>
    <true/>
</dict>
</plist>
EOF

echo ""
echo "✅ Build complete!"
echo ""
echo "📦 Application location: dist/macOS Cache Cleaner.app"
echo ""
echo "🎯 Next steps:"
echo "   1. Test the app: open 'dist/macOS Cache Cleaner.app'"
echo "   2. Copy to Applications: cp -r 'dist/macOS Cache Cleaner.app' /Applications/"
echo ""
