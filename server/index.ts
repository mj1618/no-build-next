process.env.NODE_ENV ??= "development";

import { createServer } from "node:http";
import { resolve, extname, join, dirname } from "node:path";
import { readFile, access } from "node:fs/promises";
import { watch } from "node:fs";
import { fileURLToPath } from "node:url";
import { transformFile } from "./transform.ts";
import { generateHtml } from "./html.ts";
import { generateImportMap } from "./import-map.ts";
import { scanRoutes, type RouteEntry } from "./router.ts";

const startTime = performance.now();

const PORT = parseInt(process.env.PORT || "3000", 10);
const PKG_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PROJECT_ROOT = process.cwd();

function fsRoot(urlPath: string): string {
  if (urlPath.startsWith("/client/")) return PKG_ROOT;
  return PROJECT_ROOT;
}

const importMap = generateImportMap();
const html = generateHtml(importMap);

// Scan routes from app/ directory
let routes: RouteEntry[] = [];
const routesReady = scanRoutes(resolve(PROJECT_ROOT, "app")).then((r) => {
  routes = r;
  console.log(`Scanned ${routes.length} routes`);
}).catch((err) => {
  console.error("Failed to scan routes:", err);
});

// Live reload via SSE
const sseClients = new Set<import("node:http").ServerResponse>();
let hmrVersion = Date.now();

function notifyClients(changedFile?: string) {
  hmrVersion = Date.now();
  const payload = JSON.stringify({ type: "reload", version: hmrVersion, file: changedFile });
  for (const client of sseClients) {
    client.write(`data: ${payload}\n\n`);
  }
}

const WATCH_DIRS: Array<{ dir: string; root: string }> = [
  { dir: "app", root: PROJECT_ROOT },
  { dir: "client", root: PKG_ROOT },
  { dir: "components", root: PROJECT_ROOT },
  { dir: "lib", root: PROJECT_ROOT },
  { dir: "utils", root: PROJECT_ROOT },
  { dir: "data", root: PROJECT_ROOT },
];
for (const { dir, root } of WATCH_DIRS) {
  try {
    watch(resolve(root, dir), { recursive: true }, (_event, filename) => {
      if (!filename) return;
      const changedFile = `/${dir}/${filename}`;
      console.log(`\x1b[36m↻ ${changedFile}\x1b[0m`);
      notifyClients(changedFile);
    });
  } catch {}
}

const MIME_TYPES: Record<string, string> = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
};

function getMimeType(filePath: string): string {
  const ext = extname(filePath);
  if (MIME_TYPES[ext]) return MIME_TYPES[ext];
  // Handle versioned filenames like "jquery.min.js@ver=3.7.1"
  const atIdx = filePath.indexOf("@");
  if (atIdx !== -1) {
    const beforeAt = filePath.slice(0, atIdx);
    const realExt = extname(beforeAt);
    if (MIME_TYPES[realExt]) return MIME_TYPES[realExt];
  }
  return "application/octet-stream";
}

async function serveStatic(filePath: string, res: import("node:http").ServerResponse): Promise<boolean> {
  try {
    await access(filePath);
    const contentType = getMimeType(filePath);
    const content = await readFile(filePath);
    res.writeHead(200, { "Content-Type": contentType });
    res.end(content);
    return true;
  } catch {
    return false;
  }
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://localhost:${PORT}`);
  const pathname = url.pathname;

  console.log(`${req.method} ${pathname}`);

  // Serve route table as JSON
  if (pathname === "/__routes") {
    await routesReady;
    const clientRoutes = routes.map(({ regex, ...rest }) => rest);
    const body = JSON.stringify({ routes: clientRoutes }, null, 2);
    res.writeHead(200, {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
    });
    res.end(body);
    return;
  }

  // SSE endpoint for live reload
  if (pathname === "/__events") {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    });
    res.write(`data: ${JSON.stringify({ type: "connected", version: hmrVersion })}\n\n`);
    sseClients.add(res);
    req.on("close", () => sseClients.delete(res));
    return;
  }

  // Serve static files from public/ directory (before module transform,
  // so legacy JS/CSS in public/ are served as-is)
  const publicPath = resolve(PROJECT_ROOT, "public", pathname.slice(1));
  const servedFromPublic = await serveStatic(publicPath, res);
  if (servedFromPublic) return;

  // Try to resolve extensionless module paths
  async function resolveModulePath(basePath: string): Promise<string | null> {
    const extensions = [".tsx", ".ts", ".jsx", ".js"];
    for (const ext of extensions) {
      const fullPath = basePath + ext;
      try {
        await access(fullPath);
        return fullPath;
      } catch {}
    }
    // Try index files
    for (const ext of extensions) {
      const indexPath = join(basePath, "index" + ext);
      try {
        await access(indexPath);
        return indexPath;
      } catch {}
    }
    return null;
  }

  // Serve transformed TS/TSX files (with or without extension)
  const ext = extname(pathname);
  const isModuleRequest = ext === ".ts" || ext === ".tsx" || ext === ".js" || ext === ".jsx";
  const isKnownStaticExt = ext !== "" && (ext in MIME_TYPES || ext === ".html");
  const isModuleDir = pathname.startsWith("/app/") ||
    pathname.startsWith("/client/") ||
    pathname.startsWith("/components/") ||
    pathname.startsWith("/data/") ||
    pathname.startsWith("/lib/") ||
    pathname.startsWith("/utils/");
  const mightBeModule = !isKnownStaticExt && isModuleDir;

  if (isModuleRequest || mightBeModule) {
    let filePath: string;
    
    if (isModuleRequest) {
      filePath = resolve(fsRoot(pathname), pathname.slice(1));
    } else {
      const basePath = resolve(fsRoot(pathname), pathname.slice(1));
      const resolved = await resolveModulePath(basePath);
      if (!resolved) {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Not found");
        return;
      }
      filePath = resolved;
    }

    try {
      const code = await transformFile(filePath);
      res.writeHead(200, {
        "Content-Type": "application/javascript",
        "Cache-Control": "no-cache",
      });
      res.end(code);
    } catch (err: any) {
      if (err.code === "ENOENT") {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Not found");
      } else {
        console.error(`Transform error: ${filePath}`, err.message);
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end(`Transform error: ${err.message}`);
      }
    }
    return;
  }

  // For paths with no file extension (or .html), serve the HTML shell (SPA)
  const shellExt = extname(pathname);
  if (!shellExt || shellExt === ".html") {
    res.writeHead(200, {
      "Content-Type": "text/html",
      "Cache-Control": "no-cache",
    });
    res.end(html);
    return;
  }

  // Fallback: try to serve as static file from root
  const filePath = resolve(PROJECT_ROOT, pathname.slice(1));
  const served = await serveStatic(filePath, res);
  if (!served) {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not found");
  }
});

server.listen(PORT, () => {
  const elapsed = (performance.now() - startTime).toFixed(0);
  console.log(`Server listening on http://localhost:${PORT} (started in ${elapsed}ms)`);
});
