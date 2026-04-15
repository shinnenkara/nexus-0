---
description: Autonomous PR Generation Workflow
---

## Usage

```
/branch-from-ticket <TICKET_ID | CLICKUP_URL_WITH_TICKET_ID>
```

## Execution

When asked to "Create a PR" or "Open a PR", execute the following steps strictly 1-by-1 without asking for confirmation:

1. **Identify Context:**
   - Get the current branch name.
   - Extract the ticket ID (format `type/dev-XXXX/description`) and capitalize it (e.g., `DEV-XXXX`).

2. **Gather Business Context (The Waterfall):**
   - **Attempt 1 (MCP):** Automatically use the ClickUp MCP to search for the extracted ticket ID (`DEV-XXXX`). Retrieve the ticket title, description, and core requirements.
   - **Attempt 2 (Chat Context):** Look at the recent conversation history in this thread for any provided ticket requirements.
   - **Attempt 3 (Diff Only):** If no external context is found, proceed with just the code diff.

3. **Analyze Code Reality:**
   - Read the git diff against the base branch to understand the implementation.
   - Extract the core technical changes into a short, concise list.
   - Look for specific structural changes (e.g., modified API payloads, changed function signatures) to formulate a "Before/After" demonstration.

4. **Synthesize and Draft:**
   - Draft a concise PR Title (e.g., "Feat: [DEV-XXXX] <ClickUp Title or summary>").
   - Draft the PR body strictly using this exact template:

     ## Description:

     [Brief summary explaining *why* the change was made based on ClickUp context, and *what* was changed based on the git diff.]

     ### Changes:
     - [Bullet 1: Specific technical change]
     - [Bullet 2: Specific technical change]
     - [etc.]

     ### Related Issue:

     [DEV-XXXX](https://app.clickup.com/t/4690561/DEV-XXXX)

     ## Demonstration:

     [Provide Before/After code snippets or API request/response payloads based on the diff analysis. If no meaningful code/API demonstration can be extracted, explicitly write "[none]".]

5. **Execute:**
   - Write the drafted PR body to a temporary file named `.pr_body.md` in the root directory. Do not try to pass the body as a string in the CLI.
   - Use `context.prCreationDefaults.assignee` and `context.prCreationDefaults.reviewer`.
   - Execute the command immediately using the `--body-file` flag: `gh pr create --title "<Title>" --body-file .pr_body.md --assignee "<context.prCreationDefaults.assignee>" --reviewer "<context.prCreationDefaults.reviewer>"`
   - Output the final GitHub PR URL for me to click.
   - Delete the temporary `.pr_body.md` file to keep the workspace clean.
