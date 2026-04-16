# Tool Catalog

Generated from guidance tool definitions and registry content.

## Exposed MCP Commands

| Name | Description | Inputs |
| --- | --- | --- |
| `workflow.list` | List all available guidance workflows. | [none] |
| `workflow.get` | Get a specific workflow with steps, constraints, and metadata. | `name` |
| `workflow.renderPrompt` | Render a workflow as a ready-to-run instruction prompt for an external agent. | `name`, `includeRules`, `includeSkills` |
| `rules.list` | List all available guidance rules. | [none] |
| `rules.get` | Get full text content for a specific rule. | `id` |
| `skills.list` | List all available guidance skills. | [none] |
| `skills.get` | Get full content and metadata for a specific skill. | `id` |

## Workflows

### `workflow.addressPrComments`

Collects PR review context and inline comments to draft communication and implementation actions.

- Objective: Convert reviewer feedback into a clear action plan and ready-to-send draft responses for comments that need clarification.

| Step | Guidance | Required Capability | Optional |
| --- | --- | --- | --- |
| `get_pr_context` | Load PR body and top-level review feedback to establish reviewer intent and scope. | [none] | no |
| `get_inline_comments` | Retrieve normalized inline review comments grouped by file and line. | [none] | no |
| `get_branch_context` | Associate review feedback with current branch and base context to scope implementation updates. | [none] | no |

### `workflow.analyzeTicket`

Analyze a ClickUp ticket and determine whether implementation planning can proceed.

- Objective: Understand requirements and either produce a high-confidence implementation plan or draft a clarification request when required context is missing.

| Step | Guidance | Required Capability | Optional |
| --- | --- | --- | --- |
| `parse_ticket` | Analyze the user-provided `ticketRef` (URL or raw ID) and normalize it into `workspace_id` and `ticket_id` values for subsequent steps. | Text Extraction / Regex | no |
| `get_ticket_context` | Use `workspace_id` and `ticket_id` to fetch complete ticket context and capture it as `ticket_context` with title, description, requirements, comments, and acceptance criteria. | ClickUp MCP | no |
| `search_and_gap_check` | Search the codebase for implied entry points from `ticket_context` (API routes, schemas, React components), then decide if requirements are actionable; if not actionable, stop and draft a clarification message. | Codebase Search / Logic Analysis | no |
| `generate_dev_plan` | If requirements are actionable, synthesize ticket and codebase context into a concise implementation plan with existing patterns to extend, concrete file paths, implementation sequence, and testing approach. | Text Generation / Planning | no |

### `workflow.compareToMain`

Compares the current branch to main, captures optional PR context, and returns a structured change report with risks and follow-up focus areas.

- Objective: Produce a deterministic, review-ready summary of branch changes against main with enough evidence for rapid review and prioritization.

| Step | Guidance | Required Capability | Optional |
| --- | --- | --- | --- |
| `detect_branch_context` | Run `git branch --show-current` to get the active branch name and store it as `branch_name`.
Verify `branch_name` is not `main`.
State Transition: Persist `branch_name` as validated branch context for all remaining steps.
 | Git CLI operations | no |
| `sync_base_reference` | Run `git fetch origin main` to update the local reference for the base branch.
Verify the command completes successfully before proceeding.
State Transition: Mark `origin/main` as the authoritative comparison baseline.
 | Git remote sync | no |
| `collect_diff_stats` | Run `git diff --stat origin/main...HEAD` and capture files changed, insertions, and deletions.
State Transition: Store this result as `diff_stat_summary` to drive the overview section in the final report.
 | Git diff analysis | no |
| `collect_full_diff` | Run `git diff origin/main...HEAD` and capture the patch-level changes.
State Transition: Store this output as `full_diff_context` for file-by-file analysis and risk detection.
 | Git patch inspection | no |
| `collect_pr_context` | Attempt to run:
`gh pr view --json number,title,body,state,baseRefName,headRefName,additions,deletions,changedFiles,reviewDecision,comments`
If it succeeds, store the result as `pr_context`.
If it fails (for example, no PR exists), record `pr_context` as unavailable and continue.
State Transition: Persist either structured PR metadata or an explicit unavailable state for conditional reporting.
 | GitHub CLI data retrieval | yes |
| `synthesize_comparison_report` | Using `branch_name`, `diff_stat_summary`, `full_diff_context`, and optional `pr_context`, generate a structured report with:
1) Overview: branch, base (`main`), total files changed, lines added, lines removed.
2) Changes by file: one-line explanation per changed file describing what changed and likely intent.
3) Notable patterns: potential issues, breaking changes, missing tests, or high-risk areas.
4) PR context: include title, description, and unresolved comments only when `pr_context` is available.
State Transition: Persist this as `comparison_report` for user-facing delivery.
 | Diff interpretation and structured writing | no |
| `request_deeper_dive_target` | Present `comparison_report` to the user and then ask whether they want a deeper dive into any specific file or area of the diff.
 | Conversational follow-up prompting | no |

### `workflow.createBranchFromTicket`

Fetches ticket context from an issue tracker, generates a compliant branch name, and executes git branch creation.

- Objective: Produce a compliant branch name from ticket metadata and automatically execute the git branch creation sequence.

| Step | Guidance | Required Capability | Optional |
| --- | --- | --- | --- |
| `parse_ticket` | Normalize the provided user input (ticket reference or URL) into a clean, standalone ticket ID. | Text Parsing | no |
| `get_ticket_context` | Using the normalized ticket ID from the previous step, fetch the exact task name, task type, and associated tags. | Issue Tracker API Access | no |
| `format_branch_name` | Using the fetched ticket context and workflow constraints, construct the exact branch name string. Store this string in state. | String Manipulation | no |
| `execute_git_operations` | Using the formatted branch name, sequentially execute 'git checkout main', 'git pull origin main', and 'git checkout -b {branch_name}'. | Git CLI Execution | no |

### `workflow.createPrFromTicket`

Builds PR body from branch and ticket context with deterministic fallback chain and executes GitHub PR creation.

- Objective: Draft a high-quality pull request title and markdown body grounded in ticket intent and actual code changes, then autonomously publish it via GitHub CLI.
- Context keys: `prCreationDefaults`

| Step | Guidance | Required Capability | Optional |
| --- | --- | --- | --- |
| `get_branch_context` | Extract the current git branch name. Parse the branch name to extract the ticket ID (expecting format `type/dev-XXXX/description`) and capitalize it (e.g., `DEV-XXXX`). Retain this ID in your context for the next step.
 | Git CLI operations | no |
| `get_ticket_context` | Use the extracted ticket ID to fetch business rationale. Follow this strict fallback chain.
Attempt 1: Search the issue tracker (e.g., ClickUp MCP) for the title, description, and requirements.
Attempt 2: Read recent chat history in our thread.
Attempt 3: Proceed with no context.
 | ClickUp MCP | yes |
| `get_delta_summary` | Execute a git diff against the base branch. Extract core technical changes into a concise list.
Identify specific structural changes (e.g., modified API payloads, function signatures) to use for a "Before/After" demonstration.
 | Git diff analysis | no |
| `generate_pr_body` | Synthesize the gathered context into a PR Title (e.g., "Feat: [DEV-XXXX] <Title>") and body.
The body must include exactly these headings: "## Description", "### Changes" (bulleted list), "### Related Issue" (with markdown link to ClickUp), and "## Demonstration" (Before/After snippets, or explicitly write "[none]" if none exist).
 | Markdown text generation | no |
| `execute_pr_creation` | Write the synthesized PR body to a temporary file named `.pr_body.md` in the root directory.
Use `context.prCreationDefaults.assignee` and `context.prCreationDefaults.reviewer`.
Execute `gh pr create --title "<Title>" --body-file .pr_body.md --assignee "<context.prCreationDefaults.assignee>" --reviewer "<context.prCreationDefaults.reviewer>"`.
Verify the command succeeds, output the PR URL to me, and then immediately delete the `.pr_body.md` file.
 | GitHub CLI and File System I/O | no |

### `workflow.reviewCodeChanges`

Reviews branch or provided diff changes for high-confidence defects, risks, and improvement opportunities.

- Objective: Produce a deterministic, evidence-based code review report grounded in observed diffs and local code context.

| Step | Guidance | Required Capability | Optional |
| --- | --- | --- | --- |
| `validate_review_scope` | Determine the review target and normalize it into a single diff payload.
1. If `code_changes` is already provided in context, validate it is non-empty and usable.
2. Otherwise, resolve the active branch and base reference, then collect a diff suitable for review.
3. Confirm the diff maps to the intended branch state before proceeding.
State Transition: Persist a validated normalized diff as `review_diff`.
 | Git state inspection and diff normalization | no |
| `gather_change_context` | Use `review_diff` to identify changed files, then gather only the surrounding code needed to understand behavior and impact.
Prioritize touched files first, then minimal related dependencies or call sites when required for correctness.
State Transition: Persist structured context as `review_context` keyed by changed file and relevant dependency references.
 | File system reading and codebase search | no |
| `evaluate_findings` | Analyze `review_diff` and `review_context` for concrete defects and regressions, including:
logic errors, unhandled edge cases, null or undefined failures, concurrency hazards, security flaws, resource leaks, API contract mismatches, caching bugs, and convention violations.
Reject speculative claims; each retained finding must include direct evidence from reviewed code context.
State Transition: Persist validated findings as `validated_findings` with severity, evidence, impact, and suggested remediation.
 | Static analysis and risk assessment | no |
| `evaluate_adjacent_preexisting_issues` | Inspect immediately adjacent code discovered during analysis for pre-existing defects that materially affect changed behavior.
Include only issues with clear impact and actionable remediation.
State Transition: Persist any accepted adjacent items as `adjacent_findings`; persist an explicit empty state if none are found.
 | Localized code health assessment | yes |
| `generate_review_output` | Build the final review report from `validated_findings` and optional `adjacent_findings`.
Present issues ordered by severity and include: affected file/scope, concrete evidence, user or system impact, and recommended fix.
If no issues are validated, return "No high-confidence issues found" and list residual risks or testing gaps.
State Transition: Persist and deliver `final_review_report` as the user-facing output.
 | Structured technical reporting | no |

### `workflow.updatePrDescription`

Updates the PR description's changes section using lean context from git commits and stat diffs, executing changes via the GitHub CLI.

- Objective: Refresh the PR description so it accurately reflects recent technical changes while strictly preserving stable sections from the existing markdown template.

| Step | Guidance | Required Capability | Optional |
| --- | --- | --- | --- |
| `pre_flight_and_fetch` | You must fetch the current PR description and the target base branch.
1. Run `gh pr view --json body --jq '.body'` to retrieve the unescaped markdown body.
2. Run `gh pr view --json baseRefName --jq '.baseRefName'` to retrieve the base branch.
Validation State Check: Inspect the raw markdown output. If the body does not contain exactly `## Description:` and `### Changes:`, STOP execution and inform the user the template is broken. 
State Transition: Retain the raw markdown body and the base branch name in your working memory for use in subsequent steps.
 | GitHub CLI (gh) execution | no |
| `gather_delta_context` | Gather deterministic, token-optimized context of the changes. Using the base branch name retrieved in Step 1:
1. Run `git log <baseRefName>..HEAD --oneline` to get recent commits.
2. Run `git diff <baseRefName>..HEAD --stat` to get a file modification overview.
3. Run `git diff <baseRefName>...HEAD -- . ':(exclude)*lock.json' ':(exclude)dist/*' ':(exclude)*.svg'` to get the filtered technical changes without overwhelming your context window.
State Transition: Store this commit and diff context in memory to inform the description update in Step 3.
 | Git CLI operations | no |
| `patch_description` | Using the raw PR markdown body (from Step 1) and the git delta context (from Step 2), completely rewrite the bulleted list under the `### Changes:` section. 
Merge the original technical changes with the newly committed changes into one cohesive, up-to-date bulleted list. 
Ensure the rest of the PR body remains completely untouched. 
State Transition: Formulate the exact new markdown string and hold it in memory for the final execution step.
 | Markdown text manipulation | no |
| `execute_and_clean` | 1. Write the updated markdown string exactly as formulated into a temporary file named `.pr_body_update.md` in the current directory. 
2. Run `gh pr edit --body-file .pr_body_update.md` to apply the update to GitHub. 
3. Verify the command succeeds. 
4. Always delete the `.pr_body_update.md` file to clean up your workspace, regardless of whether the edit command succeeded or failed.
Finally, output a brief success summary to the user.
 | File system and GitHub CLI operations | no |

## Rules

- `global_rules` (registry/rules/global_rules.md)

## Skills

- `clickup-mcp` - ClickUp MCP rules (registry/skills/clickup-mcp/SKILL.md)
- `git-cli` - git CLI rules (registry/skills/git-cli/SKILL.md)
