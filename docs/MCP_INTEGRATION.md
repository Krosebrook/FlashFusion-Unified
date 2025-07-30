# Model Context Protocol (MCP) Integration

FlashFusion now includes comprehensive Model Context Protocol (MCP) server integration, providing access to powerful AI tools and capabilities.

## Available MCP Servers

### Reference Servers
- **Everything** - Reference/test server with prompts, resources, and tools
- **Fetch** - Web content fetching and conversion for efficient LLM usage  
- **Filesystem** - Secure file operations with configurable access controls
- **Git** - Tools to read, search, and manipulate Git repositories
- **Memory** - Knowledge graph-based persistent memory system
- **Sequential Thinking** - Dynamic problem-solving through thought sequences
- **Time** - Time and timezone conversion capabilities

## API Endpoints

### Get Server Status
```
GET /api/mcp/status
```
Returns status of all MCP servers (active/inactive).

### List Available Servers
```
GET /api/mcp/servers
```
Returns list of all available MCP servers with descriptions.

### Start MCP Server
```
POST /api/mcp/start
Content-Type: application/json

{
  "serverName": "memory",
  "options": {
    "stdio": "pipe"
  }
}
```

### Stop MCP Server  
```
POST /api/mcp/stop
Content-Type: application/json

{
  "serverName": "memory"
}
```

### Send Request to MCP Server
```
POST /api/mcp/request
Content-Type: application/json

{
  "serverName": "memory",
  "method": "tools/call",
  "params": {
    "name": "create_memory",
    "arguments": {
      "content": "Important information to remember"
    }
  }
}
```

## Usage Examples

### Start Memory Server
```javascript
const response = await fetch('/api/mcp/start', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ serverName: 'memory' })
});
```

### Use Filesystem Server
```javascript
// Start filesystem server
await fetch('/api/mcp/start', {
  method: 'POST', 
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ serverName: 'filesystem' })
});

// Read a file
const fileResponse = await fetch('/api/mcp/request', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    serverName: 'filesystem',
    method: 'tools/call',
    params: {
      name: 'read_file',
      arguments: { path: '/path/to/file.txt' }
    }
  })
});
```

### Fetch Web Content
```javascript
// Start fetch server
await fetch('/api/mcp/start', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ serverName: 'fetch' })
});

// Fetch webpage
const webResponse = await fetch('/api/mcp/request', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    serverName: 'fetch',
    method: 'tools/call', 
    params: {
      name: 'fetch',
      arguments: { url: 'https://example.com' }
    }
  })
});
```

## Integration with FlashFusion

### AI Service Integration
The MCP servers can be accessed through the AI service for enhanced agent capabilities:

```javascript
const mcpService = require('./services/mcpService');

// Start memory server for persistent agent memory
await mcpService.startServer('memory');

// Use in agent conversations
const memoryResponse = await mcpService.sendRequest('memory', 'tools/call', {
  name: 'create_memory',
  arguments: { content: userMessage }
});
```

### Workflow Automation
Combine MCP servers with Zapier integration for powerful automation:

```javascript
// Use git server to monitor repository changes
await mcpService.startServer('git');

// Trigger webhook when changes detected
const gitStatus = await mcpService.sendRequest('git', 'tools/call', {
  name: 'git_status',
  arguments: { repo_path: '/path/to/repo' }
});
```

## Security Considerations

- MCP servers run in isolated processes
- File system access is controlled through configurable permissions
- All API endpoints include proper error handling and validation
- Servers automatically stop on process exit

## Installation

The MCP servers are automatically installed when FlashFusion initializes. Dependencies are managed per server type:

- **TypeScript servers**: Use npm install
- **Python servers**: Use pip/uv for dependencies

## Troubleshooting

### Server Won't Start
- Check if dependencies are installed
- Verify server configuration in `mcpService.js`  
- Check console logs for specific error messages

### Request Timeout
- Increase timeout in `sendRequest` method
- Check if server is actually running with `/api/mcp/status`
- Verify request format matches server expectations

### Missing Dependencies
- Run `npm install` in individual server directories
- For Python servers, ensure required packages are installed
- Check server README files for specific requirements