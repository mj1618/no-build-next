import { readdir } from "node:fs/promises";
import { join, basename, relative, sep } from "node:path";

export interface RouteEntry {
  pattern: string;
  regex: RegExp;
  paramNames: string[];
  pagePath: string;
  layoutPaths: string[];
  loadingPath?: string;
  errorPath?: string;
  notFoundPath?: string;
}

interface DirEntry {
  name: string;
  isDirectory(): boolean;
  isFile(): boolean;
}

const SPECIAL_FILES = ["layout.tsx", "loading.tsx", "error.tsx", "not-found.tsx"] as const;

/**
 * Recursively scan the app directory and build a route table.
 */
export async function scanRoutes(appDir: string): Promise<RouteEntry[]> {
  const routes: RouteEntry[] = [];
  const appDirName = basename(appDir); // "app"
  await scanDir(appDir, appDir, appDirName, [], [], undefined, undefined, undefined, routes);
  sortRoutes(routes);
  return routes;
}

async function scanDir(
  dir: string,
  appDir: string,
  appDirName: string,
  urlSegments: string[],
  parentLayouts: string[],
  parentLoading: string | undefined,
  parentError: string | undefined,
  parentNotFound: string | undefined,
  routes: RouteEntry[],
): Promise<void> {
  let entries: DirEntry[];
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }

  // Helper to build a server-root-relative path like "/app/blog/layout.tsx"
  const toServePath = (fileName: string) =>
    "/" + appDirName + "/" + relative(appDir, join(dir, fileName)).split(sep).join("/");

  // Check for special files in this directory
  const fileNames = new Set(entries.filter(e => e.isFile()).map(e => e.name));

  const layoutPaths = [...parentLayouts];
  if (fileNames.has("layout.tsx")) {
    layoutPaths.push(toServePath("layout.tsx"));
  }

  const loadingPath = fileNames.has("loading.tsx") ? toServePath("loading.tsx") : parentLoading;
  const errorPath = fileNames.has("error.tsx") ? toServePath("error.tsx") : parentError;
  const notFoundPath = fileNames.has("not-found.tsx") ? toServePath("not-found.tsx") : parentNotFound;

  // If this directory has a page.tsx, register a route
  if (fileNames.has("page.tsx")) {
    const pagePath = toServePath("page.tsx");
    const pattern = "/" + urlSegments.join("/");
    const { regex, paramNames } = compilePattern(pattern);

    routes.push({
      pattern: pattern || "/",
      regex,
      paramNames,
      pagePath,
      layoutPaths: [...layoutPaths],
      loadingPath,
      errorPath,
      notFoundPath,
    });
  }

  // Recurse into subdirectories
  const dirs = entries.filter(e => e.isDirectory());
  for (const child of dirs) {
    const childDir = join(dir, child.name);

    // Route groups: (groupName) — stripped from URL but still traversed
    if (child.name.startsWith("(") && child.name.endsWith(")")) {
      await scanDir(childDir, appDir, appDirName, urlSegments, layoutPaths, loadingPath, errorPath, notFoundPath, routes);
    } else {
      await scanDir(childDir, appDir, appDirName, [...urlSegments, child.name], layoutPaths, loadingPath, errorPath, notFoundPath, routes);
    }
  }
}

/**
 * Compile a URL pattern like "/blog/[slug]" into a regex and extract param names.
 */
function compilePattern(pattern: string): { regex: RegExp; paramNames: string[] } {
  const paramNames: string[] = [];

  if (pattern === "/") {
    return { regex: /^\/$/, paramNames };
  }

  const segments = pattern.split("/").filter(Boolean);
  const regexParts: string[] = [];

  for (const seg of segments) {
    // Catch-all: [...slug]
    const catchAllMatch = seg.match(/^\[\.\.\.(\w+)\]$/);
    if (catchAllMatch) {
      paramNames.push(catchAllMatch[1]);
      regexParts.push("(.+)");
      continue;
    }

    // Dynamic segment: [param]
    const dynamicMatch = seg.match(/^\[(\w+)\]$/);
    if (dynamicMatch) {
      paramNames.push(dynamicMatch[1]);
      regexParts.push("([^/]+)");
      continue;
    }

    // Static segment
    regexParts.push(escapeRegex(seg));
  }

  const regexStr = "^/" + regexParts.join("/") + "$";
  return { regex: new RegExp(regexStr), paramNames };
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Sort routes so that more specific routes are matched first.
 * Order: all-static > has-dynamic > has-catch-all.
 * Within the same category, longer (more segments) routes come first.
 */
function sortRoutes(routes: RouteEntry[]): void {
  routes.sort((a, b) => {
    const aSegs = segmentTypes(a.pattern);
    const bSegs = segmentTypes(b.pattern);

    // Routes with catch-all go last
    if (aSegs.hasCatchAll !== bSegs.hasCatchAll) return aSegs.hasCatchAll ? 1 : -1;

    // Routes with dynamic segments go after all-static routes
    if (aSegs.hasDynamic !== bSegs.hasDynamic) return aSegs.hasDynamic ? 1 : -1;

    // More segments = more specific = comes first
    if (aSegs.total !== bSegs.total) return bSegs.total - aSegs.total;

    // More static segments = more specific
    if (aSegs.staticCount !== bSegs.staticCount) return bSegs.staticCount - aSegs.staticCount;

    // Alphabetical tie-break
    return a.pattern.localeCompare(b.pattern);
  });
}

function segmentTypes(pattern: string) {
  const segments = pattern.split("/").filter(Boolean);
  let staticCount = 0;
  let dynamicCount = 0;
  let catchAllCount = 0;

  for (const seg of segments) {
    if (seg.startsWith("[...")) catchAllCount++;
    else if (seg.startsWith("[")) dynamicCount++;
    else staticCount++;
  }

  return {
    total: segments.length,
    staticCount,
    hasDynamic: dynamicCount > 0,
    hasCatchAll: catchAllCount > 0,
  };
}

/**
 * Match a pathname against the route table.
 * Returns the matched route and extracted params, or null.
 */
export function matchRoute(
  pathname: string,
  routes: RouteEntry[],
): { route: RouteEntry; params: Record<string, string> } | null {
  for (const route of routes) {
    const match = pathname.match(route.regex);
    if (match) {
      const params: Record<string, string> = {};
      for (let i = 0; i < route.paramNames.length; i++) {
        params[route.paramNames[i]] = match[i + 1];
      }
      return { route, params };
    }
  }
  return null;
}
