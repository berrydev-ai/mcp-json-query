import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

export function registerGreetingTool(server: McpServer) {
  server.registerTool(
    'greeting',
    {
      title: 'Greeting Tool',
      description: 'Generate a personalized greeting in different languages',
      inputSchema: {
        name: z.string().describe('The name of the person to greet'),
        language: z.enum(['en', 'es', 'fr']).optional().describe('The language for the greeting (default: en)')
      }
    },
    async ({ name, language = 'en' }) => {
      const greetings = {
        en: `Hello, ${name}! Welcome to our MCP server.`,
        es: `¡Hola, ${name}! Bienvenido a nuestro servidor MCP.`,
        fr: `Bonjour, ${name}! Bienvenue sur notre serveur MCP.`
      };

      const greeting = greetings[language] || greetings.en;

      return {
        content: [
          {
            type: 'text',
            text: greeting
          }
        ]
      };
    }
  );
}
