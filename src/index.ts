import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

// Import your tools
import { registerCalculatorTool } from './tools/calculator.js';
import { registerGreetingTool } from './tools/greeting.js';

class MyMcpServer {
  private server: McpServer;

  constructor() {
    this.server = new McpServer({
      name: 'my-mcp-server',
      version: '1.0.0',
    });

    this.registerTools();
  }

  private registerTools() {
    // Register your tools here
    registerCalculatorTool(this.server);
    registerGreetingTool(this.server);

    // Add more tools by calling their register functions
    // registerYourNewTool(this.server);
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);

    // Keep the server running
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }
}

// Start the server
const server = new MyMcpServer();
server.run().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
