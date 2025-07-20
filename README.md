# Simple MCP Server Project

A clean, minimal TypeScript MCP server project structure for building Desktop Extensions (DXT).

**Updated for MCP SDK v1.16.0** - Uses the latest `McpServer` API with Zod schemas instead of the legacy `Server` API.

## Project Structure

```
my-mcp-server/
├── src/
│   ├── index.ts                 # Main server file
│   └── tools/
│       ├── calculator.ts        # Calculator tool
│       └── greeting.ts          # Greeting tool
├── dist/                        # Compiled JavaScript (generated)
├── package.json                 # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
├── manifest.json               # DXT manifest
└── README.md                   # This file
```

## Setup Instructions

### 1. Create Project Directory
```bash
mkdir my-mcp-server
cd my-mcp-server
```

### 2. Initialize and Install Dependencies
```bash
# Copy all the provided files into your project directory
# Then install dependencies:
npm install

# Install the DXT CLI globally (if not already installed)
npm install -g @anthropic-ai/dxt
```

**Key Dependencies:**
- `@modelcontextprotocol/sdk` - The official MCP TypeScript SDK
- `zod` - Schema validation library (required for tool input validation)

### 3. Build the Project
```bash
npm run build
```

### 4. Test Locally
```bash
npm run dev
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
        param2: z.number().optional().describe('Optional description of param2')
      }
    },
    async ({ param1, param2 }) => {
      // Your tool logic here
      return {
        content: [
          {
            type: 'text',
            text: `Result: ${param1}`
          }
        ]
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

### Building and Testing

```bash
# Clean build
npm run clean && npm run build

# Development build and run
npm run dev

# Validate your manifest
npm run dxt:validate
```

## Creating a DXT Extension

### 1. Build the Project
```bash
npm run build
```

### 2. Update manifest.json
Edit the `manifest.json` file with your specific details:
- Update `name`, `version`, `description`, `author`
- Add any user configuration options you need
- List all your tools

### 3. Create the DXT File
```bash
npm run dxt:pack
```

This will create a `.dxt` file in your project directory.

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

## Next Steps

1. Build your custom tools
2. Test thoroughly
3. Package as DXT
4. Distribute to users

This structure scales well - just add new tool files and register them!
