import { transform } from "esbuild";
import { readFile, stat, access } from "node:fs/promises";
import { extname, resolve, dirname } from "node:path";

interface CacheEntry {
  mtime: number;
  code: string;
}

const cache = new Map<string, CacheEntry>();

const ROOT = process.cwd();

async function resolveModulePath(specifier: string): Promise<string | null> {
  const basePath = resolve(ROOT, specifier);
  const extensions = [".tsx", ".ts", ".jsx", ".js", ""];
  
  for (const ext of extensions) {
    const fullPath = basePath + ext;
    try {
      await access(fullPath);
      return specifier + ext;
    } catch {}
  }
  
  for (const ext of extensions) {
    const indexPath = resolve(basePath, "index" + ext);
    try {
      await access(indexPath);
      return specifier + "/index" + ext;
    } catch {}
  }
  
  return null;
}

function rewritePathAliases(code: string): Promise<string> {
  const importRegex = /(from\s+['"])(@\/[^'"]+)(['"])/g;
  const dynamicImportRegex = /(import\s*\(\s*['"])(@\/[^'"]+)(['"]\s*\))/g;
  
  const matches: { match: string; specifier: string }[] = [];
  
  let m;
  while ((m = importRegex.exec(code)) !== null) {
    matches.push({ match: m[0], specifier: m[2] });
  }
  while ((m = dynamicImportRegex.exec(code)) !== null) {
    matches.push({ match: m[0], specifier: m[2] });
  }
  
  if (matches.length === 0) return Promise.resolve(code);
  
  return Promise.all(
    matches.map(async ({ match, specifier }) => {
      const relativePath = specifier.replace(/^@\//, "/");
      const resolved = await resolveModulePath(specifier.replace(/^@\//, ""));
      return { match, replacement: resolved ? "/" + resolved : relativePath };
    })
  ).then((replacements) => {
    let result = code;
    for (const { match, replacement } of replacements) {
      result = result.replace(match, match.replace(/@\/[^'"]+/, replacement));
    }
    return result;
  });
}

export async function transformFile(filePath: string): Promise<string> {
  const stats = await stat(filePath);
  const mtime = stats.mtimeMs;

  const cached = cache.get(filePath);
  if (cached && cached.mtime === mtime) {
    return cached.code;
  }

  const source = await readFile(filePath, "utf-8");
  const ext = extname(filePath);
  const loader = ext === ".tsx" ? "tsx" : ext === ".ts" ? "ts" : "js";

  const result = await transform(source, {
    loader,
    format: "esm",
    jsx: "automatic",
    jsxImportSource: "react",
    sourcefile: filePath,
  });

  const rewritten = await rewritePathAliases(result.code);
  
  cache.set(filePath, { mtime, code: rewritten });
  return rewritten;
}

export function invalidateCache(filePath: string) {
  cache.delete(filePath);
}
