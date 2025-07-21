# Giraffe Orca MCP Server {{VERSION}}

> **JSON Query & Schema Generation MCP Server for Claude Desktop**

{{DESCRIPTION}}

---

## 🚀 What's New in {{VERSION}}

{{CHANGELOG}}

---

## 🎯 Features

- **JSONPath Queries**: Perform powerful JSONPath queries on large JSON files
- **Schema Generation**: Automatically generate JSON schemas from JSON files
- **Claude Desktop Integration**: Native MCP server integration with Claude Desktop
- **High Performance**: Optimized for handling large JSON datasets
- **Type Safety**: Built with TypeScript for reliability and better development experience

## 📦 Installation

### Option 1: Claude Desktop (Recommended)

1. **Download** the `.dxt` file from the assets below
2. **Install** by double-clicking the `.dxt` file or through Claude Desktop:
   - Open Claude Desktop
   - Go to Settings → Extensions
   - Click "Install Extension"
   - Select the downloaded `.dxt` file

### Option 2: NPM Installation

```bash
# From downloaded package
npm install ./{{PACKAGE_NAME}}-{{PACKAGE_VERSION}}.tgz

# From GitHub Registry
npm install @berrydev-ai/{{PACKAGE_NAME}}
```

### Option 3: Direct from Source

```bash
git clone https://github.com/berrydev-ai/giraffe-orca-mcp.git
cd giraffe-orca-mcp
yarn install
yarn build
yarn dxt:pack
```

---

## 🛠️ Usage Examples

Once installed in Claude Desktop, you can use these powerful JSON operations:

### JSONPath Queries
```
Query my JSON file at /path/to/data.json for all users with $.users[*].name
```

### Schema Generation
```
Generate a JSON schema for the file at /path/to/sample.json
```

### Real-world Example
```
Find all products with price greater than $100 in my inventory file using $.products[?(@.price > 100)]
```

---

## 🔧 Technical Details

- **Node.js**: Requires >= 20.0.0
- **Runtime**: MCP Server compatible with Claude Desktop
- **Dependencies**: Uses `jsonpath-plus` for query processing
- **File Support**: Handles large JSON files efficiently
- **Output Format**: Structured responses with data, count, status, and error fields

---

## 📋 Available Downloads

| Package Type | Description | Use Case |
|-------------|-------------|----------|
| **{{PACKAGE_NAME}}-{{PACKAGE_VERSION}}.dxt** | Claude Desktop Extension | Direct installation in Claude Desktop |
| **{{PACKAGE_NAME}}-{{PACKAGE_VERSION}}.tgz** | NPM Package | Manual npm installation or development |
| **Source Code** | Full source archives | Development and customization |

---

## 🔗 Resources

- **Documentation**: [README.md](https://github.com/berrydev-ai/giraffe-orca-mcp#readme)
- **Issues**: [Report bugs or request features](https://github.com/berrydev-ai/giraffe-orca-mcp/issues)
- **JSONPath Syntax**: [JSONPath Documentation](https://github.com/JSONPath-Plus/JSONPath#syntax-through-examples)

---

## 🏗️ Build Information

- **Version**: {{PACKAGE_VERSION}}
- **Build Date**: {{BUILD_DATE}}
- **Commit**: [`{{COMMIT_SHA_SHORT}}`](https://github.com/berrydev-ai/giraffe-orca-mcp/commit/{{COMMIT_SHA}})
- **Node.js Compatibility**: >= 20.0.0

---

**Happy querying! 🦒🐋**
