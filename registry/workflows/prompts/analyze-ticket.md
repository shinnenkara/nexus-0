---
description: Analyze a ClickUp ticket, codebase and produce a dev plan
---
## Usage

```
/analyze-ticket <TICKET_ID | CLICKUP_URL_WITH_TICKET_ID>
```

## Constraints

- **Read-only ClickUp access**: Read the ticket description, acceptance criteria, and all comments. NEVER write anything back to ClickUp.
- **Follow existing patterns**: This is a mature codebase. Do NOT invent new architectural patterns. Find and mimic existing conventions.
- **No UI/E2E tests**: Only suggest API unit/integration tests. For modified React components, remind where to add `data-testid` attributes.
- **Drafts only**: All communication (questions for PM, messages for teammates) must be drafted in chat for the user to send manually.

## Phase 1: Understand

1. **Read the ticket** via ClickUp MCP — description, requirements, acceptance criteria, and comments.
2. **Search the codebase** for relevant entry points implied by the ticket:
    - API routes / controllers
    - Database schema / models
    - Background jobs / crons
    - React components (if applicable)
3. **Gap-check the Acceptance Criteria**:
    - If requirements are vague, incomplete, or the relevant code cannot be found → **STOP**.
    - Draft a short, professional message listing the missing information so the user can ask the PM or tech lead.

## Phase 2: Dev Plan

Only proceed here if Phase 1 passes. Produce a concise plan:

- **Existing patterns**: Which files/patterns are being extended and how.
- **Files to modify/create**: Exact file paths, bulleted.
- **Implementation steps**: Logical sequence to complete the work.
- **Testing strategy**:
    - API unit/integration tests to add or update.
    - `data-testid` attributes to add on modified React components.
