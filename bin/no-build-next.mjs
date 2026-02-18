#!/usr/bin/env node
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

const args = process.argv.slice(2);

if (args.includes("--help") || args.includes("-h")) {
  console.log(`
  \x1b[1mno-build-next\x1b[0m — Next.js App Router conventions, zero build step

  Usage
    $ npx no-build-next
    $ PORT=8080 npx no-build-next

  Environment
    PORT  Port to listen on (default: 3000)

  Options
    -h, --help         Show this message
    -v, --version      Show version number
  `);
  process.exit(0);
}

if (args.includes("--version") || args.includes("-v")) {
  console.log(require("../package.json").version);
  process.exit(0);
}

// Resolve tsx from *this package's* node_modules so it works via npx
// (import.meta.resolve uses ESM resolution from this file's location)
const tsxImport = import.meta.resolve("tsx");
const serverPath = resolve(__dirname, "../server/index.ts");

const child = spawn(process.execPath, ["--import", tsxImport, serverPath], {
  stdio: "inherit",
});

process.on("SIGINT", () => child.kill("SIGINT"));
process.on("SIGTERM", () => child.kill("SIGTERM"));
child.on("exit", (code) => process.exit(code ?? 0));
