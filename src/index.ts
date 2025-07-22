#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

// Import your tools
import { registerJsonQueryTool, registerJsonSchemaGeneratorTool } from './tools/json-query.js';
import { S3SyncService } from './services/s3-sync.js';
import { parseCliArgs } from './utils/cli.js'

interface ServerOptions {
  verbose: boolean;
  maxResults: number;
  fileUri?: string;
}

class JSONQueryMCPServer {
  private server: McpServer;
  private options: ServerOptions;
  private syncCompleted = false;

  constructor(options: ServerOptions) {
    this.options = options;

    this.server = new McpServer({
      name: 'mcp-json-query',
      version: '1.0.0',
    });

    this.registerTools();

    if (this.options.verbose) {
      console.error('Server starting with options:', this.options);
      console.error(`Node version: ${process.version}`);
      console.error(`Platform: ${process.platform}`);
    }
  }

  private getTargetDirectory(): string {
    // For MCP servers, the client typically controls where files should be placed
    // In most cases, this will be the current working directory or a directory
    // that the client has specified as the workspace root

    const targetDir = process.cwd();

    if (this.options.verbose) {
      console.error(`Using target directory: ${targetDir}`);
    }

    return targetDir;
  }

  private registerTools() {
    registerJsonQueryTool(this.server);
    registerJsonSchemaGeneratorTool(this.server);
  }

  async run() {
    // Sync S3 file before starting the server
    if (this.options.fileUri) {
      await this.syncFromS3();
    }

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

  private async syncFromS3(): Promise<void> {
    if (!this.options.fileUri || this.syncCompleted) return;

    if (!S3SyncService.isS3Uri(this.options.fileUri)) {
      throw new Error(`Invalid S3 URI: ${this.options.fileUri}`);
    }

    try {
      const targetDir = this.getTargetDirectory();
      const s3Sync = new S3SyncService({
        verbose: this.options.verbose,
        preserveDirectoryStructure: false
      });

      if (this.options.verbose) {
        console.error(`Syncing ${this.options.fileUri} to ${targetDir}`);
      }

      await s3Sync.syncToRoot(this.options.fileUri, targetDir);
      this.syncCompleted = true;

      if (this.options.verbose) {
        console.error('S3 sync completed successfully');
      }
    } catch (error) {
      console.error('S3 sync failed:', error);
      console.error('Server will continue without S3 data');
      // Don't throw - allow server to continue without S3 data
    }
  }
}

// Start the server
const options = parseCliArgs();
const server = new JSONQueryMCPServer(options);
server.run().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
