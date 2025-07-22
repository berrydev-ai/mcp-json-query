# Release Notes Customization Guide

This document explains how to customize the release notes template for your MCP server releases.

## Template Location

The release notes template is located at:

```
.github/templates/release-notes.md
```

## Available Placeholders

You can use these placeholders in your template, which will be automatically replaced during the release process:

| Placeholder            | Description                               | Example                                |
| ---------------------- | ----------------------------------------- | -------------------------------------- |
| `{{VERSION}}`          | Release version with 'v' prefix           | `v1.2.3`                               |
| `{{PACKAGE_VERSION}}`  | Package version without prefix            | `1.2.3`                                |
| `{{PACKAGE_NAME}}`     | Package name from package.json            | `mcp-json-query`                       |
| `{{DESCRIPTION}}`      | Package description from package.json     | `JSON Query MCP Server`                |
| `{{CHANGELOG}}`        | Auto-generated changelog from git commits | `- Added new feature`<br>`- Fixed bug` |
| `{{BUILD_DATE}}`       | UTC timestamp of build                    | `2024-01-15 14:30:22 UTC`              |
| `{{COMMIT_SHA}}`       | Full git commit hash                      | `abc123def456...`                      |
| `{{COMMIT_SHA_SHORT}}` | Short git commit hash                     | `abc123d`                              |

## Changelog Generation

The changelog is automatically generated from git commits between releases:

- **First Release**: Shows \"Initial Release\" message
- **Subsequent Releases**: Lists commit messages since the last tag
- **Commit Format**: Uses git log format: `- Commit message`
- **Limit**: Shows maximum 20 most recent commits
- **Filtering**: Excludes merge commits

### Improving Changelog Quality

To get better changelogs, use conventional commit messages:

```bash
git commit -m \"feat: add JSON schema generation\"
git commit -m \"fix: handle large files better\"
git commit -m \"docs: update installation instructions\"
git commit -m \"chore: bump version to 1.2.3\"
```

## Customization Examples

### Adding Custom Sections

Add new sections to your template:

```markdown
## 🐛 Bug Fixes

- Fixed JSON parsing for large files
- Improved error handling

## ⚡ Performance

- 50% faster JSONPath queries
- Reduced memory usage
```

### Including Environment Info

Add system requirements or compatibility info:

```markdown
## 🔧 System Requirements

- Node.js >= {{MIN_NODE_VERSION}}
- Claude Desktop >= 1.0.0
- Memory: 512MB RAM minimum
```

### Custom Installation Instructions

Tailor installation steps for your specific use case:

```markdown
## 🚀 Quick Start

1. Download `{{PACKAGE_NAME}}-{{PACKAGE_VERSION}}.dxt`
2. Open Claude Desktop
3. Install the extension
4. Try: \"Query my JSON file for all users\"
```

### Adding Screenshots or GIFs

Include visual aids (make sure to add the files to your repo):

```markdown
## 📸 Screenshots

![JSON Query Demo](./docs/demo.gif)

![Schema Generation](./docs/schema-example.png)
```

## Template Structure Best Practices

### 1. Clear Hierarchy

Use proper heading levels (H1 for title, H2 for main sections, H3 for subsections).

### 2. Scannable Content

- Use emojis for visual appeal
- Include tables for structured information
- Add code blocks for examples

### 3. User-Focused

- Lead with benefits, not technical details
- Provide clear installation steps
- Include usage examples

### 4. Complete Information

- List all download options
- Include troubleshooting links
- Add contact/support information

## Testing Your Template

Before releasing, you can test your template locally:

```bash
# Preview the template with example data
cat .github/templates/release-notes.md | \\
  sed 's/{{VERSION}}/v1.0.0/g' | \\
  sed 's/{{PACKAGE_NAME}}/mcp-json-query/g' | \\
  sed 's/{{CHANGELOG}}/- Test changelog entry/g'
```

## Fallback Behavior

If the template file is missing, the release workflow will use a simple fallback template. To ensure your custom template is used, make sure:

1. The file exists at `.github/templates/release-notes.md`
2. The file is committed to your repository
3. All required placeholders are included

## Advanced Customization

For more complex release note generation, you can:

1. **Add custom shell scripts** in the workflow to process data
2. **Use GitHub API** to fetch additional information
3. **Include external data** like download counts or metrics
4. **Generate different templates** for different release types (major/minor/patch)

## Example Template Variations

### Minimal Template

```markdown
# {{PACKAGE_NAME}} {{VERSION}}

{{CHANGELOG}}

Download: See assets below.
```

### Detailed Template

```markdown
# 🦒 {{PACKAGE_NAME}} {{VERSION}}

> {{DESCRIPTION}}

## What's New

{{CHANGELOG}}

## Installation

[Detailed installation steps...]

## Documentation

[Links to docs, examples, etc...]

## Support

[Contact information...]
```

Remember to commit your template changes before creating a release!
