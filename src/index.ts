#!/usr/bin/env node

import { parseArgs } from 'node:util';

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

// Import your tools
import { registerJsonQueryTool, registerJsonSchemaGeneratorTool } from './tools/json-query.js';
import { S3SyncService } from './services/s3-sync.js';
import { join } from 'path';

interface ServerOptions {
  verbose: boolean;
  maxResults: number;
  workspace: string;
  fileUri?: string;
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
    // Perform S3 sync if file-uri is provided
    if (this.options.fileUri && S3SyncService.isS3Uri(this.options.fileUri)) {
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
    if (!this.options.fileUri) {
      return;
    }

    try {
      const s3Sync = new S3SyncService({ verbose: this.options.verbose });

      // Extract filename from S3 URI for local path
      const s3UriParts = this.options.fileUri.split('/');
      const filename = s3UriParts[s3UriParts.length - 1];
      const localPath = join(this.options.workspace, filename);

      if (this.options.verbose) {
        console.error(`🌊 Starting S3 sync process for ${this.options.fileUri}`);
      }

      const wasDownloaded = await s3Sync.syncFile(this.options.fileUri, localPath);

      if (wasDownloaded) {
        console.error(`✅ File synchronized from S3: ${filename}`);
      } else if (this.options.verbose) {
        console.error(`✅ Local file is already up to date: ${filename}`);
      }

    } catch (error) {
      const err = error as { message: string };
      console.error(`❌ S3 sync failed: ${err.message}`);

      // Don't exit - continue with server startup using existing local file if available
      if (this.options.verbose) {
        console.error('⚠️  Continuing with server startup - will use existing local files if available');
      }
    }
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
        'file-uri': {
          type: 'string',
        },
      },
      allowPositionals: false,
    });

    return {
      verbose: values.verbose === 'true',
      maxResults: parseInt(values['max-results'] as string, 10),
      workspace: values.workspace as string,
      fileUri: values['file-uri'] as string | undefined,
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
