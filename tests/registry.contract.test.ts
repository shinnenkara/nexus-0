import { describe, expect, it } from "vitest";

import {
  loadRuleDefinitions,
  loadSkillDefinitions,
  loadWorkflowDefinitions
} from "../src/registry/loaders.js";
import { guidanceToolDefinitions } from "../src/tools/guidanceTools.js";

describe("registry contracts", () => {
  it("loads all guidance mcp command definitions", async () => {
    expect(guidanceToolDefinitions.length).toBeGreaterThan(0);
    expect(new Set(guidanceToolDefinitions.map((tool) => tool.name)).size).toBe(
      guidanceToolDefinitions.length
    );
  });

  it("loads workflows, rules, and skills from registry", async () => {
    const workflows = await loadWorkflowDefinitions();
    const rules = await loadRuleDefinitions();
    const skills = await loadSkillDefinitions();

    for (const workflow of workflows) {
      expect(workflow.steps.length).toBeGreaterThan(0);
    }
    expect(rules.length).toBeGreaterThan(0);
    expect(skills.length).toBeGreaterThan(0);
  });

  it("hydrates workflow context from additional context files", async () => {
    const workflows = await loadWorkflowDefinitions();
    const createPrWorkflow = workflows.find(
      (workflow) => workflow.name === "workflow.createPrFromTicket"
    );
    expect(createPrWorkflow).toBeDefined();
    expect(createPrWorkflow?.context).toBeDefined();
    expect(createPrWorkflow?.context?.prCreationDefaults).toEqual(
      expect.objectContaining({
        assignee: expect.any(String),
        reviewer: expect.any(String)
      })
    );
  });
});
