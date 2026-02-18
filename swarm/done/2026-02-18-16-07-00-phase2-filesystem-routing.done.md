# Task: Phase 2 — File-System Routing

## Summary
Create `server/router.ts` that scans the `app/` directory to build a route table supporting nested routes, dynamic segments `[param]`, catch-all segments `[...slug]`, and route groups `(group)`. Expose the route table to the client via an API endpoint. Create demo pages to test the routing patterns.

## Why
Phase 1 is complete — the server can transform/serve TSX and render a single page. Phase 2 is the next milestone from PLAN.md. Without a route table, we can't implement client-side routing, layouts, or any multi-page functionality. The route scanner is a prerequisite for everything that follows.

## Deliverables

### 1. Create `server/router.ts` — Route table scanner
- Export a `RouteEntry` type:
  ```ts
  interface RouteEntry {
    pattern: string;       // URL pattern, e.g. "/blog/[slug]"
    regex: RegExp;         // Compiled regex for matching
    paramNames: string[];  // ["slug"] for dynamic segments
    pagePath: string;      // Relative path to page.tsx, e.g. "app/blog/[slug]/page.tsx"
    layoutPaths: string[]; // Layout chain from root to this segment, e.g. ["app/layout.tsx", "app/blog/layout.tsx"]
    loadingPath?: string;  // Path to nearest loading.tsx (if any)
    errorPath?: string;    // Path to nearest error.tsx (if any)
    notFoundPath?: string; // Path to nearest not-found.tsx (if any)
  }
  ```
- Export an async function `scanRoutes(appDir: string): Promise<RouteEntry[]>`
  - Recursively scan the `appDir` directory
  - Find all `page.tsx` files — each one defines a route
  - For each `page.tsx`, compute the URL pattern:
    - Folder names become URL segments: `app/about/page.tsx` → `/about`
    - Dynamic segments: `app/blog/[slug]/page.tsx` → `/blog/[slug]` (param name: `slug`)
    - Catch-all segments: `app/blog/[...slug]/page.tsx` → `/blog/[...slug]` (greedy match)
    - Route groups: `app/(marketing)/about/page.tsx` → `/about` (group name stripped from URL)
    - Root `app/page.tsx` → `/`
  - For each route, collect the layout chain (all `layout.tsx` files from root to the route's segment)
  - For each route, find the nearest `loading.tsx`, `error.tsx`, and `not-found.tsx` by walking up from the route segment toward root
  - Compile each URL pattern into a regex for matching:
    - `[param]` → `([^/]+)` named capture group
    - `[...slug]` → `(.+)` greedy capture group
    - Static segments → literal match
    - Full pattern anchored with `^` and `$`
  - Sort routes: static routes before dynamic, dynamic before catch-all (more specific first)

- Export a function `matchRoute(pathname: string, routes: RouteEntry[]): { route: RouteEntry; params: Record<string, string> } | null`
  - Test pathname against each route's regex in order
  - Return matched route + extracted params, or null for no match

### 2. Create API endpoint `/__routes` in `server/index.ts`
- When the server starts, call `scanRoutes(resolve(ROOT, 'app'))` and store the result
- Add a new handler in `server/index.ts`: `GET /__routes` returns the route table as JSON
  - Return a serializable version (without regex) for the client:
    ```json
    {
      "routes": [
        {
          "pattern": "/",
          "pagePath": "/app/page.tsx",
          "layoutPaths": ["/app/layout.tsx"],
          "paramNames": []
        },
        {
          "pattern": "/about",
          "pagePath": "/app/about/page.tsx",
          "layoutPaths": ["/app/layout.tsx"],
          "paramNames": []
        },
        {
          "pattern": "/blog/[slug]",
          "pagePath": "/app/blog/[slug]/page.tsx",
          "layoutPaths": ["/app/layout.tsx", "/app/blog/layout.tsx"],
          "paramNames": ["slug"]
        }
      ]
    }
    ```
  - Paths should be absolute from server root (prefixed with `/`) so the client can `import()` them directly

### 3. Create demo app pages for testing routing
- `app/about/page.tsx` — Simple page: `<h1>About</h1><p>About page content</p>`
- `app/blog/page.tsx` — Blog index: `<h1>Blog</h1><p>Blog listing</p>`
- `app/blog/layout.tsx` — Blog layout: wraps children in a `<div>` with a "Blog Section" header
- `app/blog/[slug]/page.tsx` — Blog post page: `<h1>Blog Post: {slug}</h1>` (slug will be wired up later with params, for now use placeholder text)

### 4. Update `app/page.tsx` — Add links
- Update the existing home page to include links (plain `<a>` tags for now) to `/about` and `/blog`

## File Paths
- **Create**: `server/router.ts`
- **Modify**: `server/index.ts` (add `/__routes` endpoint, call `scanRoutes` on startup)
- **Create**: `app/about/page.tsx`
- **Create**: `app/blog/page.tsx`
- **Create**: `app/blog/layout.tsx`
- **Create**: `app/blog/[slug]/page.tsx`
- **Modify**: `app/page.tsx` (add links)

## Acceptance Criteria
1. `pnpm dev` starts without errors
2. `GET /__routes` returns a JSON array of route entries with correct patterns:
   - `/` → `app/page.tsx`
   - `/about` → `app/about/page.tsx`
   - `/blog` → `app/blog/page.tsx`
   - `/blog/[slug]` → `app/blog/[slug]/page.tsx`
3. The route table includes layout chains — e.g., `/blog/[slug]` includes both `app/layout.tsx` and `app/blog/layout.tsx`
4. `matchRoute('/blog/my-post', routes)` returns `{ route: ..., params: { slug: 'my-post' } }`
5. Static routes are sorted before dynamic routes (e.g., `/blog` matches before `/blog/[slug]`)
6. Route groups like `(groupName)` are stripped from URL patterns (if any exist in the test app)
7. TypeScript compiles cleanly (`npx tsc --noEmit`)

## Technical Notes
- Use `fs.readdir` with `{ withFileTypes: true, recursive: true }` (Node 20+) or manual recursion
- The regex for `[param]` should be `([^/]+)` — matches a single path segment
- The regex for `[...slug]` should be `(.+)` — matches one or more segments
- Route groups `(name)` folders should be skipped in URL construction but still traversed for `layout.tsx` and `page.tsx`
- The layout chain should be ordered from root to leaf (outermost to innermost)
- Remember that `loading.tsx`, `error.tsx`, `not-found.tsx` should be tracked per-route for use in Phase 4

---

## Completion Summary

### Files Created
- **`server/router.ts`** — Route table scanner. Exports `RouteEntry` interface, `scanRoutes(appDir)` to recursively scan the `app/` directory and build a route table, and `matchRoute(pathname, routes)` for URL matching with param extraction. Supports `[param]` dynamic segments (regex `([^/]+)`), `[...slug]` catch-all segments (regex `(.+)`), and `(group)` route groups (stripped from URL pattern). Collects layout chains (root to leaf), loading/error/not-found paths per route. Routes are sorted: all-static first, then dynamic, then catch-all; more segments = more specific.
- **`app/about/page.tsx`** — Simple About page component.
- **`app/blog/page.tsx`** — Blog index page component.
- **`app/blog/layout.tsx`** — Blog section layout wrapping children with a "Blog Section" header.
- **`app/blog/[slug]/page.tsx`** — Blog post page (placeholder text, slug params to be wired in later phases).

### Files Modified
- **`server/index.ts`** — Added import of `scanRoutes` and `RouteEntry` from `./router.ts`. Route scanning runs at startup. Added `GET /__routes` endpoint that returns a serialized (no regex) JSON route table with paths prefixed `/app/...` for client-side `import()`.
- **`app/page.tsx`** — Added navigation links to `/about` and `/blog`.

### What Works
- `pnpm dev` starts without errors, scans 4 routes from `app/`
- `GET /__routes` returns correct JSON: `/` → `/app/page.tsx`, `/about` → `/app/about/page.tsx`, `/blog` → `/app/blog/page.tsx`, `/blog/[slug]` → `/app/blog/[slug]/page.tsx`
- Layout chains are correct: `/blog/[slug]` includes `["/app/layout.tsx", "/app/blog/layout.tsx"]`
- `matchRoute('/blog/my-post', routes)` returns `{ params: { slug: 'my-post' } }` with pattern `/blog/[slug]`
- Static routes sort before dynamic routes
- Route groups `(groupName)` are stripped from URL patterns
- TypeScript compiles cleanly (`tsc --noEmit` passes with no errors)
