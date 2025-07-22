#!/bin/bash

# Release script for Giraffe Orca MCP
# Usage: ./scripts/release.sh [patch|minor|major]

set -e

# Default to patch if no argument provided
RELEASE_TYPE=${1:-patch}

# Validate release type
if [[ ! "$RELEASE_TYPE" =~ ^(patch|minor|major)$ ]]; then
    echo "❌ Invalid release type. Use: patch, minor, or major"
    exit 1
fi

echo "🚀 Starting $RELEASE_TYPE release process..."

# Make sure we're on main branch and up to date
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "⚠️  Warning: You're not on the main branch (currently on $CURRENT_BRANCH)"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo "❌ You have uncommitted changes. Please commit or stash them first."
    exit 1
fi

# Check if we have a CHANGELOG.md and remind user to update it
if [ -f "CHANGELOG.md" ]; then
    echo "📝 Reminder: Update CHANGELOG.md before releasing!"
    echo "   Add your changes to the [Unreleased] section"
    echo "   Use: ./scripts/changelog.sh add <type> '<message>'"
    echo "   Example: ./scripts/changelog.sh add fixed 'Handle large JSON files better'"
    echo ""
    read -p "Have you updated the changelog? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Aborting release. Please update CHANGELOG.md first."
        exit 1
    fi
fi

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin main

# Run quality checks
echo "🔍 Running quality checks..."
pnpm run quality

# Build the project
echo "🔨 Building project..."
pnpm run build

# Get current version
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo "📋 Current version: $CURRENT_VERSION"

# Bump version
echo "📈 Bumping $RELEASE_TYPE version..."
pnpm version --$RELEASE_TYPE --no-git-tag-version

# Get new version
NEW_VERSION=$(node -p "require('./package.json').version")
echo "🎉 New version: $NEW_VERSION"

# Create DXT package to verify everything works
echo "📦 Creating DXT package..."
pnpm run dxt:pack

# Commit version change
echo "💾 Committing version change..."
git add package.json
git commit -m "chore: bump version to $NEW_VERSION"

# Create and push tag
TAG_NAME="v$NEW_VERSION"
echo "🏷️  Creating tag: $TAG_NAME"
git tag $TAG_NAME
git push origin main
git push origin $TAG_NAME

echo ""
echo "🎉 Release $TAG_NAME created successfully!"
echo ""
echo "The GitHub Actions workflow will now:"
echo "1. Generate an automated changelog from git commits"
echo "2. Build and test the project"
echo "3. Create DXT and NPM packages using the custom template"
echo "4. Create a GitHub release with enhanced release notes"
echo "5. Optionally publish to GitHub npm registry"
echo ""
echo "🔗 Check the progress at:"
echo "https://github.com/giraffemedia/orca-mcp/actions"
echo ""
echo "📦 Once complete, users can download:"
echo "- $TAG_NAME.dxt for Claude Desktop"
echo "- $TAG_NAME.tgz for npm install"
