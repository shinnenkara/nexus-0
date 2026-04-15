import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";

import {
  loadRuleDefinitions,
  loadSkillDefinitions,
  loadWorkflowDefinitions,
  scanRegistryFiles
} from "../registry/loaders.js";
import { createGuidanceToolHandlers, guidanceToolDefinitions } from "../tools/guidanceTools.js";
import type { RuleDefinition, SkillDefinition, WorkflowDefinition } from "../types/registry.js";

function toJsonText(payload: unknown): string {
  return JSON.stringify(payload, null, 2);
}

function toWorkflowList(workflows: WorkflowDefinition[]): Array<{
  name: string;
  title: string;
  description: string;
}> {
  return workflows.map((workflow) => ({
    name: workflow.name,
    title: workflow.title,
    description: workflow.description
  }));
}

function toRuleList(rules: RuleDefinition[]): Array<{
  id: string;
  title: string;
  path: string;
}> {
  return rules.map((rule) => ({
    id: rule.id,
    title: rule.title,
    path: rule.path
  }));
}

function toSkillList(skills: SkillDefinition[]): Array<{
  id: string;
  name: string;
  description: string;
  path: string;
}> {
  return skills.map((skill) => ({
    id: skill.id,
    name: skill.name,
    description: skill.description,
    path: skill.path
  }));
}

function pickTemplateValue(
  variables: Record<string, string | string[]>,
  key: string
): string | undefined {
  const value = variables[key];
  return Array.isArray(value) ? value[0] : value;
}

export interface StartupDiagnostics {
  transport: "stdio";
  fileIndex: {
    rootPath: string;
    workflows: string[];
    rules: string[];
    skills: string[];
  };
  loadedCounts: {
    workflows: number;
    rules: number;
    skills: number;
    commands: number;
  };
  commands: string[];
}

export async function createServer(): Promise<{
  server: McpServer;
  diagnostics: StartupDiagnostics;
}> {
  const fileIndex = await scanRegistryFiles();

  let workflows;
  let rules;
  let skills;
  try {
    workflows = await loadWorkflowDefinitions();
  } catch (error) {
    throw new Error(
      `Failed to load workflow registry files.\nFiles: ${fileIndex.workflows.join(", ")}\nReason: ${error instanceof Error ? error.message : String(error)}`
    );
  }

  try {
    rules = await loadRuleDefinitions();
  } catch (error) {
    throw new Error(
      `Failed to load rule registry files.\nFiles: ${fileIndex.rules.join(", ")}\nReason: ${error instanceof Error ? error.message : String(error)}`
    );
  }

  try {
    skills = await loadSkillDefinitions();
  } catch (error) {
    throw new Error(
      `Failed to load skill registry files.\nFiles: ${fileIndex.skills.join(", ")}\nReason: ${error instanceof Error ? error.message : String(error)}`
    );
  }

  const handlers = createGuidanceToolHandlers({ workflows, rules, skills });

  const server = new McpServer({
    name: "company-guidance-mcp",
    version: "0.1.0"
  });

  for (const tool of guidanceToolDefinitions) {
    const handler = handlers[tool.name];
    server.tool(tool.name, tool.description, tool.inputShape, async (args) => handler(args));
  }

  const workflowList = toWorkflowList(workflows);
  const ruleList = toRuleList(rules);
  const skillList = toSkillList(skills);

  // Static list resources mirror corresponding *.list tools.
  server.registerResource(
    "workflow-list",
    "workflow://list",
    {
      title: "Workflow List",
      description: "Same payload as workflow.list tool.",
      mimeType: "application/json"
    },
    async (uri) => ({
      contents: [{ uri: uri.href, text: toJsonText(workflowList), mimeType: "application/json" }]
    })
  );

  server.registerResource(
    "rules-list",
    "rules://list",
    {
      title: "Rules List",
      description: "Same payload as rules.list tool.",
      mimeType: "application/json"
    },
    async (uri) => ({
      contents: [{ uri: uri.href, text: toJsonText(ruleList), mimeType: "application/json" }]
    })
  );

  server.registerResource(
    "skills-list",
    "skills://list",
    {
      title: "Skills List",
      description: "Same payload as skills.list tool.",
      mimeType: "application/json"
    },
    async (uri) => ({
      contents: [{ uri: uri.href, text: toJsonText(skillList), mimeType: "application/json" }]
    })
  );

  // Item resources mirror corresponding *.get tools.
  server.registerResource(
    "workflow-item",
    new ResourceTemplate("workflow://item/{name}", {
      list: async () => ({
        resources: workflows.map((workflow) => ({
          uri: `workflow://item/${encodeURIComponent(workflow.name)}`,
          name: workflow.title,
          description: workflow.description,
          mimeType: "application/json"
        }))
      })
    }),
    {
      title: "Workflow",
      description: "Same payload as workflow.get tool.",
      mimeType: "application/json"
    },
    async (uri, variables) => {
      const name = pickTemplateValue(variables, "name");
      if (!name) {
        throw new Error("Missing workflow name in resource URI.");
      }

      const workflow = workflows.find((item) => item.name === name);
      if (!workflow) {
        throw new Error(`Workflow not found: ${name}`);
      }
      return {
        contents: [{ uri: uri.href, text: toJsonText(workflow), mimeType: "application/json" }]
      };
    }
  );

  server.registerResource(
    "rules-item",
    new ResourceTemplate("rules://item/{id}", {
      list: async () => ({
        resources: rules.map((rule) => ({
          uri: `rules://item/${encodeURIComponent(rule.id)}`,
          name: rule.title,
          description: rule.path,
          mimeType: "application/json"
        }))
      })
    }),
    {
      title: "Rule",
      description: "Same payload as rules.get tool.",
      mimeType: "application/json"
    },
    async (uri, variables) => {
      const id = pickTemplateValue(variables, "id");
      if (!id) {
        throw new Error("Missing rule id in resource URI.");
      }

      const rule = rules.find((item) => item.id === id);
      if (!rule) {
        throw new Error(`Rule not found: ${id}`);
      }
      return {
        contents: [{ uri: uri.href, text: toJsonText(rule), mimeType: "application/json" }]
      };
    }
  );

  server.registerResource(
    "skills-item",
    new ResourceTemplate("skills://item/{id}", {
      list: async () => ({
        resources: skills.map((skill) => ({
          uri: `skills://item/${encodeURIComponent(skill.id)}`,
          name: skill.name,
          description: skill.description,
          mimeType: "application/json"
        }))
      })
    }),
    {
      title: "Skill",
      description: "Same payload as skills.get tool.",
      mimeType: "application/json"
    },
    async (uri, variables) => {
      const id = pickTemplateValue(variables, "id");
      if (!id) {
        throw new Error("Missing skill id in resource URI.");
      }

      const skill = skills.find((item) => item.id === id);
      if (!skill) {
        throw new Error(`Skill not found: ${id}`);
      }
      return {
        contents: [{ uri: uri.href, text: toJsonText(skill), mimeType: "application/json" }]
      };
    }
  );

  return {
    server,
    diagnostics: {
      transport: "stdio",
      fileIndex,
      loadedCounts: {
        workflows: workflows.length,
        rules: rules.length,
        skills: skills.length,
        commands: guidanceToolDefinitions.length
      },
      commands: guidanceToolDefinitions.map((tool) => tool.name)
    }
  };
}
