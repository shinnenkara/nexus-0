---
description: Compare current branch changes to main
---
Compare the current branch against `main` and provide a structured summary of all changes.

1. Identify the current branch and confirm it is not `main`:
```
git branch --show-current
```

2. Fetch latest `main` to ensure the comparison is up to date:
```
git fetch origin main
```

3. Show a concise stat summary of what changed (files affected, insertions, deletions):
```
git diff --stat origin/main...HEAD
```

4. Show the full diff of all changes introduced by this branch:
```
git diff origin/main...HEAD
```

5. If a GitHub PR already exists for this branch, fetch its metadata and review comments for additional context:
```
gh pr view --json number,title,body,state,baseRefName,headRefName,additions,deletions,changedFiles,reviewDecision,comments
```

6. Analyze the diff output and produce a structured summary:
   a. **Overview** — branch name, base (`main`), total files changed, lines added/removed.
   b. **Changes by file** — for each changed file, one-line description of what was modified and why (inferred from the diff).
   c. **Notable patterns** — highlight any potential issues, breaking changes, missing tests, or areas that need attention.
   d. **PR context** (if step 5 succeeded) — include title, description, and any open review comments that have not been addressed.

7. Ask the user if they want a deeper dive into any specific file or area of the diff.
