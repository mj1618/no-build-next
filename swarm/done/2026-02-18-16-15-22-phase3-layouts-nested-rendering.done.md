# Task: Phase 3 — Layouts & Nested Rendering

## Summary
Implement the client-side router and layout renderer so the app supports multi-page navigation with nested layouts. Replace the hardcoded single-page bootstrap with a router that fetches the route table from `/__routes`, matches the current URL, dynamically imports the matched page and its layout chain, and renders them nested (outermost layout wrapping innermost wrapping page).

## Why
Phase 1 (server foundation) and Phase 2 (file-system routing) are complete. The server can transform/serve TSX, scan routes, and expose a `/__routes` API. But the client still hardcodes a single page import. Phase 3 from PLAN.md is next: implement `layout.tsx` convention with nested layout chains and a client-side router that dynamically imports pages and layouts.

## Deliverables

### 1. Create `client/router.tsx` — Client-side router component
- Export a `<Router>` React component
- On mount, fetch the route table from `/__routes` (JSON response with `{ routes: [...] }`)
- Match `window.location.pathname` against route patterns from the table:
  - Build regex from each route's `pattern` field (same logic as server-side):
    - `[param]` → `([^/]+)`
    - `[...slug]` → `(.+)`
    - Static segments → literal
    - Anchored with `^...$`
  - Extract params from regex match groups using `paramNames`
- When a route matches, dynamically `import()` the `pagePath` and all `layoutPaths`
- Pass the imported modules to `<LayoutRenderer>` for nested rendering
- If no route matches, show a "404 — Page not found" fallback
- Listen for `popstate` events to handle browser back/forward buttons
- Export a `navigate(href: string)` function that:
  - Calls `history.pushState({}, '', href)`
  - Triggers the router to re-match and re-render
- Use React `useState`/`useEffect` for state management (no external deps)
- Store the route table in state after fetching (fetch once on mount)

### 2. Create `client/layout-renderer.tsx` — Nested layout chain renderer
- Export a `<LayoutRenderer>` component
- Props:
  - `layouts`: Array of React components (the layout chain, ordered root → leaf)
  - `page`: React component (the matched page)
  - `params`: `Record<string, string>` (route params)
- Render the layouts nested: `<RootLayout><BlogLayout><Page /></BlogLayout></RootLayout>`
- Implementation: reduce from the innermost outward, or iterate from last to first:
  ```tsx
  let content = <Page params={params} />;
  for (let i = layouts.length - 1; i >= 0; i--) {
    const Layout = layouts[i];
    content = <Layout params={params}>{content}</Layout>;
  }
  return content;
  ```
- Each layout receives `children` (its nested content) and `params` as props

### 3. Update `client/bootstrap.tsx` — Wire up the router
- Replace the current hardcoded page import with the `<Router>` component:
  ```tsx
  import { createRoot } from "react-dom/client";
  import { Router } from "/client/router.tsx";

  const root = createRoot(document.getElementById("root")!);
  root.render(<Router />);
  ```
- Remove the `import Page from "/app/page.tsx"` hardcoded import

### 4. Update `app/layout.tsx` — Make root layout functional
- The root layout should wrap children in a proper app shell:
  ```tsx
  export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
      <div id="app">
        <nav>
          <a href="/">Home</a> | <a href="/about">About</a> | <a href="/blog">Blog</a>
        </nav>
        <main>{children}</main>
      </div>
    );
  }
  ```
- This ensures the nav bar persists across all pages (demonstrating layout persistence)

### 5. Update `app/blog/layout.tsx` — Ensure nested layout works
- The blog layout should wrap children with a blog-specific header/wrapper:
  ```tsx
  export default function BlogLayout({ children }: { children: React.ReactNode }) {
    return (
      <div className="blog-section">
        <h2>Blog Section</h2>
        {children}
      </div>
    );
  }
  ```
- This demonstrates nested layouts: root layout → blog layout → blog page

## File Paths
- **Create**: `client/router.tsx`
- **Create**: `client/layout-renderer.tsx`
- **Modify**: `client/bootstrap.tsx` (replace hardcoded page with Router)
- **Modify**: `app/layout.tsx` (add nav shell)
- **Modify**: `app/blog/layout.tsx` (ensure proper children wrapping)

## Acceptance Criteria
1. `pnpm dev` starts without errors
2. Opening `http://localhost:3000/` in a browser shows the home page wrapped in the root layout (with nav bar)
3. Navigating to `http://localhost:3000/about` shows the about page wrapped in the root layout
4. Navigating to `http://localhost:3000/blog` shows the blog page wrapped in **both** root layout AND blog layout (nested)
5. Navigating to `http://localhost:3000/blog/hello-world` shows the blog post page wrapped in root + blog layouts
6. Navigating to a non-existent route like `/xyz` shows a 404 fallback message
7. Browser back/forward buttons work (popstate handling)
8. The `navigate()` function exists for programmatic navigation (will be used by `<Link>` in Phase 5)
9. Layout components persist across navigations within their segment (root layout's nav is always visible)
10. TypeScript compiles cleanly (`npx tsc --noEmit`)

## Technical Notes
- The route table from `/__routes` has this shape (from Phase 2):
  ```json
  {
    "routes": [{
      "pattern": "/",
      "pagePath": "/app/page.tsx",
      "layoutPaths": ["/app/layout.tsx"],
      "paramNames": [],
      "loadingPath": null,
      "errorPath": null,
      "notFoundPath": null
    }, ...]
  }
  ```
- `pagePath` and `layoutPaths` are absolute from server root (start with `/`), so they can be used directly in `import()` calls
- Use `import()` for dynamic imports — the browser will request the `.tsx` file, and the server will transform it on-the-fly
- The pattern-to-regex compilation on the client must match the server's logic in `server/router.ts`
- The `params` object should be passed to both page and layout components so they can access dynamic route params
- Don't implement `<Link>` in this task — that's Phase 5. Plain `<a>` tags with full page reload are fine for now.
- Don't implement loading/error/not-found boundaries in this task — that's Phase 4. Just render the page and layouts.

---

## Completion Summary

### Files Created
- **`client/router.tsx`** — Client-side router component. Fetches route table from `/__routes` on mount. Compiles route patterns to regex (matching server-side logic for `[param]`, `[...slug]`, and static segments). Matches `window.location.pathname` against routes, dynamically imports the matched page and its layout chain in parallel via `import()`. Renders via `<LayoutRenderer>`. Shows "404 — Page not found" for unmatched routes. Listens for `popstate` events for browser back/forward. Exports a `navigate(href)` function for programmatic navigation via `history.pushState`.
- **`client/layout-renderer.tsx`** — Nested layout chain renderer. Accepts `layouts` (array of layout components, root→leaf), `page` component, and `params`. Renders layouts nested from outermost to innermost wrapping the page: `<RootLayout><BlogLayout><Page /></BlogLayout></RootLayout>`. Both layouts and page receive `params` as props.

### Files Modified
- **`client/bootstrap.tsx`** — Replaced hardcoded `import Page from "/app/page.tsx"` with `import { Router } from "/client/router.tsx"`. Now renders `<Router />` instead of `<Page />`.
- **`app/layout.tsx`** — Updated root layout with a nav shell containing links to Home, About, and Blog. Wraps children in `<div id="app"><nav>...</nav><main>{children}</main></div>`.
- **`app/blog/layout.tsx`** — Added `className="blog-section"` to the wrapping div for styling.
- **`app/blog/[slug]/page.tsx`** — Updated to accept `params` prop and display `params.slug` in the heading: `<h1>Blog Post: {params.slug}</h1>`.

### What Works
- `pnpm dev` starts without errors (1ms startup, 4 routes scanned)
- All client-side files (`router.tsx`, `layout-renderer.tsx`, `bootstrap.tsx`) transform correctly via esbuild
- `/__routes` endpoint returns correct route table with layout chains
- Route matching: `/` → home, `/about` → about, `/blog` → blog, `/blog/[slug]` → blog post
- Nested layouts: `/blog` and `/blog/[slug]` are wrapped in both root layout AND blog layout
- Blog post pages display the dynamic slug parameter
- 404 fallback for unmatched routes
- `popstate` event handling for browser back/forward
- `navigate()` function exported for programmatic navigation (Phase 5 `<Link>` can use it)
- TypeScript compiles cleanly (`tsc --noEmit` passes with no errors)
