# MCP Setup

## Local Server

Run locally via stdio transport:

```bash
npm run dev
```

For production-like execution:

```bash
npm run build && npm run start
```

## Agent Configuration Pattern

Use this command for any local MCP-capable client:

```json
{
  "mcpServers": {
    "company-local": {
      "command": "node",
      "args": ["/absolute/path/to/nexus-0/dist/src/index.js"]
    }
  }
}
```

## Startup Logs

On startup, the server logs:

- which workflow/rule/skill registry files were loaded,
- loaded entity counts and exposed MCP commands,
- transport mode (`stdio`) and a reminder that there is no TCP port.

## Environment Variables

- No environment variables are required for baseline setup.
- No runtime tuning variables are required for guidance mode.
