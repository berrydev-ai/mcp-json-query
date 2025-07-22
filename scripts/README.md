# Scripts

This directory contains utility scripts for the Giraffe Orca MCP project.

## Release Script

The `release.sh` script automates the process of creating releases with downloadable packages.

### Usage

```bash
# Create a patch release (1.0.0 -> 1.0.1)
./scripts/release.sh patch

# Create a minor release (1.0.0 -> 1.1.0)
./scripts/release.sh minor

# Create a major release (1.0.0 -> 2.0.0)
./scripts/release.sh major

# You can also use the npm script
pnpm run release
```

### What it does

1. **Validates environment**: Checks for uncommitted changes and ensures you're ready to release
2. **Runs quality checks**: Executes linting, formatting, and type checking
3. **Builds the project**: Compiles TypeScript and prepares distribution files
4. **Bumps version**: Updates package.json with the new version number
5. **Creates DXT package**: Builds the Claude Desktop extension package
6. **Creates and pushes Git tag**: Tags the release and pushes to GitHub
7. **Triggers GitHub Actions**: The tag push automatically triggers the release workflow

### GitHub Actions Release Workflow

Once the tag is pushed, GitHub Actions will:

1. Build and test the project
2. Create both DXT and NPM packages
3. Create a GitHub release with:
   - Automated release notes
   - Downloadable `.dxt` file for Claude Desktop
   - Downloadable `.tgz` file for npm installation
   - Source code archives
4. Optionally publish to GitHub npm registry

### Manual Release Alternative

You can also create releases manually through the GitHub web interface:

1. Go to your repository on GitHub
2. Click "Releases" → "Create a new release"
3. Choose a tag (e.g., `v1.0.1`) or create a new one
4. Add release notes
5. Publish the release

The GitHub Actions workflow will automatically build and attach the packages.
