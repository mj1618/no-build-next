# Task: Phase 1 — Core Server Foundation

## Summary
Set up project dependencies and create the minimal HTTP server that serves an HTML shell, transforms TSX/TS files on-the-fly via esbuild, generates an import map for React, and renders a single `app/page.tsx` in the browser.

## Why
This is the very first task. The project has only a bare `package.json`. Nothing has been built yet. Phase 1 of PLAN.md is the foundation everything else builds on.

## Deliverables

### 1. Install dependencies
- Run `pnpm add react@19 react-dom@19 esbuild`
- Run `pnpm add -D typescript @types/react @types/react-dom tsx`
- Add a `"dev": "tsx server/index.ts"` script to `package.json`
- Set `"type": "module"` in `package.json`

### 2. Create `server/index.ts` — HTTP server entry point
- Create a Node.js HTTP server using the built-in `http` module
- Listen on port 3000 (configurable via `PORT` env var)
- Print startup time to console (measure with `performance.now()`)
- Route handling:
  - `GET /` and any path not matching a file extension → serve the HTML shell (from `server/html.ts`)
  - `GET /*.ts` or `GET /*.tsx` → transform via esbuild and serve as `application/javascript` (from `server/transform.ts`)
  - `GET /public/*` → serve static files (basic, can be a stub for now)
- Log each request to console

### 3. Create `server/transform.ts` — esbuild single-file transform
- Export an async function `transformFile(filePath: string): Promise<string>`
- Use `esbuild.transform()` with:
  - `loader: 'tsx'` (or `'ts'` based on extension)
  - `format: 'esm'`
  - `jsx: 'automatic'`
  - `jsxImportSource: 'react'`
- Implement in-memory cache keyed by `filePath + mtime` (use `fs.stat()` to get mtime)
- Return the transformed JS code as a string

### 4. Create `server/html.ts` — HTML shell generator
- Export a function `generateHtml(importMap: object): string`
- Return a string containing:
  ```html
  <!DOCTYPE html>
  <html><head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>no-build-next</title>
    <script type="importmap">{importMap JSON}</script>
  </head><body>
    <div id="root"></div>
    <script type="module" src="/client/bootstrap.tsx"></script>
  </body></html>
  ```

### 5. Create `server/import-map.ts` — import map generation
- Export a function `generateImportMap(): object`
- Return an import map object like:
  ```json
  {
    "imports": {
      "react": "https://esm.sh/react@19?dev",
      "react/jsx-runtime": "https://esm.sh/react@19/jsx-runtime?dev",
      "react-dom": "https://esm.sh/react-dom@19?dev",
      "react-dom/client": "https://esm.sh/react-dom@19/client?dev"
    }
  }
  ```

### 6. Create `client/bootstrap.tsx` — client entry point
- Import `React` from `react` and `createRoot` from `react-dom/client`
- Import the page component from `/app/page.tsx`
- Call `createRoot(document.getElementById('root')!).render(<Page />)`
- This is a minimal bootstrap — no routing yet, just render the single page

### 7. Create `app/page.tsx` — demo home page
- A simple React component that renders `<h1>no-build-next</h1>` and a `<p>` with some text
- Default export

### 8. Create `app/layout.tsx` — root layout stub
- Default export a component that renders `{children}`
- Not wired in yet (Phase 3), but define it now as a placeholder

### 9. Create `tsconfig.json`
- Standard React 19 + ESM TypeScript config
- `"jsx": "react-jsx"`, `"module": "ESNext"`, `"target": "ESNext"`, `"moduleResolution": "bundler"`

## File Paths to Create
- `server/index.ts`
- `server/transform.ts`
- `server/html.ts`
- `server/import-map.ts`
- `client/bootstrap.tsx`
- `app/page.tsx`
- `app/layout.tsx`
- `tsconfig.json`
- (modified) `package.json`

## Acceptance Criteria
1. `pnpm install` succeeds with no errors
2. `pnpm dev` starts the server and prints `Server listening on http://localhost:3000` with startup time
3. Opening `http://localhost:3000` in a browser shows the `<h1>no-build-next</h1>` heading
4. The browser console has no import errors — React loads from esm.sh via import map
5. Requesting `/app/page.tsx` returns transformed JavaScript (not raw TSX)
6. The esbuild transform uses `jsx: 'automatic'` so no manual `React.createElement` is needed

## Technical Notes
- The server resolves file paths relative to the project root (`process.cwd()`)
- For the TSX/TS request handler, strip any leading `/` and resolve against project root
- Set `Content-Type: application/javascript` for transformed files
- The import map must include `react/jsx-runtime` because esbuild's automatic JSX transform imports from it
- Use esm.sh with `?dev` flag for better error messages during development

---

## Completion Summary

### Files Created
- **`server/index.ts`** — HTTP server entry point using Node.js `http` module. Listens on configurable PORT (default 3000). Routes requests: serves HTML shell for page routes, transforms `.ts`/`.tsx` files via esbuild, serves static files from `public/`, and CSS files. Logs each request.
- **`server/transform.ts`** — esbuild single-file transform with in-memory mtime-based cache. Uses `jsx: 'automatic'` with `jsxImportSource: 'react'`. Exports `transformFile()` and `invalidateCache()`.
- **`server/html.ts`** — Generates HTML shell with import map injection, `#root` div, and module bootstrap script tag.
- **`server/import-map.ts`** — Generates import map object mapping `react`, `react/jsx-runtime`, `react/jsx-dev-runtime`, `react-dom`, and `react-dom/client` to esm.sh CDN URLs with `?dev` flag.
- **`client/bootstrap.tsx`** — Client entry point that imports `Page` from `/app/page.tsx` and renders it via `createRoot`.
- **`app/page.tsx`** — Demo home page rendering `<h1>no-build-next</h1>` with descriptive text.
- **`app/layout.tsx`** — Root layout stub that renders `{children}` (placeholder for Phase 3).
- **`tsconfig.json`** — TypeScript config with `react-jsx`, ESNext module/target, `allowImportingTsExtensions`, path aliases for `/app/*` and `/client/*`.

### Files Modified
- **`package.json`** — Added `"type": "module"`, `"dev"` script, runtime deps (react@19, react-dom@19, esbuild), dev deps (typescript, @types/react, @types/react-dom, @types/node, tsx), and `pnpm.onlyBuiltDependencies` for esbuild.

### What Works
- `pnpm dev` starts the server and prints startup message with timing
- HTML shell is served for all non-file-extension routes with correct import map
- `.ts` and `.tsx` files are transformed on-the-fly via esbuild with automatic JSX runtime
- Transform results are cached in memory keyed by file path + mtime
- Static files from `public/` are served correctly
- CSS files are served with correct content type
- 404 responses for missing files
- TypeScript type checking passes cleanly (`tsc --noEmit`)
