import * as fs from 'fs/promises';

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import generator from 'json-schema-generator';
import { JSONPath } from 'jsonpath-plus';
import { z } from 'zod';


export function registerJsonQueryTool(server: McpServer) {
  server.registerTool(
    'json_query',
    {
      title: 'JSON Query Tool',
      description: 'Perform JSONPath queries on JSON files',
      inputSchema: {
        filePath: z.string().describe('Path to the JSON file to query'),
        query: z.string().describe('JSONPath query string (e.g., "$.key" or "$[*].name")'),
      },
    },
    async ({ filePath, query }) => {
      try {
        // Read and parse the JSON file
        const fileContent = await fs.readFile(filePath, 'utf-8');
        const jsonData = JSON.parse(fileContent);

        // Perform JSONPath query
        const results = JSONPath({ path: query, json: jsonData });

        const response = {
          data: results,
          count: Array.isArray(results) ? results.length : results !== undefined ? 1 : 0,
          query: query,
          status: 'success',
          error: null,
        };

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(response, null, 2),
            },
          ],
        };
      } catch (error) {
        const errorResponse = {
          data: null,
          count: 0,
          query: query,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error occurred',
        };

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(errorResponse, null, 2),
            },
          ],
        };
      }
    }
  );
}

export function registerJsonSchemaGeneratorTool(server: McpServer) {
  server.registerTool(
    'generate_json_schema',
    {
      title: 'JSON Schema Generator',
      description: 'Generate a JSON Schema from a JSON file',
      inputSchema: {
        filePath: z.string().describe('Path to the JSON file to analyze and generate schema from'),
      },
    },
    async ({ filePath }) => {
      try {
        // Read and parse the JSON file
        const fileContent = await fs.readFile(filePath, 'utf-8');
        const jsonData = JSON.parse(fileContent);

        // Generate schema using the json-schema-generator library
        const schema = generator(jsonData);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(schema, null, 2),
            },
          ],
        };
      } catch (error) {
        throw new Error(
          `Schema generation failed: ${error instanceof Error ? error.message : 'Unknown error occurred'}`
        );
      }
    }
  );
}
