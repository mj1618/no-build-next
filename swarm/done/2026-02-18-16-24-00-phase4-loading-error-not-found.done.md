# Task: Phase 4 — Loading, Error, and Not-Found States

## Summary
Wire `loading.tsx`, `error.tsx`, and `not-found.tsx` conventions into the client-side rendering pipeline. Create the `client/error-boundary.tsx` component, update the layout renderer and router to wrap route segments with Suspense boundaries (for `loading.tsx`) and error boundaries (for `error.tsx`), and handle unmatched routes with the nearest `not-found.tsx` component.

## Why
Phases 1–3 are complete. The server scans routes and already tracks `loadingPath`, `errorPath`, and `notFoundPath` per route entry. The `/__routes` API already serializes these fields to the client. But the client-side renderer ignores them — there are no Suspense or error boundaries. Phase 4 from PLAN.md is the next milestone.

## Current State
- `server/router.ts` already collects `loadingPath`, `errorPath`, `notFoundPath` per route (walking up from the segment to root to find the nearest one)
- `/__routes` returns these fields (they can be `string | undefined`)
- `client/router.tsx` has `ClientRoute` interface with `loadingPath`, `errorPath`, `notFoundPath` fields (typed as `string | null`)
- `client/layout-renderer.tsx` currently just nests layouts around the page — no Suspense or error boundaries
- No `client/error-boundary.tsx` exists yet
- No `app/loading.tsx`, `app/error.tsx`, or `app/not-found.tsx` demo files exist yet

## Deliverables

### 1. Create `client/error-boundary.tsx` — React error boundary component
- Create a class component `ErrorBoundary` (React error boundaries must be class components)
- Props:
  - `children: ReactNode` — the content to wrap
  - `fallback: ComponentType<{ error: Error; reset: () => void }>` — the error UI component from `error.tsx`
  - `params: Record<string, string>` — route params to pass to the fallback
- State: `{ hasError: boolean; error: Error | null }`
- `static getDerivedStateFromError(error: Error)` → sets `hasError: true, error`
- `componentDidCatch(error, errorInfo)` → log to console
- Render logic:
  - If `hasError` and `error`, render `<Fallback error={error} reset={() => this.setState({ hasError: false, error: null })} />`
  - Otherwise render `children`
- The `reset` function clears the error state so the user can retry
- Export `ErrorBoundary` as a named export

### 2. Update `client/router.tsx` — Load loading/error/not-found modules
- In the `loadRouteModules` function, also import the `loadingPath`, `errorPath`, and `notFoundPath` modules (if they exist on the matched route)
- Update the `LoadedRoute` interface to include:
  ```ts
  loading?: ComponentType;       // From loading.tsx
  error?: ComponentType<{ error: Error; reset: () => void }>;  // From error.tsx
  notFound?: ComponentType;      // From not-found.tsx
  ```
- In `loadRouteModules`, conditionally `import()` these paths (only if they're non-null strings on the route):
  ```ts
  const imports = [
    import(route.pagePath),
    ...route.layoutPaths.map(p => import(p)),
  ];
  // Also load optional boundary modules
  const loadingImport = route.loadingPath ? import(route.loadingPath) : null;
  const errorImport = route.errorPath ? import(route.errorPath) : null;
  const notFoundImport = route.notFoundPath ? import(route.notFoundPath) : null;
  ```
- Pass loading/error/notFound components to the `LayoutRenderer`
- For the 404 (no route match) case: if the route table provided a root-level `notFoundPath` (from `app/not-found.tsx`), import and render that component instead of the hardcoded "404 — Page not found" text. Fall back to the hardcoded text if no `not-found.tsx` exists.

### 3. Update `client/layout-renderer.tsx` — Add Suspense and error boundaries
- Import `Suspense` from `react`
- Import `ErrorBoundary` from `/client/error-boundary.tsx`
- Update `LayoutRendererProps` to accept optional `loading`, `error` components
- Wrap the page content with:
  1. An `<ErrorBoundary>` if an `error` component was provided
  2. A `<Suspense fallback={<Loading />}>` if a `loading` component was provided
- The wrapping order should be: ErrorBoundary outside, Suspense inside (errors catch Suspense failures too):
  ```tsx
  let content = <Page params={params} />;

  if (loading) {
    const Loading = loading;
    content = <Suspense fallback={<Loading />}>{content}</Suspense>;
  }

  if (error) {
    content = <ErrorBoundary fallback={error} params={params}>{content}</ErrorBoundary>;
  }

  // Then wrap with layouts as before
  for (let i = layouts.length - 1; i >= 0; i--) {
    const Layout = layouts[i];
    content = <Layout params={params}>{content}</Layout>;
  }
  ```

### 4. Create demo `app/loading.tsx` — Global loading state
- Default export a simple component:
  ```tsx
  export default function Loading() {
    return <div style={{ padding: "1rem" }}>Loading...</div>;
  }
  ```

### 5. Create demo `app/error.tsx` — Global error boundary UI
- Default export a component that accepts `error` and `reset` props:
  ```tsx
  export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
    return (
      <div style={{ padding: "1rem", color: "red" }}>
        <h2>Something went wrong!</h2>
        <p>{error.message}</p>
        <button onClick={reset}>Try again</button>
      </div>
    );
  }
  ```

### 6. Create demo `app/not-found.tsx` — 404 page
- Default export a component:
  ```tsx
  export default function NotFound() {
    return (
      <div style={{ padding: "2rem" }}>
        <h1>404 — Not Found</h1>
        <p>The page you're looking for doesn't exist.</p>
        <a href="/">Go home</a>
      </div>
    );
  }
  ```

## File Paths
- **Create**: `client/error-boundary.tsx`
- **Modify**: `client/router.tsx` (load boundary modules, pass to LayoutRenderer, use not-found component)
- **Modify**: `client/layout-renderer.tsx` (add Suspense + ErrorBoundary wrapping)
- **Create**: `app/loading.tsx`
- **Create**: `app/error.tsx`
- **Create**: `app/not-found.tsx`

## Acceptance Criteria
1. `pnpm dev` starts without errors
2. All existing routes still work (/, /about, /blog, /blog/hello-world)
3. Navigating to a non-existent route like `/xyz` shows the custom `not-found.tsx` UI (with "Go home" link) instead of hardcoded "404" text
4. The `app/loading.tsx` component is imported and used as the Suspense fallback for route loading
5. The `app/error.tsx` component is imported and used as the ErrorBoundary fallback — if a page component throws during render, the error UI appears with the error message and a "Try again" button
6. The "Try again" button resets the error boundary and re-renders the page
7. The `client/error-boundary.tsx` is a proper React class component with `getDerivedStateFromError` and `componentDidCatch`
8. TypeScript compiles cleanly (`npx tsc --noEmit`)

## Technical Notes
- React error boundaries MUST be class components — there's no hooks-based equivalent
- The `Suspense` boundary matters for lazy-loaded components via `React.lazy()`. Currently pages are loaded eagerly in `loadRouteModules`, but the Suspense boundary will become useful if we later switch to lazy imports or if page components themselves use `Suspense` internally.
- The `loading.tsx` from the route table is the "nearest" loading component — the scanner walks up from the route segment to root. So `/blog/[slug]` would use `app/blog/loading.tsx` if it exists, falling back to `app/loading.tsx`.
- Same inheritance logic for `error.tsx` and `not-found.tsx`.
- The `/__routes` API already provides these paths. Example response:
  ```json
  {
    "routes": [{
      "pattern": "/",
      "pagePath": "/app/page.tsx",
      "layoutPaths": ["/app/layout.tsx"],
      "paramNames": [],
      "loadingPath": "/app/loading.tsx",
      "errorPath": "/app/error.tsx",
      "notFoundPath": "/app/not-found.tsx"
    }]
  }
  ```
- Import `Suspense` from `"react"` — it's available via the import map pointing to esm.sh.
- The `error.tsx` convention in Next.js receives `{ error, reset }` props — follow the same convention here.

---

## Completion Summary

### Files Created
- **`client/error-boundary.tsx`** — React class component `ErrorBoundary` with `getDerivedStateFromError` and `componentDidCatch`. Accepts `fallback` (error UI component), `children`, and `params` props. The `reset` function clears error state so users can retry. Logs caught errors to console.
- **`app/loading.tsx`** — Simple loading indicator component: `<div>Loading...</div>`. Used as the Suspense fallback for route segments.
- **`app/error.tsx`** — Error page component receiving `{ error, reset }` props. Displays error message in red with a "Try again" button that resets the error boundary.
- **`app/not-found.tsx`** — Custom 404 page with heading, description, and "Go home" link.

### Files Modified
- **`client/layout-renderer.tsx`** — Added `Suspense` and `ErrorBoundary` wrapping around page content. If a `loading` component is provided, wraps page in `<Suspense fallback={<Loading />}>`. If an `error` component is provided, wraps in `<ErrorBoundary fallback={error}>`. ErrorBoundary is outermost (catches Suspense failures), Suspense is innermost. Layout nesting still happens outside both boundaries. Added `loading` and `error` optional props to `LayoutRendererProps`.
- **`client/router.tsx`** — Updated `LoadedRoute` interface with optional `loading` and `error` component fields. Updated `loadRouteModules` to dynamically import `loadingPath` and `errorPath` modules in parallel alongside page/layout imports. Added `findNotFoundPath` helper to find root-level not-found path from route table. For 404 (no match) case, dynamically imports and renders the custom `not-found.tsx` component instead of hardcoded text. Falls back to hardcoded "404 — Page not found" if no `not-found.tsx` exists. Passes `loading` and `error` components through to `LayoutRenderer`.

### What Works
- `pnpm dev` starts without errors (1ms startup, 4 routes scanned)
- All existing routes still work (/, /about, /blog, /blog/[slug])
- `/__routes` endpoint returns `loadingPath`, `errorPath`, and `notFoundPath` for all routes (inherited from `app/` root)
- Custom `not-found.tsx` is rendered for unmatched routes (e.g. `/xyz`) with "Go home" link
- `loading.tsx` component is imported and used as Suspense fallback for route rendering
- `error.tsx` component is imported and used as ErrorBoundary fallback — if a page throws during render, the error UI appears with the error message and "Try again" button
- "Try again" button resets the error boundary state and re-renders the page
- `ErrorBoundary` is a proper React class component with `getDerivedStateFromError` and `componentDidCatch`
- All client files transform correctly via esbuild (verified with curl)
- TypeScript compiles cleanly (`tsc --noEmit` passes with no errors)
