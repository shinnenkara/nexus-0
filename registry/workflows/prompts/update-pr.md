---
description: Automated PR Description Updater (Lean Context)
---

## Usage

```
/update-pr [BRANCH_PR_NUMBER_OR_URL]
```

_(Note: If no PR number is provided, rely on the currently checked-out git branch)._

## Constraints

When triggered, execute the following steps strictly 1-by-1. **Fail immediately and prompt the user** if any command returns an error (e.g., no PR found, no template matched).

## Execution Steps

1. **Pre-flight & Fetch State:**
   - Run `gh pr view --json body` to get the current PR description.
   - _Validation:_ If the output does not contain `## Description:` and `### Changes:`, STOP and inform the user the template is broken.

2. **Gather Delta Context (Token-Optimized):**
   - **Do not run a full `git diff`.**
   - Run `git log main..HEAD --oneline` (replace `main` with the actual base branch if known) to get the list of recent commits.
   - Run `git diff main..HEAD --stat` to get a high-level overview of modified files.
   - _Only_ if the commit messages are too vague to determine what technical changes occurred, run a filtered diff: `git diff main...HEAD -- . ':(exclude)*lock.json' ':(exclude)dist/*' ':(exclude)*.svg'`

3. **Patch the Description:**
   - Keep `## Description:` and `### Related Issue:` exactly as they are.
   - Completely rewrite the `### Changes:` bulleted list. Merge the original technical changes with the newly committed changes (gleaned from the git log/stat) into one cohesive, up-to-date list.
   - Do not add any conversational filler or new sections.

4. **Execute & Clean:**
   - Write the exact new markdown string to `.pr_body_update.md`.
   - Run `gh pr edit --body-file .pr_body_update.md`.
   - Output success and delete `.pr_body_update.md`.
