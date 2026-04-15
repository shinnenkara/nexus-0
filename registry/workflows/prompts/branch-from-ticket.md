---
description: Create a git branch from a ClickUp ticket ID
---

## Usage

```
/branch-from-ticket <TICKET_ID | CLICKUP_URL_WITH_TICKET_ID>
```

## Branching Convention

- **Feature branches**: `feat/{TICKET_ID}/{small-description}` — e.g. `feat/DEV-1234/add-login-functionality`
- **Bug fix branches**: `fix/{TICKET_ID}/{small-description}` — e.g. `fix/DEV-1234/restore-login`
- **Test branches**: `test/{TICKET_ID}/{small-description}` — e.g. `test/DEV-1237/uat-login-module`

The `small-description` must be concise (under 30 chars), lowercase, and hyphen-separated.

## Execution Steps

1. **Fetch Ticket Context:** Using the provided `{TICKET_ID}`, immediately execute `clickup_get_task` to retrieve the task name, type, and tags.

2. **Infer Type and Format Name:** - Analyze the task metadata (type, tags like "bug", "feature", "test") to determine the appropriate branch structure.
   - Convert the task name into a short, lowercase, hyphen-separated slug (max ~30 chars). Remove special characters and trim filler words.
   - Compose the final branch name (e.g., `feat/DEV-1234/short-description` or `test/DEV-1234/short-description`).

3. **Execute Git Operation:** Without asking for confirmation, immediately fetch the latest main and create the branch based on the formatted name.

```bash
git checkout main
git pull origin main
git checkout -b {branch_name}
```
