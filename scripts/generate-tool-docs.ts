import path from "node:path";
import { promises as fs } from "node:fs";

import {
  loadRuleDefinitions,
  loadSkillDefinitions,
  loadWorkflowDefinitions
} from "../src/registry/loaders.js";
import { renderToolCatalogMarkdown } from "../src/registry/toolCatalog.js";
import { guidanceToolDefinitions } from "../src/tools/guidanceTools.js";

const OUTPUT_PATH = path.join(process.cwd(), "docs/mcp/tool-catalog.md");

async function main() {
  const [workflows, rules, skills] = await Promise.all([
    loadWorkflowDefinitions(),
    loadRuleDefinitions(),
    loadSkillDefinitions()
  ]);
  const markdown = renderToolCatalogMarkdown(guidanceToolDefinitions, workflows, rules, skills);
  await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await fs.writeFile(OUTPUT_PATH, markdown, "utf8");
  process.stdout.write(`Generated ${OUTPUT_PATH}\n`);
}

main().catch((error: unknown) => {
  process.stderr.write(
    `${error instanceof Error ? (error.stack ?? error.message) : String(error)}\n`
  );
  process.exit(1);
});
