# Contributing Guide

Use this guide whenever you add or update tools, workflows, docs, skills, or rules. Keep contributions incremental and never duplicate canonical data in README.

## Golden Rules

- Guidance command contracts live in `src/tools/guidanceTools.ts`.
- Workflow orchestration lives in `registry/workflows/*.workflow.yaml`.
- Shared guidance logic lives in `src/tools/`.
- Generated catalog lives in `docs/mcp/tool-catalog.md` (do not edit manually).
- Guidance MCP is read-only and does not execute external side effects.

## Add Or Update Guidance Commands

1. Add or update command definitions in `src/tools/guidanceTools.ts`.
2. Add or update corresponding handlers in the same file.
3. Keep commands read-only and guidance-focused.
4. Add or update tests in `tests/`.
5. Regenerate docs and run quality gates.

### Guidance command template

```ts
{
  name: "workflow.get",
  description: "Get a specific workflow with steps, constraints, and metadata.",
  inputShape: {
    name: z.string()
  }
}
```

## Add A New Workflow

1. Copy `docs/mcp/template.workflow.yaml` to `registry/workflows/<workflow-name>.workflow.yaml`.
2. Compose guidance steps in ordered sequence.
3. Avoid embedding heavy logic in workflow manifests.
4. Add tests if workflow behavior expectations changed.
5. Regenerate docs and run quality gates.

### Workflow manifest template

```yaml
name: workflow.exampleFlow
title: Example Flow
description: One sentence describing orchestration intent.
objective: Define what the external agent should accomplish and produce.
constraints:
  - Optional workflow-level policy statement.
steps:
  - id: first_step
    requiredCapability: Optional capability label (for example, API Query / Analysis).
    guidance: Explain what this step should do and what artifact/state it should produce.
  - id: second_step
    guidance: Explain what this step should do and what artifact/state it should produce.
    optional: true
```

## Add Or Update Docs

- Author docs under `docs/mcp/`.
- Keep README index-only and link out to docs.
- Never duplicate full guidance content in README.

## Add Or Update Rules

- Store rule files in `registry/rules/`.
- Keep them short, stable, and policy-focused.
- If a rule changes tool behavior, reflect it in manifests and policy/runtime code.

## Add Or Update Skills

- Store skill docs in `registry/skills/<skill-name>/SKILL.md`.
- Keep skills procedural and reusable.
- Promote repeated skill logic into workflow and prompt guidance over time.

## Source Of Truth

- Guidance command definitions live in `src/tools/guidanceTools.ts`.
- Workflow definitions live in `registry/workflows/*.workflow.yaml`.
- User rules live in `registry/rules/*.md`.
- User skills live in `registry/skills/*/SKILL.md`.
- Runtime implementation lives in `src/`.
- Generated docs live in `docs/mcp/tool-catalog.md`.

README is index-only and never a canonical source for guidance contracts.

## Workflow Evolution

- Keep workflow manifests minimal and guidance-first.
- Prefer updating in place over adding metadata-only revisions.
- Deprecate workflows by updating descriptions and migration notes before removal.

## Definition Of Done (Every PR)

Run all checks and commit generated artifacts:

```bash
npm run docs:generate
npm run type:check
npm run format:check
npm run test
npm run build
```

Husky hooks are configured to automate part of this flow:

- Pre-commit regenerates `docs/mcp/tool-catalog.md`.
- Pre-push runs `type:check`, `test`, and `format:check`.

## Quality Gates

- Schema validation must pass.
- Workflow files must remain parseable and structured.
- Generated catalog must be up to date.
- Contract tests must pass.

## Quick Decision Matrix

- Need a new guidance command? Update `src/tools/guidanceTools.ts`.
- Need multi-step orchestration instructions? Add a workflow.
- Need policy/guidance only? Add rule/doc/skill.
- Need execution capability? Keep it in the external agent, not this MCP.
