# Changelog Management Guide

This guide covers how to maintain changelogs for your Giraffe Orca MCP Server project. The system supports both **manual** and **automatic** changelog generation.

## 📋 Changelog Approaches

### 1. Manual Changelog (Recommended)

**Pros:** Curated, user-friendly, consistent format  
**Cons:** Requires manual maintenance

Use the `CHANGELOG.md` file following [Keep a Changelog](https://keepachangelog.com/) format.

### 2. Automatic Changelog

**Pros:** Zero maintenance, always up-date  
**Cons:** May include irrelevant commit messages

Generated from git commit messages between releases.

### 3. Hybrid Approach (Best of Both)

**Pros:** Manual curation with automatic fallback  
**Cons:** Requires some manual work

Our system automatically detects and prefers manual changelogs, falls back to git commits.

## 🛠️ Manual Changelog Workflow

### Daily Development

Add changelog entries as you work:

```bash
# Quick command-line entries
./scripts/changelog.sh add added \"JSON schema validation for large files\"
./scripts/changelog.sh add fixed \"Memory leak in JSONPath queries\"
./scripts/changelog.sh add changed \"Improved error messages for malformed JSON\"

# Or use yarn
yarn changelog:add fixed \"Handle edge case in nested objects\"
```

### Available Entry Types

| Type | Description | Example |
|------|-------------|---------|
| `added` | New features | \"Added caching for JSON queries\" |
| `changed` | Changes in existing functionality | \"Updated JSONPath library to v2.0\" |
| `deprecated` | Soon-to-be removed features | \"Deprecated old query syntax\" |
| `removed` | Removed features | \"Removed legacy parser\" |
| `fixed` | Bug fixes | \"Fixed parsing of large JSON arrays\" |
| `security` | Security fixes | \"Fixed potential XSS in error messages\" |

### Release Preparation

1. **Review changelog entries:**
   ```bash
   # View current unreleased entries
   cat CHANGELOG.md
   ```

2. **Prepare for release:**
   ```bash
   ./scripts/changelog.sh prepare 1.2.0
   # or
   yarn changelog:prepare 1.2.0
   ```

3. **Commit the changes:**
   ```bash
   git add CHANGELOG.md
   git commit -m \"docs: prepare changelog for v1.2.0\"
   ```

4. **Create the release:**
   ```bash
   ./scripts/release.sh patch  # or minor/major
   ```

## 🤖 Automatic Changelog Workflow

If you prefer automatic changelogs, simply delete or don't maintain `CHANGELOG.md`. The system will:

1. Generate changelog from git commits since the last release
2. Format commit messages as bullet points
3. Include up to 20 most recent commits
4. Exclude merge commits

### Improving Automatic Changelogs

Use conventional commit messages:

```bash
git commit -m \"feat: add JSON schema generation\"
git commit -m \"fix: resolve memory leak in large file processing\"
git commit -m \"docs: update README with new examples\"
git commit -m \"perf: optimize JSONPath query performance by 50%\"
git commit -m \"style: format code with prettier\"
git commit -m \"refactor: simplify JSON parsing logic\"
git commit -m \"test: add unit tests for edge cases\"
git commit -m \"chore: update dependencies\"
```

## 🔄 Release Integration

The release system automatically:

1. **Checks for manual changelog:** Looks for `CHANGELOG.md` with `[Unreleased]` section
2. **Extracts entries:** Pulls content from `[Unreleased]` section
3. **Falls back to git:** Uses commit messages if no manual changelog
4. **Includes in release notes:** Incorporates changelog into GitHub release

### Example Release Flow

```bash
# 1. Add changelog entries during development
./scripts/changelog.sh add added \"New JSON validation feature\"
./scripts/changelog.sh add fixed \"Bug in nested object parsing\"

# 2. When ready to release
./scripts/release.sh minor

# The script will:
# - Remind you to update changelog ✓
# - Extract [Unreleased] section ✓  
# - Create professional release notes ✓
# - Generate downloadable packages ✓
```

## 📝 Changelog File Structure

```markdown
# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- New JSON validation for large files
- Support for custom JSONPath functions

### Fixed  
- Memory leak in query processing
- Edge case in nested array parsing

### Changed
- Updated error messages for better clarity

## [1.1.0] - 2024-07-20

### Added
- Initial JSON schema generation
- Support for large file processing

## [1.0.0] - 2024-07-15

### Added
- Initial release
- JSONPath querying functionality
- Claude Desktop integration

[Unreleased]: https://github.com/berrydev-ai/giraffe-orca-mcp/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/berrydev-ai/giraffe-orca-mcp/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/berrydev-ai/giraffe-orca-mcp/releases/tag/v1.0.0
```

## 🎯 Best Practices

### Writing Good Changelog Entries

**✅ Good:**
- \"Added caching to improve JSON query performance by 3x\"
- \"Fixed crash when parsing malformed JSON with nested arrays\"
- \"Changed default timeout from 30s to 60s for large files\"

**❌ Avoid:**
- \"Updated stuff\"
- \"Fixed bug\"
- \"Various improvements\"

### When to Update

- **Added:** New features, new capabilities
- **Fixed:** Bug fixes, error handling improvements
- **Changed:** Modifications to existing behavior
- **Security:** Security-related fixes
- **Deprecated:** Features marked for removal
- **Removed:** Features that were removed

### Timing

- **During development:** Add entries as you work
- **Before commits:** Include changelog updates in your commits
- **Before releases:** Review and organize entries

## 📚 Quick Reference

```bash
# View help
yarn changelog:help

# Add entries
yarn changelog:add added \"New feature description\"
yarn changelog:add fixed \"Bug fix description\"

# Prepare release
yarn changelog:prepare 1.2.0

# Create release (will use manual changelog if available)
yarn run release
```

## 🔧 Customization

You can customize the changelog format by editing:
- `scripts/changelog.sh` - Changelog management script
- `CHANGELOG.md` - Manual changelog template
- `.github/workflows/release.yml` - Release workflow integration

The system is flexible and supports various changelog formats and conventions.
