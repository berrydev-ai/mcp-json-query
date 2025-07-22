// utils/cli.ts
interface ServerOptions {
  verbose: boolean;
  maxResults: number;
  fileUri?: string;
}

export function parseCliArgs(): ServerOptions {
  const args = process.argv.slice(2);

  const options: ServerOptions = {
    verbose: false,
    maxResults: 100,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case '--verbose':
      case '-v':
        options.verbose = true;
        break;

      case '--max-results':
      case '-m':
        const maxResults = parseInt(args[i + 1]);
        if (isNaN(maxResults) || maxResults <= 0) {
          throw new Error('--max-results must be a positive integer');
        }
        options.maxResults = maxResults;
        i++; // Skip the next argument since we consumed it
        break;

      case '--s3-uri':
      case '-s':
        options.fileUri = args[i + 1];
        if (!options.fileUri) {
          throw new Error('--s3-uri requires a valid S3 URI');
        }
        i++; // Skip the next argument since we consumed it
        break;

      case '--help':
      case '-h':
        console.log(`
Usage: mcp-json-query [options]

Options:
  -v, --verbose                Enable verbose logging
  -m, --max-results <number>   Maximum number of results to return (default: 100)
  -s, --s3-uri <uri>          S3 URI to sync from (optional)
  -h, --help                  Show this help message

This server uses MCP roots for filesystem access. Your MCP client must provide
filesystem roots for the server to operate when syncing from S3.

Examples:
  mcp-json-query --verbose --s3-uri s3://bucket/file.json
  mcp-json-query --s3-uri s3://bucket/data.json --max-results 50
        `);
        process.exit(0);
        break;

      default:
        if (arg.startsWith('-')) {
          console.error(`Unknown option: ${arg}`);
          console.error('Use --help to see available options');
          process.exit(1);
        } else {
          console.error(`Unexpected argument: ${arg}`);
          console.error('Use --help to see usage information');
          process.exit(1);
        }
        break;
    }
  }

  return options;
}
