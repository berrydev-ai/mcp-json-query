# Claude Code Instructions for MCP Server Project

This document provides context and guidelines for Claude Code when working on this TypeScript-based Model Context Protocol (MCP) server project designed for Desktop Extensions (DXT).

## Project Overview

This is a clean, minimal TypeScript MCP server project that compiles to Node.js and packages into DXT files for one-click installation in Claude Desktop and other MCP-enabled applications.

**Key Goals:**
- Keep the project structure simple and beginner-friendly
- Maintain clean separation of concerns with tools in separate files
- Ensure type safety throughout
- Make it easy to add new tools, prompts, and resources
- Generate production-ready DXT extensions

## Project Structure

```
giraffe-orca-mcp/
├── src/
│   ├── index.ts               # Main server entry point
│   └── tools/
│       ├── calculator.ts      # Example calculator tool
│       └── greeting.ts        # Example greeting tool
├── dist/                       # Compiled JavaScript output
├── package.json                # NPM configuration and scripts
├── tsconfig.json               # TypeScript compiler configuration
├── manifest.json               # DXT extension manifest
├── .gitignore                  # Git ignore rules
├── README.md                   # User documentation
└── CLAUDE.md                   # This file - Claude Code instructions
```

## Development Patterns and Conventions

### 1. Tool Development Pattern

**Every tool should follow this exact pattern:**

```typescript
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

export function registerToolName(server: McpServer) {
  server.registerTool(
    'tool_name',
    {
      title: 'Tool Name',
      description: 'Clear, concise description of what this tool does',
      inputSchema: {
        param1: z.string().describe('Clear description of this parameter'),
        param2: z.number().optional().describe('Optional parameter description')
      }
    },
    async ({ param1, param2 }) => {
      try {
        // Tool logic here
        const result = doSomething(param1, param2);

        return {
          content: [
            {
              type: 'text',
              text: `Result: ${result}`
            }
          ]
        };
      } catch (error) {
        throw new Error(`Tool execution failed: ${error.message}`);
      }
    }
  );
}
```

### 2. File Naming Conventions

- Tool files: `src/tools/descriptive-name.ts` (kebab-case)
- Function names: `registerDescriptiveName` (camelCase)
- No TypeScript interfaces needed (Zod handles typing)
- Tool names in manifest: `descriptive_name` (snake_case)

### 3. Import/Export Patterns

**Always use these exact import patterns:**

```typescript
// For MCP SDK imports, always use .js extensions
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

// For Zod schemas (required for input validation)
import { z } from 'zod';

// For local imports, use .js extensions (TypeScript requirement)
import { registerToolName } from './tools/tool-name.js';
```

### 4. Error Handling

- Always wrap tool logic in try-catch blocks
- Throw descriptive errors with context
- Validate inputs before processing
- Handle edge cases gracefully

### 5. Type Safety and Schema Validation

- Use Zod schemas for all tool input validation
- Leverage Zod's built-in type inference for parameters
- Use `.optional()` for non-required parameters
- Use `.describe()` for parameter documentation
- No separate TypeScript interfaces needed

## Adding New Tools

When asked to create a new tool, follow these steps:

### 1. Create the Tool File
- Create `src/tools/[tool-name].ts`
- Follow the exact pattern shown above
- Include comprehensive input validation
- Add meaningful error messages

### 2. Register in Main Server
Add to `src/index.ts` in the `registerTools()` method:

```typescript
import { registerYourNewTool } from './tools/your-new-tool.js';

private registerTools() {
  // Existing tools...
  registerYourNewTool(this.server);
}
```

### 3. Update Manifest
Add tool definition to `manifest.json`:

```json
{
  "tools": [
    {
      "name": "your_new_tool",
      "description": "Brief description for the extension directory"
    }
  ]
}
```

## Common Development Tasks

### Adding External Dependencies
When adding new npm packages:
1. Add to `package.json` dependencies
2. Import with proper TypeScript types if available
3. Add `@types/package-name` to devDependencies if needed

### File System Operations
If tools need file access:
1. Use Node.js `fs/promises` for async operations
2. Respect DXT sandbox limitations
3. Add appropriate permissions to `manifest.json` if needed

### Network Operations
For HTTP/API calls:
1. Use native `fetch` (Node.js 18+) or add `axios`
2. Implement proper error handling and timeouts
3. Add network permissions to manifest if needed

### Configuration Parameters
For user-configurable tools:
1. Add parameters to `manifest.json` `userConfig`
2. Mark sensitive data with `"sensitive": true`
3. Access via server context in tool handlers

## Build and Development Workflow

### Available NPM Scripts
- `npm run build` - Compile TypeScript to JavaScript
- `npm run dev` - Build and run for development
- `npm run clean` - Remove dist directory
- `npm run dxt:validate` - Validate manifest.json
- `npm run dxt:pack` - Build and create .dxt file

### Development Process
1. Make changes to TypeScript files in `src/`
2. Run `npm run build` to compile
3. Test with `npm run dev`
4. Validate with `npm run dxt:validate`
5. Package with `npm run dxt:pack` for distribution

## DXT-Specific Considerations

### Manifest Requirements
- Keep tool descriptions user-friendly (not technical)
- Use semantic versioning for `version`
- Declare all permissions your tools need
- Mark sensitive configuration as `"sensitive": true`

### Runtime Environment
- Assume Node.js environment with built-in modules available
- No access to system-level operations beyond granted permissions
- Communication happens via stdio (JSON-RPC)
- Process lifecycle managed by host application

### Distribution
- Final `.dxt` file contains compiled JavaScript, not TypeScript
- All dependencies must be bundled or declared
- File size matters - keep extensions lean
- Cross-platform compatibility required

## Code Quality Standards

### TypeScript Configuration
- Strict mode enabled - no loose type checking
- ES2020 target for modern JavaScript features
- CommonJS modules for Node.js compatibility
- Source maps disabled for production builds

### Code Style
- Use meaningful variable and function names
- Include JSDoc comments for complex functions
- Keep functions focused and single-purpose
- Use async/await instead of Promises.then()
- Handle all error cases explicitly

### Testing Approach
- Test tools manually with `npm run dev`
- Validate JSON schemas before deployment
- Test DXT installation in Claude Desktop
- Verify error handling with invalid inputs

## 🚨 CRITICAL: MANDATORY ERROR CHECKING 🚨

**Claude Code MUST follow this process after writing ANY code:**

### Step-by-Step Error Resolution Protocol

**1. ALWAYS run compilation check:**
```bash
npm run build
```

**2. If ANY errors appear:**
- Stop immediately
- Read each error message carefully
- Fix errors in the order they appear
- Re-run `npm run build` after each fix
- Continue until ZERO errors

**3. If ANY warnings appear:**
- Treat warnings as errors
- Fix all warnings before proceeding
- Re-run `npm run build` until clean

**4. Only after clean build:**
- Test with `npm run dev`
- Validate with `npm run dxt:validate`
- Declare task complete

### Example Error-Fix Cycle

```bash
# Write code...

# MANDATORY: Check for errors
npm run build
# ❌ Error: Cannot find module './tools/weather.js'

# Fix the import path
# Re-check
npm run build
# ❌ Error: 'z' is not defined

# Add missing Zod import
# Re-check
npm run build
# ✅ Success: No errors, no warnings

# Now test
npm run dev
# ✅ Server starts successfully

# Task is complete
```

**NEVER submit code without running this full cycle!**

### If Stuck on Errors

**If Claude Code cannot resolve a TypeScript error:**

1. **Show the exact error message** and which file/line it occurs on
2. **Show the current code** that's causing the issue
3. **Explain what fix was attempted** and why it didn't work
4. **Ask for guidance** rather than guessing

**Common "I'm Stuck" Scenarios:**
- Complex type inference issues
- Module resolution problems
- Version compatibility conflicts
- Zod schema validation errors

**Template for asking for help:**
```
I encountered a TypeScript error I cannot resolve:

Error: [exact error message]
File: [filename:line]
Code: [show problematic code]
Attempted Fix: [what I tried]
Result: [what happened]

Could you help me understand how to fix this?
```

## Success Criteria Summary

A well-implemented tool should:
- ✅ Compile without TypeScript errors (`npm run build` succeeds)
- ✅ Compile without TypeScript warnings (zero warnings)
- ✅ Follow the established patterns exactly
- ✅ Include proper error handling and Zod validation
- ✅ Have clear, user-friendly descriptions
- ✅ Start successfully (`npm run dev` works)
- ✅ Pass manifest validation (`npm run dxt:validate` passes)
- ✅ Work when packaged as a DXT extension
- ✅ Be easily understood by TypeScript beginners

## Final Reminder for Claude Code

**The golden rule:** Never consider a coding task complete until:
1. `npm run build` completes with ZERO errors and ZERO warnings
2. `npm run dev` starts the server successfully
3. `npm run dxt:validate` passes without issues

**If any step fails, the code is not ready and must be fixed first.**

Remember: This project prioritizes simplicity, maintainability, and correctness. A working, error-free solution is always better than a complex one with TypeScript issues.

### 1. Mandatory TypeScript Compilation Check
**Always run these commands after writing code:**
```bash
# Clean previous build
npm run clean

# Attempt to compile and catch all errors
npm run build
```

### 2. TypeScript Error Resolution Protocol

**If compilation fails, follow this exact process:**

#### Step 1: Import/Export Issues
- Verify all imports use `.js` extensions for local files
- Check that all imports actually exist in the target files
- Ensure proper export statements in imported modules

#### Step 2: Type Safety Issues
- Ensure all Zod schemas are properly defined
- Check that function parameters match the schema definitions
- Verify return types match expected MCP tool response format

#### Step 3: Missing Dependencies
- Verify all required packages are in `package.json`
- Check for missing type definitions (`@types/*` packages)
- Ensure version compatibility between packages

### 3. Common TypeScript Fixes

**Import Resolution Errors:**
```typescript
// ❌ Wrong
import { registerTool } from './tools/mytool';

// ✅ Correct
import { registerTool } from './tools/mytool.js';
```

**Missing Zod Imports:**
```typescript
// ❌ Missing
export function registerTool(server: McpServer) {
  server.registerTool('name', {
    inputSchema: {
      param: z.string() // Error: z is not defined
    }
  });
}

// ✅ Fixed
import { z } from 'zod';
export function registerTool(server: McpServer) {
  server.registerTool('name', {
    inputSchema: {
      param: z.string().describe('Parameter description')
    }
  });
}
```

**Type Annotation Issues:**
```typescript
// ❌ Wrong - manual typing when Zod handles it
async ({ param1, param2 }: { param1: string, param2?: number }) => {

// ✅ Correct - let Zod infer types
async ({ param1, param2 }) => {
```

### 4. Error Resolution Workflow

When TypeScript compilation fails, follow this order:

1. **Read the error message carefully** - identify the exact file and line
2. **Check imports first** - most errors are import/export issues
3. **Verify Zod schemas** - ensure all parameters are properly defined
4. **Check function signatures** - ensure they match the established patterns
5. **Test the fix** - run `npm run build` again
6. **Repeat until clean** - continue until zero TypeScript errors

### 5. Pre-Completion Checklist

Before considering any code task complete, verify:

- [ ] `npm run build` completes with zero errors
- [ ] `npm run build` completes with zero warnings
- [ ] All imports use `.js` extensions for local files
- [ ] All Zod schemas include `.describe()` for parameters
- [ ] Tool functions follow the exact established pattern
- [ ] `manifest.json` is valid JSON (run `npm run dxt:validate`)

### 6. Warning Resolution

**Treat warnings as errors** - fix all warnings including:
- Unused variables (remove or prefix with `_`)
- Unreachable code (fix logic)
- Implicit any types (add proper typing)
- Missing return statements (add explicit returns)

### 7. Testing the Fix

After fixing all errors and warnings:

```bash
# Verify clean build
npm run build

# Test the server runs without crashing
npm run dev

# Validate manifest structure
npm run dxt:validate

# If all pass, the code is ready
npm run dxt:pack
```

## When Asked for Help

### For New Tools
1. Ask for the tool's purpose and expected inputs/outputs
2. Follow the exact patterns established in existing tools
3. Create comprehensive input validation with Zod schemas
4. Include usage examples in comments
5. Update both code and manifest
6. **ALWAYS run the error checking process above**

### For Debugging
1. Check TypeScript compilation errors first (`npm run build`)
2. Validate manifest.json structure (`npm run dxt:validate`)
3. Test tool registration and execution (`npm run dev`)
4. Verify import/export paths use .js extensions
5. **Fix all errors and warnings before declaring success**

### For Architecture Questions
- Maintain the simple, flat structure
- Don't over-engineer - keep it beginner-friendly
- Separate concerns cleanly (one tool per file)
- Follow established naming conventions
- **Ensure all code compiles cleanly**

## Systematic Error Prevention

### Before Writing Code
- Review existing patterns in the codebase
- Plan the Zod schema structure first
- Identify any new dependencies needed

### During Code Writing
- Follow the exact established patterns
- Use consistent naming conventions
- Include proper error handling

### After Writing Code (MANDATORY)
1. **Run `npm run build`** - fix any compilation errors
2. **Fix all warnings** - treat warnings as errors
3. **Test with `npm run dev`** - ensure server starts
4. **Validate manifest** - run `npm run dxt:validate`
5. **Only then declare the task complete**

## Error Message Interpretation Guide

### Common Error Patterns and Fixes

**"Cannot find module './tools/mytool.js'"**
```bash
# Check if file exists and has proper export
# Fix: Add .js extension to import, verify export exists
```

**"Property 'z' does not exist"**
```typescript
// Fix: Add missing Zod import
import { z } from 'zod';
```

**"Argument of type 'unknown' is not assignable"**
```typescript
// Fix: Proper Zod schema with .describe()
inputSchema: {
  param: z.string().describe('Parameter description')
}
```

**"Cannot find name 'Server'"**
```typescript
// Fix: Update to current API
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
```

### For New Tools
1. Ask for the tool's purpose and expected inputs/outputs
2. Follow the exact patterns established in existing tools
3. Create comprehensive input validation
4. Include usage examples in comments
5. Update both code and manifest

### For Debugging
1. Check TypeScript compilation errors first
2. Validate manifest.json structure
3. Test tool registration and execution
4. Verify import/export paths use .js extensions

### For Architecture Questions
- Maintain the simple, flat structure
- Don't over-engineer - keep it beginner-friendly
- Separate concerns cleanly (one tool per file)
- Follow established naming conventions

## Success Criteria

A well-implemented tool should:
- ✅ Compile without TypeScript errors
- ✅ Follow the established patterns exactly
- ✅ Include proper error handling
- ✅ Have clear, user-friendly descriptions
- ✅ Work when packaged as a DXT extension
- ✅ Be easily understood by TypeScript beginners

Remember: This project prioritizes simplicity and maintainability over advanced features. Keep solutions straightforward and well-documented.
