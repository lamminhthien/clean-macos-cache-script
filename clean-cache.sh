#!/bin/bash

# macOS Cache Cleanup Tool
# Interactive terminal tool for cleaning various cache locations

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
GRAY='\033[0;90m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Checkbox states
CHECKED="[✓]"
UNCHECKED="[ ]"

# Global arrays to store cache locations and their info
declare -a CACHE_PATHS
declare -a CACHE_NAMES
declare -a CACHE_SIZES
declare -a CACHE_SELECTED
declare -a CACHE_WARNINGS

# Function to get human-readable size
get_folder_size() {
    local path="$1"
    if [ -d "$path" ]; then
        du -sh "$path" 2>/dev/null | awk '{print $1}'
    else
        echo "0B"
    fi
}

# Function to detect all Chrome profiles and their cache types
detect_chrome_profiles() {
    local chrome_app_support="$HOME/Library/Application Support/Google/Chrome"
    local chrome_caches="$HOME/Library/Caches/Google/Chrome"
    local profiles=()

    # Detect all profile directories
    local profile_dirs=()
    if [ -d "$chrome_app_support/Default" ]; then
        profile_dirs+=("Default")
    fi
    for profile_dir in "$chrome_app_support"/Profile*; do
        if [ -d "$profile_dir" ]; then
            profile_dirs+=("$(basename "$profile_dir")")
        fi
    done

    # For each profile, add all cache types
    for profile_name in "${profile_dirs[@]}"; do
        # Application Support caches
        local app_base="$chrome_app_support/$profile_name"
        [ -d "$app_base/Cache" ] && profiles+=("$app_base/Cache|Chrome $profile_name - Cache")
        [ -d "$app_base/Code Cache" ] && profiles+=("$app_base/Code Cache|Chrome $profile_name - Code Cache")
        [ -d "$app_base/GPUCache" ] && profiles+=("$app_base/GPUCache|Chrome $profile_name - GPUCache")
        [ -d "$app_base/Service Worker" ] && profiles+=("$app_base/Service Worker|Chrome $profile_name - Service Worker")
        [ -d "$app_base/WebStorage" ] && profiles+=("$app_base/WebStorage|Chrome $profile_name - WebStorage")

        # Library/Caches location
        local cache_base="$chrome_caches/$profile_name"
        [ -d "$cache_base/Cache" ] && profiles+=("$cache_base/Cache|Chrome $profile_name - Cache (System)")
        [ -d "$cache_base/Code Cache" ] && profiles+=("$cache_base/Code Cache|Chrome $profile_name - Code Cache (System)")
    done

    echo "${profiles[@]}"
}

# Function to detect VSCode variants
detect_vscode_variants() {
    local variants=()
    # Map of app names to their .app bundle names
    declare -A vscode_apps=(
        ["Code"]="Visual Studio Code.app"
        ["Code - Insiders"]="Visual Studio Code - Insiders.app"
        ["Cursor"]="Cursor.app"
        ["Windsurf"]="Windsurf.app"
    )

    for app_name in "${!vscode_apps[@]}"; do
        local app_bundle="${vscode_apps[$app_name]}"

        # Check if the app is actually installed
        if [ -d "/Applications/$app_bundle" ] || [ -d "$HOME/Applications/$app_bundle" ]; then
            local cache_path="$HOME/Library/Application Support/$app_name/Cache"
            local cache_data_path="$HOME/Library/Application Support/$app_name/CachedData"
            local code_cache_path="$HOME/Library/Application Support/$app_name/Code Cache"
            local gpu_cache_path="$HOME/Library/Application Support/$app_name/GPUCache"

            # Add all cache types for installed apps (even if cache doesn't exist yet)
            variants+=("$cache_path|$app_name - Cache")
            variants+=("$cache_data_path|$app_name - CachedData")
            [ -d "$code_cache_path" ] && variants+=("$code_cache_path|$app_name - Code Cache")
            [ -d "$gpu_cache_path" ] && variants+=("$gpu_cache_path|$app_name - GPUCache")
        fi
    done

    echo "${variants[@]}"
}

# Function to initialize cache locations
initialize_cache_locations() {
    local index=0

    # Package Managers
    add_cache_item "Package Managers - Yarn" "$HOME/Library/Caches/Yarn" "" "$index"; ((index++))
    add_cache_item "Package Managers - npm" "$HOME/.npm" "" "$index"; ((index++))
    add_cache_item "Package Managers - pnpm" "$HOME/Library/pnpm" "" "$index"; ((index++))
    add_cache_item "Package Managers - Homebrew" "$HOME/Library/Caches/Homebrew" "" "$index"; ((index++))
    add_cache_item "Package Managers - CocoaPods" "$HOME/Library/Caches/CocoaPods" "" "$index"; ((index++))

    # Chrome Profiles (dynamic detection)
    IFS=' ' read -ra chrome_profiles <<< "$(detect_chrome_profiles)"
    for profile_info in "${chrome_profiles[@]}"; do
        IFS='|' read -r path name <<< "$profile_info"
        add_cache_item "Browser - $name" "$path" "" "$index"; ((index++))
    done

    # VSCode Variants (dynamic detection)
    IFS=' ' read -ra vscode_caches <<< "$(detect_vscode_variants)"
    for cache_info in "${vscode_caches[@]}"; do
        IFS='|' read -r path name <<< "$cache_info"
        add_cache_item "IDE - $name" "$path" "" "$index"; ((index++))
    done

    # Xcode
    add_cache_item "IDE - Xcode DerivedData" "$HOME/Library/Developer/Xcode/DerivedData" "" "$index"; ((index++))
    add_cache_item "IDE - Xcode UserData" "$HOME/Library/Developer/Xcode/UserData" "" "$index"; ((index++))

    # Applications
    add_cache_item "App - Microsoft Teams Cache" "$HOME/Library/Application Support/Microsoft/Teams/Cache" "" "$index"; ((index++))
    add_cache_item "App - Teams2 Cache" "$HOME/Library/Containers/com.microsoft.teams2/Data/Library/Caches" "" "$index"; ((index++))
    add_cache_item "App - Teams2 Service Worker" "$HOME/Library/Containers/com.microsoft.teams2/Data/Library/Application Support/Microsoft/MSTeams/EBWebView/WV2Profile_tfw/Service Worker" "" "$index"; ((index++))
    add_cache_item "App - Teams2 WebStorage" "$HOME/Library/Containers/com.microsoft.teams2/Data/Library/Application Support/Microsoft/MSTeams/EBWebView/WV2Profile_tfw/WebStorage" "" "$index"; ((index++))
    add_cache_item "App - Teams Logs" "$HOME/Library/Group Containers/UBF8T346G9.com.microsoft.teams/Library/Application Support/Logs" "" "$index"; ((index++))
    add_cache_item "App - Krisp Cache" "$HOME/Library/Application Support/krisp/Cache" "" "$index"; ((index++))
    add_cache_item "App - Krisp Code Cache" "$HOME/Library/Application Support/krisp/Code Cache" "" "$index"; ((index++))
    add_cache_item "App - Krisp GPUCache" "$HOME/Library/Application Support/krisp/GPUCache" "" "$index"; ((index++))
    add_cache_item "App - Krisp Logs" "$HOME/Library/Application Support/krisp/logs" "" "$index"; ((index++))
    add_cache_item "App - Krisp Update" "$HOME/Library/Application Support/krisp/update" "" "$index"; ((index++))
    add_cache_item "App - Warp" "$HOME/.warp" "" "$index"; ((index++))
    add_cache_item "App - Warp Autoupdate" "$HOME/Library/Application Support/dev.warp.Warp-Stable/autoupdate" "" "$index"; ((index++))
    add_cache_item "App - Google Updater" "$HOME/Library/Application Support/Google/GoogleUpdater" "" "$index"; ((index++))

    # System Caches
    add_cache_item "System - User Cache" "$HOME/Library/Caches" "" "$index"; ((index++))
    add_cache_item "System - Media Analysis Cache" "$HOME/Library/Containers/com.apple.mediaanalysisd/Data/Library/Caches/com.apple.mediaanalysisd/com.apple.e5rt.e5bundlecache" "" "$index"; ((index++))
    add_cache_item "System - CoreSimulator Caches" "/Library/Developer/CoreSimulator/Caches" "Requires sudo" "$index"; ((index++))
    add_cache_item "System - Logs" "/Library/Logs" "Requires sudo" "$index"; ((index++))
    add_cache_item "System - Temp Files" "/private/var/tmp" "WARNING: Requires sudo. May contain important temp files!" "$index"; ((index++))

    # Development Caches
    add_cache_item "Dev - Gradle" "$HOME/.gradle/caches" "WARNING: This may require re-downloading dependencies!" "$index"; ((index++))
    add_cache_item "Dev - General Cache" "$HOME/.cache" "" "$index"; ((index++))
}

# Function to add cache item
add_cache_item() {
    local name="$1"
    local path="$2"
    local warning="$3"
    local index="$4"

    # Expand ~ to actual home directory for checking
    local expanded_path="${path/#\~/$HOME}"

    CACHE_NAMES[$index]="$name"
    CACHE_PATHS[$index]="$path"
    CACHE_WARNINGS[$index]="$warning"
    CACHE_SELECTED[$index]=0

    # Calculate size
    if [ -d "$expanded_path" ]; then
        CACHE_SIZES[$index]=$(get_folder_size "$expanded_path")
    else
        CACHE_SIZES[$index]="N/A"
    fi
}

# Function to display menu
display_menu() {
    clear
    echo -e "${BOLD}${CYAN}╔════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BOLD}${CYAN}║${WHITE}              macOS Cache Cleanup Tool                          ${CYAN}║${NC}"
    echo -e "${BOLD}${CYAN}╚════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${YELLOW}Use ↑/↓ or j/k to navigate, SPACE to select, ENTER to confirm, q to quit${NC}"
    echo ""

    local total_items=${#CACHE_NAMES[@]}
    local current_highlight=$1

    for i in $(seq 0 $((total_items - 1))); do
        local checkbox="${UNCHECKED}"
        local color="${NC}"

        # Check if selected
        if [ "${CACHE_SELECTED[$i]}" -eq 1 ]; then
            checkbox="${CHECKED}"
            color="${GREEN}"
        fi

        # Highlight current item
        if [ "$i" -eq "$current_highlight" ]; then
            echo -ne "${BOLD}${BLUE}> "
        else
            echo -ne "  "
        fi

        # Display checkbox and name
        echo -ne "${color}${checkbox} ${CACHE_NAMES[$i]}${NC}"

        # Display size
        local size="${CACHE_SIZES[$i]}"
        if [ "$size" != "N/A" ]; then
            echo -ne " ${GRAY}(${size})${NC}"
        else
            echo -ne " ${GRAY}(not found)${NC}"
        fi

        echo ""

        # Display warning if exists
        if [ -n "${CACHE_WARNINGS[$i]}" ]; then
            echo -e "    ${RED}⚠ ${CACHE_WARNINGS[$i]}${NC}"
        fi
    done

    echo ""
    echo -e "${GRAY}─────────────────────────────────────────────────────────────────────${NC}"

    # Calculate total size of selected items
    local total_size=0
    local selected_count=0
    for i in $(seq 0 $((total_items - 1))); do
        if [ "${CACHE_SELECTED[$i]}" -eq 1 ]; then
            ((selected_count++))
        fi
    done

    if [ "$selected_count" -gt 0 ]; then
        echo -e "${WHITE}Selected: ${GREEN}${selected_count}${WHITE} item(s)${NC}"
    else
        echo -e "${GRAY}No items selected${NC}"
    fi
}

# Function to toggle selection
toggle_selection() {
    local index=$1
    if [ "${CACHE_SELECTED[$index]}" -eq 1 ]; then
        CACHE_SELECTED[$index]=0
    else
        CACHE_SELECTED[$index]=1
    fi
}

# Function to read a single key (compatible with bash and zsh)
read_key() {
    local key
    # Save terminal settings
    local old_tty_settings=$(stty -g)

    # Set terminal to raw mode
    stty -icanon -echo min 1 time 0

    # Read first character
    key=$(dd bs=1 count=1 2>/dev/null)

    # Check if it's an escape sequence
    if [ "$key" = $'\x1b' ]; then
        # Read next two characters for arrow keys
        local next1 next2
        next1=$(dd bs=1 count=1 2>/dev/null)
        next2=$(dd bs=1 count=1 2>/dev/null)
        key="${key}${next1}${next2}"
    fi

    # Restore terminal settings
    stty "$old_tty_settings"

    echo "$key"
}

# Function to handle interactive menu
interactive_menu() {
    local current=0
    local total_items=${#CACHE_NAMES[@]}

    while true; do
        display_menu "$current"

        # Read single character using compatible function
        key=$(read_key)

        # Handle arrow keys (they send escape sequences)
        if [ "$key" = $'\x1b\x5b\x41' ]; then
            # Up arrow
            ((current--))
            [ "$current" -lt 0 ] && current=$((total_items - 1))
        elif [ "$key" = $'\x1b\x5b\x42' ]; then
            # Down arrow
            ((current++))
            [ "$current" -ge "$total_items" ] && current=0
        elif [ "$key" = " " ]; then
            # Space to toggle
            toggle_selection "$current"
        elif [ "$key" = "j" ]; then
            # vim down
            ((current++))
            [ "$current" -ge "$total_items" ] && current=0
        elif [ "$key" = "k" ]; then
            # vim up
            ((current--))
            [ "$current" -lt 0 ] && current=$((total_items - 1))
        elif [ "$key" = "q" ] || [ "$key" = "Q" ]; then
            # Quit
            clear
            echo -e "${YELLOW}Cleanup cancelled.${NC}"
            exit 0
        elif [ "$key" = "" ] || [ "$key" = $'\x0a' ] || [ "$key" = $'\x0d' ]; then
            # Enter to confirm (handles both \n and \r)
            return 0
        fi
    done
}

# Function to perform cleanup
perform_cleanup() {
    local total_items=${#CACHE_NAMES[@]}
    local cleaned_count=0
    local failed_count=0

    clear
    echo -e "${BOLD}${CYAN}╔════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BOLD}${CYAN}║${WHITE}                  Cleaning Cache Files...                       ${CYAN}║${NC}"
    echo -e "${BOLD}${CYAN}╚════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""

    for i in $(seq 0 $((total_items - 1))); do
        if [ "${CACHE_SELECTED[$i]}" -eq 1 ]; then
            local path="${CACHE_PATHS[$i]}"
            local name="${CACHE_NAMES[$i]}"
            local expanded_path="${path/#\~/$HOME}"

            echo -ne "${BLUE}Cleaning ${name}...${NC} "

            if [ -d "$expanded_path" ]; then
                if rm -rf "$expanded_path" 2>/dev/null; then
                    echo -e "${GREEN}✓ Done${NC}"
                    ((cleaned_count++))
                else
                    echo -e "${RED}✗ Failed (permission denied?)${NC}"
                    ((failed_count++))
                fi
            else
                echo -e "${YELLOW}⊘ Skipped (not found)${NC}"
            fi
        fi
    done

    echo ""
    echo -e "${GRAY}─────────────────────────────────────────────────────────────────────${NC}"
    echo -e "${WHITE}Cleanup Summary:${NC}"
    echo -e "  ${GREEN}Successfully cleaned: ${cleaned_count}${NC}"
    if [ "$failed_count" -gt 0 ]; then
        echo -e "  ${RED}Failed: ${failed_count}${NC}"
    fi
    echo ""
}

# Main function
main() {
    # Check if running on macOS
    if [[ "$OSTYPE" != "darwin"* ]]; then
        echo -e "${RED}Error: This script is designed for macOS only.${NC}"
        exit 1
    fi

    # Check for sudo privileges
    echo -e "${CYAN}Checking permissions...${NC}"
    if [ "$EUID" -ne 0 ]; then
        echo -e "${YELLOW}⚠ Not running as root.${NC}"
        echo -e "${YELLOW}Some cache files may require sudo privileges to delete.${NC}"
        echo -e "${YELLOW}Consider running with: ${WHITE}sudo ./clean-cache.sh${NC}"
        echo ""
        read -p "Continue anyway? (y/N) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo -e "${YELLOW}Exiting...${NC}"
            exit 0
        fi
    else
        echo -e "${GREEN}✓ Running with sudo privileges${NC}"
    fi
    echo ""

    # Initialize cache locations
    echo -e "${CYAN}Scanning cache locations...${NC}"
    initialize_cache_locations

    # Show interactive menu
    interactive_menu

    # Check if any items are selected
    local has_selection=0
    for selected in "${CACHE_SELECTED[@]}"; do
        if [ "$selected" -eq 1 ]; then
            has_selection=1
            break
        fi
    done

    if [ "$has_selection" -eq 0 ]; then
        clear
        echo -e "${YELLOW}No items selected. Nothing to clean.${NC}"
        exit 0
    fi

    # Confirm cleanup
    clear
    echo -e "${YELLOW}Are you sure you want to delete the selected cache files? (y/N)${NC} "
    read -r confirmation

    if [[ "$confirmation" =~ ^[Yy]$ ]]; then
        perform_cleanup
        echo -e "${GREEN}Cache cleanup completed!${NC}"
    else
        echo -e "${YELLOW}Cleanup cancelled.${NC}"
    fi
}

# Run main function
main
