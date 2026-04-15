import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import path from "node:path";

import { createServer } from "./server/createServer.js";

function logStartupInfo(info: {
  fileIndex: { rootPath: string; workflows: string[]; rules: string[]; skills: string[] };
  loadedCounts: { workflows: number; rules: number; skills: number; commands: number };
  commands: string[];
}): void {
  const recommendedDistEntrypoint = path.resolve(info.fileIndex.rootPath, "dist/src/index.js");
  const currentEntrypoint = process.argv[1] ? path.resolve(process.argv[1]) : "[unknown]";
  const lines: string[] = [];
  lines.push("[Guidance MCP] Startup complete");
  lines.push(`[Guidance MCP] Transport: stdio (no TCP port)`);
  lines.push(`[Guidance MCP] Project root: ${info.fileIndex.rootPath}`);
  lines.push(`[Guidance MCP] Loaded workflows (${info.loadedCounts.workflows}):`);
  for (const filePath of info.fileIndex.workflows) {
    lines.push(`  - ${filePath}`);
  }
  lines.push(`[Guidance MCP] Loaded rules (${info.loadedCounts.rules}):`);
  for (const filePath of info.fileIndex.rules) {
    lines.push(`  - ${filePath}`);
  }
  lines.push(`[Guidance MCP] Loaded skills (${info.loadedCounts.skills}):`);
  for (const filePath of info.fileIndex.skills) {
    lines.push(`  - ${filePath}`);
  }
  lines.push(`[Guidance MCP] Exposed MCP commands (${info.loadedCounts.commands}):`);
  for (const command of info.commands) {
    lines.push(`  - ${command}`);
  }
  lines.push(`[Guidance MCP] Access via MCP client config:`);
  lines.push(`  command: node`);
  lines.push(`  args: ["${recommendedDistEntrypoint}"]`);
  lines.push(`[Guidance MCP] Current process entrypoint: ${currentEntrypoint}`);
  process.stderr.write(`${lines.join("\n")}\n`);
}

async function main(): Promise<void> {
  const { server, diagnostics } = await createServer();
  logStartupInfo(diagnostics);
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? (error.stack ?? error.message) : String(error);
  process.stderr.write(`${message}\n`);
  process.exit(1);
});
