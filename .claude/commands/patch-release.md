# Patch Release Workflow

You are tasked with performing a complete patch release for the Giraffe Orca MCP project. This involves updating the changelog, creating the release, and ensuring all systems are working correctly.

## Prerequisites Check

First, verify the following:
- Working directory is the orca-mcp project root
- You're on the main branch with no uncommitted changes
- All recent changes need to be documented in the changelog

## Step-by-Step Release Process

### 1. Update CHANGELOG.md

**Add an Unreleased section if it doesn't exist:**
- Check if CHANGELOG.md has an `[Unreleased]` section
- If not, create one at the top with proper formatting
- Follow the Keep a Changelog format with sections: Added, Changed, Deprecated, Removed, Fixed, Security

**Document recent changes:**
- Review recent commits since the last release using `git log`
- Add entries to the appropriate sections under `[Unreleased]`
- Use the changelog script: `./scripts/changelog.sh add <type> "<message>"`
- Focus on user-facing changes, bug fixes, and new features

**Example changelog entries:**
```bash
./scripts/changelog.sh add fixed "Fixed bash quoting issue in GitHub Actions release workflow"
./scripts/changelog.sh add changed "Improved error handling in release scripts"
```

### 2. Run Pre-Release Validation

Execute the following commands and ensure they all pass:
```bash
# Clean build and quality checks
npm run clean
npm run build
npm run quality

# Validate DXT manifest
npm run dxt:validate

# Test DXT packaging
npm run dxt:pack
```

Fix any errors before proceeding.

### 3. Create the Patch Release

Run the release script:
```bash
./scripts/release.sh patch
```

This script will:
- Validate the environment and check for uncommitted changes
- Prompt you to confirm changelog updates
- Run quality checks and build the project
- Bump the patch version in package.json
- Create a DXT package to verify functionality
- Commit the version change
- Create and push a git tag
- Trigger the GitHub Actions release workflow

### 4. Monitor Release Process

After the script completes:
- Check GitHub Actions at: https://github.com/giraffemedia/orca-mcp/actions
- Verify the release workflow runs successfully
- Confirm the GitHub release is created with proper assets:
  - `.dxt` file for Claude Desktop installation
  - `.tgz` file for npm installation
  - Generated release notes from changelog

### 5. Post-Release Verification

Once the GitHub release is complete:
- Download and test the `.dxt` file in Claude Desktop
- Verify the release notes are accurate and well-formatted
- Check that version numbers are consistent across all files
- Confirm the changelog links are working properly

## Error Handling

If any step fails:
- **Build/Quality Issues**: Fix TypeScript errors and linting issues first
- **Changelog Issues**: Ensure proper formatting and complete the `[Unreleased]` section
- **Git Issues**: Resolve merge conflicts and ensure clean working directory
- **GitHub Actions Failures**: Check the logs and fix any workflow issues

## Quality Standards

Ensure the release meets these criteria:
- ✅ All TypeScript compiles without errors or warnings
- ✅ All quality checks (linting, formatting, type-checking) pass
- ✅ DXT package validates and builds successfully
- ✅ Changelog entries are user-friendly and comprehensive
- ✅ Version numbers are consistent across package.json and tags
- ✅ GitHub release includes all required assets
- ✅ Release notes are professional and informative

## Important Notes

- **Never skip changelog updates** - Users rely on clear communication about changes
- **Test the DXT package** before releasing - ensure it actually works in Claude Desktop
- **Follow semantic versioning** - patch releases should only include bug fixes and non-breaking changes
- **Monitor the GitHub Actions workflow** - don't consider the release complete until all workflows pass

Execute this process methodically and verify each step before proceeding to the next one.
