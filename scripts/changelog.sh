#!/bin/bash

# Changelog management script
# Usage: ./scripts/changelog.sh [add|prepare|help] [type] [message]

set -e

CHANGELOG_FILE="CHANGELOG.md"

show_help() {
    echo "📝 Changelog Management Script"
    echo ""
    echo "Usage:"
    echo "  ./scripts/changelog.sh add <type> <message>    Add entry to Unreleased section"
    echo "  ./scripts/changelog.sh prepare <version>       Prepare changelog for release"
    echo "  ./scripts/changelog.sh help                    Show this help"
    echo ""
    echo "Entry types:"
    echo "  added      - New features"
    echo "  changed    - Changes in existing functionality"
    echo "  deprecated - Soon-to-be removed features"
    echo "  removed    - Removed features"
    echo "  fixed      - Bug fixes"
    echo "  security   - Security fixes"
    echo ""
    echo "Examples:"
    echo "  ./scripts/changelog.sh add added \"JSONPath query caching for better performance\""
    echo "  ./scripts/changelog.sh add fixed \"Handle malformed JSON files gracefully\""
    echo "  ./scripts/changelog.sh prepare 1.2.0"
}

add_entry() {
    local TYPE="$1"
    local MESSAGE="$2"
    
    if [ -z "$TYPE" ] || [ -z "$MESSAGE" ]; then
        echo "❌ Both type and message are required"
        show_help
        exit 1
    fi
    
    # Validate type
    case "$TYPE" in
        added|changed|deprecated|removed|fixed|security) ;;
        *)
            echo "❌ Invalid type: $TYPE"
            show_help
            exit 1
            ;;
    esac
    
    # Convert type to proper case
    TYPE_TITLE=$(echo "$TYPE" | awk '{print toupper(substr($0,1,1)) tolower(substr($0,2))}')
    
    if [ ! -f "$CHANGELOG_FILE" ]; then
        echo "❌ CHANGELOG.md not found!"
        exit 1
    fi
    
    # Check if the type section exists under Unreleased
    if ! grep -A 20 "## \[Unreleased\]" "$CHANGELOG_FILE" | grep -q "### $TYPE_TITLE"; then
        # Add the section if it doesn't exist
        sed -i '' "/## \[Unreleased\]/,/^## / {
            /^### Added/,/^### / {
                /^### Added/ a\\
### $TYPE_TITLE\\
- $MESSAGE\\

            }
        }" "$CHANGELOG_FILE" 2>/dev/null || {
            # Fallback for systems without -i ''
            sed "/## \[Unreleased\]/,/^## / {
                /^### Added/ a\\
### $TYPE_TITLE\\
- $MESSAGE
            }" "$CHANGELOG_FILE" > "$CHANGELOG_FILE.tmp" && mv "$CHANGELOG_FILE.tmp" "$CHANGELOG_FILE"
        }
    else
        # Add to existing section
        sed -i '' "/### $TYPE_TITLE/,/^### / {
            /^### $TYPE_TITLE/ a\\
- $MESSAGE

        }" "$CHANGELOG_FILE" 2>/dev/null || {
            # Fallback for systems without -i ''
            sed "/### $TYPE_TITLE/,/^### / {
                /^### $TYPE_TITLE/ a\\
- $MESSAGE
            }" "$CHANGELOG_FILE" > "$CHANGELOG_FILE.tmp" && mv "$CHANGELOG_FILE.tmp" "$CHANGELOG_FILE"
        }
    fi
    
    echo "✅ Added to changelog: [$TYPE_TITLE] $MESSAGE"
}

prepare_release() {
    local VERSION="$1"
    local DATE=$(date +%Y-%m-%d)
    
    if [ -z "$VERSION" ]; then
        echo "❌ Version is required"
        exit 1
    fi
    
    if [ ! -f "$CHANGELOG_FILE" ]; then
        echo "❌ CHANGELOG.md not found!"
        exit 1
    fi
    
    # Create backup
    cp "$CHANGELOG_FILE" "$CHANGELOG_FILE.backup"
    
    # Replace [Unreleased] with version and date
    sed -i '' "s/## \[Unreleased\]/## [$VERSION] - $DATE/" "$CHANGELOG_FILE" 2>/dev/null || {
        sed "s/## \[Unreleased\]/## [$VERSION] - $DATE/" "$CHANGELOG_FILE" > "$CHANGELOG_FILE.tmp" && mv "$CHANGELOG_FILE.tmp" "$CHANGELOG_FILE"
    }
    
    # Add new Unreleased section at the top
    sed -i '' "/^## \[$VERSION\]/i\\
## [Unreleased]\\
\\
### Added\\
\\
### Changed\\
\\
### Deprecated\\
\\
### Removed\\
\\
### Fixed\\
\\
### Security\\
" "$CHANGELOG_FILE" 2>/dev/null || {
        # Fallback approach
        echo "## [Unreleased]

### Added

### Changed

### Deprecated

### Removed

### Fixed

### Security

" > "$CHANGELOG_FILE.tmp"
        cat "$CHANGELOG_FILE" >> "$CHANGELOG_FILE.tmp"
        mv "$CHANGELOG_FILE.tmp" "$CHANGELOG_FILE"
    }
    
    # Update the links at the bottom
    if grep -q "\[Unreleased\]:" "$CHANGELOG_FILE"; then
        # Update existing links
        sed -i '' "s|\[Unreleased\]:.*|[Unreleased]: https://github.com/berrydev-ai/giraffe-orca-mcp/compare/v$VERSION...HEAD|" "$CHANGELOG_FILE" 2>/dev/null || {
            sed "s|\[Unreleased\]:.*|[Unreleased]: https://github.com/berrydev-ai/giraffe-orca-mcp/compare/v$VERSION...HEAD|" "$CHANGELOG_FILE" > "$CHANGELOG_FILE.tmp" && mv "$CHANGELOG_FILE.tmp" "$CHANGELOG_FILE"
        }
        
        # Add new version link
        sed -i '' "/\[Unreleased\]:/a\\
[$VERSION]: https://github.com/berrydev-ai/giraffe-orca-mcp/releases/tag/v$VERSION
" "$CHANGELOG_FILE" 2>/dev/null || {
            echo "[$VERSION]: https://github.com/berrydev-ai/giraffe-orca-mcp/releases/tag/v$VERSION" >> "$CHANGELOG_FILE"
        }
    fi
    
    echo "✅ Prepared changelog for version $VERSION"
    echo "📋 Review the changes and commit when ready"
    
    # Show the diff
    echo ""
    echo "Changes made:"
    echo "============"
    diff "$CHANGELOG_FILE.backup" "$CHANGELOG_FILE" || true
    rm "$CHANGELOG_FILE.backup"
}

# Main command handling
case "${1:-help}" in
    add)
        add_entry "$2" "$3"
        ;;
    prepare)
        prepare_release "$2"
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        echo "❌ Unknown command: $1"
        show_help
        exit 1
        ;;
esac
