import { z } from "zod";

import type { RuleDefinition, SkillDefinition, WorkflowDefinition } from "../types/registry.js";

export interface GuidanceToolContext {
  workflows: WorkflowDefinition[];
  rules: RuleDefinition[];
  skills: SkillDefinition[];
}

export interface GuidanceToolDefinition {
  name: string;
  description: string;
  inputShape: Record<string, z.ZodType>;
}

const workflowGetInput = z.object({ name: z.string().min(1) });
const workflowRenderInput = z.object({
  name: z.string().min(1),
  includeRules: z.array(z.string()).optional(),
  includeSkills: z.array(z.string()).optional()
});
const ruleGetInput = z.object({ id: z.string().min(1) });
const skillGetInput = z.object({ id: z.string().min(1) });

export const guidanceToolDefinitions: GuidanceToolDefinition[] = [
  {
    name: "workflow.list",
    description: "List all available guidance workflows.",
    inputShape: {}
  },
  {
    name: "workflow.get",
    description: "Get a specific workflow with steps, constraints, and metadata.",
    inputShape: { name: z.string() }
  },
  {
    name: "workflow.renderPrompt",
    description: "Render a workflow as a ready-to-run instruction prompt for an external agent.",
    inputShape: {
      name: z.string(),
      includeRules: z.array(z.string()).optional(),
      includeSkills: z.array(z.string()).optional()
    }
  },
  {
    name: "rules.list",
    description: "List all available guidance rules.",
    inputShape: {}
  },
  {
    name: "rules.get",
    description: "Get full text content for a specific rule.",
    inputShape: { id: z.string() }
  },
  {
    name: "skills.list",
    description: "List all available guidance skills.",
    inputShape: {}
  },
  {
    name: "skills.get",
    description: "Get full content and metadata for a specific skill.",
    inputShape: { id: z.string() }
  }
];

type GuidanceHandler = (input: unknown) => { content: Array<{ type: "text"; text: string }> };

function asMcpResponse(payload: unknown): { content: Array<{ type: "text"; text: string }> } {
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(payload, null, 2)
      }
    ]
  };
}

function renderWorkflowPrompt(
  workflow: WorkflowDefinition,
  selectedRules: RuleDefinition[],
  selectedSkills: SkillDefinition[]
): string {
  const lines: string[] = [];
  lines.push(`# Workflow: ${workflow.title}`);
  lines.push("");
  lines.push(workflow.description);
  lines.push("");
  lines.push(`Objective: ${workflow.objective}`);
  lines.push("");
  lines.push("## Execution Steps");
  for (const step of workflow.steps) {
    lines.push(`- ${step.id}${step.optional ? " (optional)" : ""}: ${step.guidance}`);
    if (step.requiredCapability) {
      lines.push(`  required capability: ${step.requiredCapability}`);
    }
    if (step.notes) {
      lines.push(`  notes: ${step.notes}`);
    }
  }

  if (workflow.constraints && workflow.constraints.length > 0) {
    lines.push("");
    lines.push("## Constraints");
    for (const constraint of workflow.constraints) {
      lines.push(`- ${constraint}`);
    }
  }

  if (selectedRules.length > 0) {
    lines.push("");
    lines.push("## Rules");
    for (const rule of selectedRules) {
      lines.push(`### ${rule.title}`);
      lines.push(rule.content);
      lines.push("");
    }
  }

  if (selectedSkills.length > 0) {
    lines.push("");
    lines.push("## Skills");
    for (const skill of selectedSkills) {
      lines.push(`### ${skill.name}`);
      lines.push(skill.description);
      lines.push("");
      lines.push(skill.content);
      lines.push("");
    }
  }

  return lines.join("\n").trim();
}

export function createGuidanceToolHandlers(
  context: GuidanceToolContext
): Record<string, GuidanceHandler> {
  return {
    "workflow.list": () =>
      asMcpResponse(
        context.workflows.map((workflow) => ({
          name: workflow.name,
          title: workflow.title,
          description: workflow.description
        }))
      ),

    "workflow.get": (input) => {
      const payload = workflowGetInput.parse(input);
      const workflow = context.workflows.find((item) => item.name === payload.name);
      if (!workflow) {
        throw new Error(`Workflow not found: ${payload.name}`);
      }
      return asMcpResponse(workflow);
    },

    "workflow.renderPrompt": (input) => {
      const payload = workflowRenderInput.parse(input);
      const workflow = context.workflows.find((item) => item.name === payload.name);
      if (!workflow) {
        throw new Error(`Workflow not found: ${payload.name}`);
      }

      const selectedRules =
        payload.includeRules && payload.includeRules.length > 0
          ? context.rules.filter((rule) => payload.includeRules?.includes(rule.id))
          : context.rules;

      const selectedSkills =
        payload.includeSkills && payload.includeSkills.length > 0
          ? context.skills.filter((skill) => payload.includeSkills?.includes(skill.id))
          : context.skills;

      const prompt = renderWorkflowPrompt(workflow, selectedRules, selectedSkills);
      return asMcpResponse({ workflow: workflow.name, prompt });
    },

    "rules.list": () =>
      asMcpResponse(
        context.rules.map((rule) => ({
          id: rule.id,
          title: rule.title,
          path: rule.path
        }))
      ),

    "rules.get": (input) => {
      const payload = ruleGetInput.parse(input);
      const rule = context.rules.find((item) => item.id === payload.id);
      if (!rule) {
        throw new Error(`Rule not found: ${payload.id}`);
      }
      return asMcpResponse(rule);
    },

    "skills.list": () =>
      asMcpResponse(
        context.skills.map((skill) => ({
          id: skill.id,
          name: skill.name,
          description: skill.description,
          path: skill.path
        }))
      ),

    "skills.get": (input) => {
      const payload = skillGetInput.parse(input);
      const skill = context.skills.find((item) => item.id === payload.id);
      if (!skill) {
        throw new Error(`Skill not found: ${payload.id}`);
      }
      return asMcpResponse(skill);
    }
  };
}
