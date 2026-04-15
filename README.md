# Local Guidance MCP

Local MCP knowledge base for company-standard workflows, rules, and skills across any local MCP-capable coding agent.

## Why

- One canonical guidance source for workflows/rules/skills.
- No per-agent prompt drift.
- Guidance-first MCP commands that return structured instructions.

## 2. Initial setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Build the server:

   ```bash
   npm run build
   ```

   The MCP client config runs `dist/src/index.js`, so `build` is required before connecting from a client.

### 2.1 MCP config

- Use the config pattern from [`docs/mcp/setup.md`](docs/mcp/setup.md) (see "Agent Configuration Pattern").
- Optional: run `npm run dev` once if you want startup diagnostics while validating local setup.

### 2.2 Agent prompt

- Use [`docs/mcp/prompt-template.md`](docs/mcp/prompt-template.md) as the required base prompt.
- This keeps workflow retrieval and execution behavior consistent across agents.

## Requirements

- Node.js `>=22`
- npm `>=10`

## 3. Sources

- Guidance MCP command definitions: [`src/tools/guidanceTools.ts`](src/tools/guidanceTools.ts)
- Workflow manifests: [`registry/workflows/`](registry/workflows/)
- Workflow validation schema: [`src/registry/schemas.ts`](src/registry/schemas.ts)
- User rules: [`registry/rules/`](registry/rules/)
- User skills: [`registry/skills/`](registry/skills/)
- PR templates: [`registry/templates/pr/`](registry/templates/pr/)
- Generated tool catalog: [`docs/mcp/tool-catalog.md`](docs/mcp/tool-catalog.md)

Do not duplicate registry content in README. Use the generated catalog for command reference.

## 4. How to contribute

Follow the contribution and quality-gate workflow in [`docs/mcp/contributing.md`](docs/mcp/contributing.md).
