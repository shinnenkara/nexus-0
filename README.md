# Company Guidance MCP

Local MCP knowledge base for company-standard workflows, rules, and skills across any local MCP-capable coding agent.

## Why

- One canonical guidance source for workflows/rules/skills.
- No per-agent prompt drift.
- Guidance-first MCP commands that return structured instructions.

## Quickstart

1. Install dependencies:

   ```bash
   npm install
   ```

2. Run server:

   ```bash
   npm run dev
   ```

## Requirements

- Node.js `>=22`
- npm `>=10`

## Canonical Sources

- Guidance MCP command definitions: `src/tools/guidanceTools.ts`
- Workflow manifests: `registry/workflows/*.workflow.yaml`
- Workflow validation schema: `src/registry/schemas.ts`
- User rules: `registry/rules/*.md`
- User skills: `registry/skills/*/SKILL.md`
- PR templates: `registry/templates/pr/`

Do not duplicate registry content in README. The generated catalog is in `docs/mcp/tool-catalog.md`.

## Documentation

- Setup: `docs/mcp/setup.md`
- General agent prompt: `docs/mcp/prompt-template.md`
- Contributing guide: `docs/mcp/contributing.md`
- Generated tool catalog: `docs/mcp/tool-catalog.md`

For contributor quality gates and maintenance commands, use `docs/mcp/contributing.md`.
