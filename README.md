# Giraffe Media Orca MCP Server

Model Context Protocol (MCP) server for the Orca platform.


## MCP Installation

Add the following to your Claude Desktop MCP server configuration:

```
{
  "mcpServers": {
    "orca-mcp": {
      "command": "npx",
      "args": [
        "@giraffemedia/orca-mcp@1.0.3",
        "--verbose=true",
        "--max-results=1000",
        "--workspace=C:\\Data",
        "--file-uri=s3://giraffe-media-content/mcp-data/orca.json"
      ],
      "env": {
        "NODE_ENV": "production",
        "API_KEY": "TEST",
        "DEBUG": "true",
        "AWS_ACCESS_KEY_ID": "YOUR_ACCESS_KEY_ID",
        "AWS_SECRET_ACCESS_KEY": "YOUR_SECRET_ACCESS_KEY",
        "AWS_REGION": "YOUR_AWS_REGION"
      }
    }
  }
}
```

## Project Structure

```
orca-mcp/
├─ src/
│   ├─ index.ts                # Main server file
│   └─ tools/
│       └─ json-query.ts       # JSON query tool
├─ dist/                       # Compiled JavaScript (generated)
├─ extensions/                 # Packaged DXT extensions
├─ package.json                # Dependencies and scripts
├─ tsconfig.json               # TypeScript configuration
├─ manifest.json               # DXT manifest
└─ README.md                   # This file
```

## Setup Instructions

### 1. Pull the Repository

```bash
git clone https://github.com/giraffemedia/orca-mcp.git
cd orca-mcp
```

### 2. Initialize and Install Dependencies

```bash
# Install dependencies
yarn install
```

**Key Dependencies:**

- `@modelcontextprotocol/sdk` - The official MCP TypeScript SDK
- `@modelcontextprotocol/dxt` - The official Desktop Extension Toolkit
- `zod` - Schema validation library (required for tool input validation)

### 3. Build the Project

```bash
yarn build
```

### 4. Test Locally

```bash
yarn dev
```

The server will start and listen on stdin/stdout. You can test it by sending JSON-RPC messages or integrate it with Claude Desktop directly.

## Development Workflow

### Adding New Tools

1. Create a new file in `src/tools/` (e.g., `src/tools/mytool.ts`)
2. Follow this pattern:

```typescript
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

export function registerMyTool(server: McpServer) {
  server.registerTool(
    'mytool',
    {
      title: 'My Tool',
      description: 'Description of what this tool does',
      inputSchema: {
        param1: z.string().describe('Description of param1'),
        param2: z.number().optional().describe('Optional description of param2'),
      },
    },
    async ({ param1, param2 }) => {
      // Your tool logic here
      return {
        content: [
          {
            type: 'text',
            text: `Result: ${param1}`,
          },
        ],
      };
    }
  );
}
```

3. Import and register it in `src/index.ts`:

```typescript
import { registerMyTool } from './tools/mytool.js';

// In the registerTools() method:
registerMyTool(this.server);
```

4. Update `manifest.json` to include the new tool:

```json
{
  "tools": [
    // ... existing tools
    {
      "name": "mytool",
      "description": "Description of what this tool does"
    }
  ]
}
```

5. **Update the changelog:**

```bash
# Add changelog entry for your new tool
yarn changelog:add added "New tool for handling X functionality"
```

### Changelog Management

This project uses a comprehensive changelog system. See [docs/CHANGELOG_GUIDE.md](./docs/CHANGELOG_GUIDE.md) for details.

```bash
# Add changelog entries as you develop
yarn changelog:add added "New JSON validation feature"
yarn changelog:add fixed "Bug in nested object parsing"

# Create releases with automatic changelog integration
yarn run release  # Will prompt for changelog updates
```

### Building and Testing

```bash
# Clean build
yarn clean && yarn build

# Development build and run
yarn dev

# Validate your manifest
yarn dxt:validate
```

## Creating a DXT Extension

### 1. Build the Project

```bash
yarn build
```

### 2. Update manifest.json

Edit the `manifest.json` file with your specific details:

- Update `name`, `version`, `description`, `author`
- Add any user configuration options you need
- List all your tools

### 3. Create the DXT File

```bash
yarn dxt:pack
```

This will create a `.dxt` file in your project's `extensions` directory.

### 4. Install in Claude Desktop

1. Double-click the `.dxt` file, or
2. Open Claude Desktop → Settings → Extensions → Install Extension
3. Select your `.dxt` file

## Example Tool Usage

Once installed in Claude Desktop, you can use the tools:

**Calculator:**

- "Calculate 15 + 27"
- "What's 144 divided by 12?"

**Greeting:**

- "Greet John in Spanish"
- "Say hello to Maria"

## Debugging

### Common Issues

1. **Build errors**: Check your TypeScript syntax
2. **Import errors**: Ensure all imports use `.js` extensions for compiled files
3. **Tool not found**: Verify the tool is registered in `src/index.ts`
4. **DXT validation fails**: Run `npm run dxt:validate` to check your manifest

### Logging

Add console logging to debug your tools:

```typescript
console.error('Debug info:', JSON.stringify(args));
```

Logs will appear in Claude Desktop's extension logs.

## Advanced Configuration

### Adding User Configuration

Update `manifest.json` to collect user settings:

```json
{
  "userConfig": {
    "type": "object",
    "properties": {
      "apiKey": {
        "type": "string",
        "description": "Your API key",
        "sensitive": true
      },
      "baseUrl": {
        "type": "string",
        "description": "Base URL for API calls",
        "default": "https://api.example.com"
      }
    },
    "required": ["apiKey"]
  }
}
```

Access user config in your tools via server context.

### Adding Prompts or Resources

The server can also provide prompts and resources. Add handlers in `src/index.ts` similar to the tool handlers.

## LICENSE

This is a private project owned by Giraffe Media Group.
