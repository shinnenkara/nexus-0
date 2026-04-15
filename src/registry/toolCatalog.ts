import type { RuleDefinition, SkillDefinition, WorkflowDefinition } from "../types/registry.js";
import type { GuidanceToolDefinition } from "../tools/guidanceTools.js";

export function renderToolCatalogMarkdown(
  guidanceTools: GuidanceToolDefinition[],
  workflows: WorkflowDefinition[],
  rules: RuleDefinition[],
  skills: SkillDefinition[]
): string {
  const lines: string[] = [];
  lines.push("# Tool Catalog");
  lines.push("");
  lines.push("Generated from guidance tool definitions and registry content.");
  lines.push("");
  lines.push("## Exposed MCP Commands");
  lines.push("");
  lines.push("| Name | Description | Inputs |");
  lines.push("| --- | --- | --- |");
  for (const tool of guidanceTools) {
    const inputFields = Object.keys(tool.inputShape);
    lines.push(
      `| \`${tool.name}\` | ${tool.description.replace(/\|/g, "\\|")} | ${inputFields.length > 0 ? inputFields.map((item) => `\`${item}\``).join(", ") : "[none]"} |`
    );
  }
  lines.push("");
  lines.push("## Workflows");
  lines.push("");
  for (const workflow of workflows) {
    lines.push(`### \`${workflow.name}\``);
    lines.push("");
    lines.push(workflow.description);
    lines.push("");
    lines.push(`- Objective: ${workflow.objective}`);
    if (workflow.context && Object.keys(workflow.context).length > 0) {
      lines.push(
        `- Context keys: ${Object.keys(workflow.context)
          .map((key) => `\`${key}\``)
          .join(", ")}`
      );
    }
    lines.push("");
    lines.push("| Step | Guidance | Required Capability | Optional |");
    lines.push("| --- | --- | --- | --- |");
    for (const step of workflow.steps) {
      lines.push(
        `| \`${step.id}\` | ${step.guidance.replace(/\|/g, "\\|")} | ${step.requiredCapability ? step.requiredCapability.replace(/\|/g, "\\|") : "[none]"} | ${step.optional ? "yes" : "no"} |`
      );
    }
    lines.push("");
  }

  lines.push("## Rules");
  lines.push("");
  for (const rule of rules) {
    lines.push(`- \`${rule.id}\` (${rule.path})`);
  }
  lines.push("");

  lines.push("## Skills");
  lines.push("");
  for (const skill of skills) {
    lines.push(`- \`${skill.id}\` - ${skill.description} (${skill.path})`);
  }
  lines.push("");

  return lines.join("\n");
}
