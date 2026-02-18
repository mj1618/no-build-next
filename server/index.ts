import { createServer } from "node:http";
import { resolve, extname, join } from "node:path";
import { readFile, access } from "node:fs/promises";
import { transformFile } from "./transform.ts";
import { generateHtml } from "./html.ts";
import { generateImportMap } from "./import-map.ts";
import { scanRoutes, type RouteEntry } from "./router.ts";

const startTime = performance.now();

const PORT = parseInt(process.env.PORT || "3000", 10);
const ROOT = process.cwd();

const importMap = generateImportMap();
const html = generateHtml(importMap);

// Scan routes from app/ directory
let routes: RouteEntry[] = [];
const routesReady = scanRoutes(resolve(ROOT, "app")).then((r) => {
  routes = r;
  console.log(`Scanned ${routes.length} routes`);
}).catch((err) => {
  console.error("Failed to scan routes:", err);
});

const MIME_TYPES: Record<string, string> = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

async function serveStatic(filePath: string, res: import("node:http").ServerResponse): Promise<boolean> {
  try {
    await access(filePath);
    const ext = extname(filePath);
    const contentType = MIME_TYPES[ext] || "application/octet-stream";
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
  const mightBeModule = !ext && (
    pathname.startsWith("/app/") ||
    pathname.startsWith("/client/") ||
    pathname.startsWith("/components/") ||
    pathname.startsWith("/data/") ||
    pathname.startsWith("/lib/") ||
    pathname.startsWith("/utils/")
  );

  if (isModuleRequest || mightBeModule) {
    let filePath: string;
    
    if (isModuleRequest) {
      filePath = resolve(ROOT, pathname.slice(1));
    } else {
      const basePath = resolve(ROOT, pathname.slice(1));
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

  // Serve static files from public/
  if (pathname.startsWith("/public/")) {
    const filePath = resolve(ROOT, pathname.slice(1));
    const served = await serveStatic(filePath, res);
    if (served) return;
  }

  // Serve CSS files
  if (pathname.endsWith(".css")) {
    const filePath = resolve(ROOT, pathname.slice(1));
    const served = await serveStatic(filePath, res);
    if (served) return;
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not found");
    return;
  }

  // For all other paths (no file extension or unknown), serve the HTML shell
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
  const filePath = resolve(ROOT, pathname.slice(1));
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
