---
description: Analyze PR description and comments to produce a dev plan
---
## Usage

```
/address-pr-comments [BRANCH_PR_NUMBER_OR_URL]
```
*(Note: If no PR number is provided, rely on the currently checked-out git branch).*

## Constraints

- **Read-only GitHub access**: Read the PR description, reviews, and comments. NEVER submit reviews or write comments automatically via the CLI.
- **Follow existing patterns**: This is a mature codebase. Mimic existing conventions when fixing code.
- **No UI/E2E tests**: Only suggest API unit/integration tests. For modified React components, remind where to add `data-testid` attributes.
- **Drafts only**: All communication (questions for reviewers, replies to comments) must be drafted in chat for the user to send manually.

## Phase 1: Understand & Gather

1. **Identify the PR**: Use the provided argument, or run `gh pr status` / `gh pr view` to identify the PR associated with the current branch.
2. **Fetch PR Intent**: Run `gh pr view --json title,body` to understand the original goal.
3. **Fetch All Feedback**:
   - Get general reviews: `gh pr view --json comments,reviews`
   - Get inline code comments: `gh api --paginate repos/{owner}/{repo}/pulls/{pr_number}/comments | jq '.[] | {user: .user.login, body, path, line}'`
4. **Contextualize**: Map all fetched comments to the actual codebase.
5. **Categorize**: Mentally divide every comment into two buckets:
   - *Actionable*: The request is clear and the code can be modified.
   - *Needs Clarification*: The request is vague, contradictory, or outside the scope of the PR.

## Phase 2: Action & Communication Plan

Process ALL comments before generating this plan. Produce a single, cohesive output divided into two sections:

### A. Communication Plan (For Vague Feedback)
For every comment categorized as "Needs Clarification":
- Quote the original reviewer and their comment.
- Draft a short, professional reply in the chat asking for clarification or pushing back, so the user can copy/paste it into GitHub.

### B. Dev Plan (For Actionable Feedback)
For all actionable comments, provide a concise plan:
- **Feedback Summary**: A brief, numbered checklist of the exact issues being resolved.
- **Files to modify/create**: Exact file paths, bulleted.
- **Implementation steps**: Logical sequence to complete the work (e.g., "1. Address database schema request in X, 2. Update controller logic in Y").
- **Testing strategy**:
   - API unit/integration tests to add/update based on the new changes.
   - `data-testid` attributes to add on modified React components.
