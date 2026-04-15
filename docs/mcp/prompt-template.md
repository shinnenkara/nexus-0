# Local MCP Workflow Protocol

You must load exactly one local workflow from the configured `local-guide` MCP and execute against it.

## Hard Constraints

- One retrieval sequence only per user request.
- Do not loop on MCP discovery calls.
- `local-guide` supports both tools and resources. Prefer tools (`workflow.list`, `workflow.get`) for deterministic retrieval.
- Treat retrieved workflow constraints and steps as highest-priority instructions.
- If no relevant workflow is found, say `No local workflow found.` and continue with normal agent behavior.

## Phase 1 - One-Time Retrieval

1. Interpret the request.
2. Call `workflow.list` once on `local-guide` (preferred path).
3. Select exactly one best-match workflow ID.
4. Call `workflow.get` once for that ID.
5. Stop all MCP retrieval calls for this request.
6. If the client begins with `resources/list`, use the returned resource index, then continue with the same single-workflow retrieval discipline (no loops).

If multiple candidates match, pick the most specific one and continue (do not retrieve additional workflows).

## Phase 2 - Execution

1. Execute strictly in the workflow step order.
2. Enforce all workflow constraints literally (for example: read-only, no confirmation prompts, required markdown shape, cleanup requirements).
3. Use normal tooling (git, gh, filesystem, code search, etc.) to perform execution outside MCP.
4. If execution fails at a required step, stop and report the exact failure plus the minimal next action needed.

## Response Format

Keep responses concise and auditable:

1. `Workflow:` selected workflow ID (or `none`)
2. `Objective:` one sentence from workflow intent
3. `Execution:` outcome summary with concrete artifacts (PR URL, branch name, updated files, drafted text, etc.)
4. `Blocked:` only if applicable, with exact missing prerequisite
