#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { parseArgs } from 'node:util';

// Import your tools
import { registerJsonQueryTool, registerJsonSchemaGeneratorTool } from './tools/json-query.js';

interface ServerOptions {
  verbose: boolean;
  maxResults: number;
  workspace: string;
}

class OrcaMCPServer {
  private server: McpServer;
  private options: ServerOptions;

  constructor(options: ServerOptions) {
    this.options = options;

    this.server = new McpServer({
      name: 'my-mcp-server',
      version: '1.0.0',
    });

    this.registerTools();

    if (this.options.verbose) {
      console.error('Server starting with options:', this.options);
      console.error(`Node version: ${process.version}`);
      console.error(`Platform: ${process.platform}`);
    }
  }

  private registerTools() {
    // Register your tools here
    registerJsonQueryTool(this.server);
    registerJsonSchemaGeneratorTool(this.server);
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);

    // Keep the server running
    process.on('SIGINT', async () => {
      if (this.options.verbose) {
        console.error('Server shutting down...');
      }
      await this.server.close();
      process.exit(0);
    });
  }
}

// Parse command line arguments
function parseCliArgs(): ServerOptions {
  try {
    const { values } = parseArgs({
      args: process.argv.slice(2),
      options: {
        verbose: {
          type: 'string',
          default: 'false',
        },
        'max-results': {
          type: 'string',
          default: '100',
        },
        workspace: {
          type: 'string',
          default: './workspace',
        },
      },
      allowPositionals: false,
    });

    return {
      verbose: values.verbose === 'true',
      maxResults: parseInt(values['max-results'] as string, 10),
      workspace: values.workspace as string,
    };
  } catch (error) {
    console.error('Error parsing arguments:', error);
    process.exit(1);
  }
}

// Start the server
const options = parseCliArgs();
const server = new OrcaMCPServer(options);
server.run().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
