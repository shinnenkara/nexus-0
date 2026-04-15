import path from "node:path";
import { existsSync, promises as fs } from "node:fs";
import { fileURLToPath } from "node:url";

import { parse as parseYaml } from "yaml";

import { ValidationError } from "../types/errors.js";
import type { RuleDefinition, SkillDefinition, WorkflowDefinition } from "../types/registry.js";
import { workflowSchema } from "./schemas.js";

const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));

function resolveProjectRoot(): string {
  let current = MODULE_DIR;
  for (let i = 0; i < 8; i += 1) {
    const packageJsonPath = path.join(current, "package.json");
    const registryPath = path.join(current, "registry");
    if (existsSync(packageJsonPath) && existsSync(registryPath)) {
      return current;
    }
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }
  return process.cwd();
}

const ROOT = resolveProjectRoot();
const WORKFLOWS_DIR = path.join(ROOT, "registry/workflows");
const RULES_DIR = path.join(ROOT, "registry/rules");
const SKILLS_DIR = path.join(ROOT, "registry/skills");

async function listFilesBySuffix(dir: string, suffix: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(suffix))
    .map((entry) => path.join(dir, entry.name))
    .sort();
}

async function listSkillFiles(): Promise<string[]> {
  const entries = await fs.readdir(SKILLS_DIR, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(SKILLS_DIR, entry.name, "SKILL.md"))
    .sort();
}

export interface RegistryFileIndex {
  rootPath: string;
  workflows: string[];
  rules: string[];
  skills: string[];
}

export async function scanRegistryFiles(): Promise<RegistryFileIndex> {
  const [workflows, rules, skills] = await Promise.all([
    listFilesBySuffix(WORKFLOWS_DIR, ".workflow.yaml"),
    listFilesBySuffix(RULES_DIR, ".md"),
    listSkillFiles()
  ]);

  return {
    rootPath: ROOT,
    workflows: workflows.map((filePath) => path.relative(ROOT, filePath)),
    rules: rules.map((filePath) => path.relative(ROOT, filePath)),
    skills: skills.map((filePath) => path.relative(ROOT, filePath))
  };
}

function parseWithSchemaOrThrow<T>(
  schema: {
    safeParse: (value: unknown) => { success: true; data: T } | { success: false; error: unknown };
  },
  value: unknown,
  filePath: string
): T {
  const parsed = schema.safeParse(value);
  if (parsed.success) {
    return parsed.data;
  }
  throw new ValidationError(`Schema validation failed for ${filePath}`, parsed.error);
}

async function loadContextValueFromFile(relativePath: string): Promise<unknown> {
  const absolutePath = path.join(ROOT, relativePath);
  const rawContent = await fs.readFile(absolutePath, "utf8");
  const extension = path.extname(relativePath).toLowerCase();

  if (extension === ".yaml" || extension === ".yml") {
    return parseYaml(rawContent);
  }

  if (extension === ".json") {
    return JSON.parse(rawContent) as unknown;
  }

  return rawContent.trimEnd();
}

export async function loadWorkflowDefinitions(): Promise<WorkflowDefinition[]> {
  const files = await listFilesBySuffix(WORKFLOWS_DIR, ".workflow.yaml");
  const workflows = await Promise.all(
    files.map(async (filePath) => {
      const rawText = await fs.readFile(filePath, "utf8");
      const raw = parseYaml(rawText) as unknown;
      const workflow = parseWithSchemaOrThrow<WorkflowDefinition>(workflowSchema, raw, filePath);
      if (!workflow.additionalContext || workflow.additionalContext.length === 0) {
        return workflow;
      }

      const loadedContextEntries = await Promise.all(
        workflow.additionalContext.map(async (item) => {
          try {
            const value = await loadContextValueFromFile(item.path);
            return [item.key, value] as const;
          } catch (error) {
            throw new ValidationError(
              `Failed to load additional workflow context '${item.key}' from '${item.path}' referenced by ${path.relative(
                ROOT,
                filePath
              )}: ${error instanceof Error ? error.message : String(error)}`
            );
          }
        })
      );

      const loadedContext = Object.fromEntries(loadedContextEntries);
      const mergedContext = {
        ...(workflow.context ?? {}),
        ...loadedContext
      };

      const { additionalContext, ...workflowWithoutAdditionalContext } = workflow;

      return {
        ...workflowWithoutAdditionalContext,
        context: mergedContext
      };
    })
  );

  const names = new Set<string>();
  for (const workflow of workflows) {
    if (names.has(workflow.name)) {
      throw new ValidationError(`Duplicate workflow name found: ${workflow.name}`);
    }
    names.add(workflow.name);
  }

  return workflows;
}

function toTitleFromFilename(filename: string): string {
  return filename.replace(/[-_]/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export async function loadRuleDefinitions(): Promise<RuleDefinition[]> {
  const files = await listFilesBySuffix(RULES_DIR, ".md");
  const rules = await Promise.all(
    files.map(async (filePath) => {
      const content = await fs.readFile(filePath, "utf8");
      const id = path.basename(filePath, ".md");
      return {
        id,
        title: toTitleFromFilename(id),
        content: content.trim(),
        path: path.relative(ROOT, filePath)
      };
    })
  );
  return rules;
}

function parseSkillFrontmatter(content: string): {
  name: string;
  description: string;
  body: string;
} {
  const match = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) {
    throw new ValidationError("Skill file must include YAML frontmatter");
  }

  const frontmatter = match[1];
  const body = match[2].trim();

  const nameMatch = frontmatter.match(/^name:\s*(.+)$/m);
  const descriptionMatch = frontmatter.match(/^description:\s*(.+)$/m);

  if (!nameMatch || !descriptionMatch) {
    throw new ValidationError("Skill frontmatter must include name and description");
  }

  return {
    name: nameMatch[1].trim(),
    description: descriptionMatch[1].trim(),
    body
  };
}

export async function loadSkillDefinitions(): Promise<SkillDefinition[]> {
  const skillPaths = await listSkillFiles();

  const skills = await Promise.all(
    skillPaths.map(async (filePath) => {
      const content = await fs.readFile(filePath, "utf8");
      const parsed = parseSkillFrontmatter(content);
      return {
        id: path.basename(path.dirname(filePath)),
        name: parsed.name,
        description: parsed.description,
        content: parsed.body,
        path: path.relative(ROOT, filePath)
      };
    })
  );

  return skills;
}
