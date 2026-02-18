import { useState, useEffect, useCallback, type ComponentType, type ReactNode } from "react";
import { LayoutRenderer } from "/client/layout-renderer.tsx";

interface ClientRoute {
  pattern: string;
  pagePath: string;
  layoutPaths: string[];
  paramNames: string[];
  loadingPath?: string | null;
  errorPath?: string | null;
  notFoundPath?: string | null;
}

interface RouteMatch {
  route: ClientRoute;
  params: Record<string, string>;
}

interface LoadedRoute {
  page: ComponentType<{ params: Record<string, string> }>;
  layouts: ComponentType<{ children: ReactNode; params: Record<string, string> }>[];
  params: Record<string, string>;
  loading?: ComponentType;
  error?: ComponentType<{ error: Error; reset: () => void }>;
}

// Global navigation function — exported so other modules (e.g. <Link>) can use it
let routerNavigate: ((href: string) => void) | null = null;

export function navigate(href: string) {
  if (routerNavigate) {
    routerNavigate(href);
  }
}

/**
 * Compile a route pattern to a regex, matching server-side logic.
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

    // Static segment — escape regex chars
    regexParts.push(seg.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  }

  const regexStr = "^/" + regexParts.join("/") + "$";
  return { regex: new RegExp(regexStr), paramNames };
}

/**
 * Normalize a pathname by stripping trailing slashes (except for root "/").
 */
function normalizePath(pathname: string): string {
  if (pathname === "/") return pathname;
  return pathname.replace(/\/+$/, "");
}

/**
 * Match a pathname against the route table.
 */
function matchRoute(pathname: string, routes: ClientRoute[]): RouteMatch | null {
  const normalized = normalizePath(pathname);
  for (const route of routes) {
    const { regex, paramNames } = compilePattern(route.pattern);
    const match = normalized.match(regex);
    if (match) {
      const params: Record<string, string> = {};
      for (let i = 0; i < paramNames.length; i++) {
        params[paramNames[i]] = match[i + 1];
      }
      return { route, params };
    }
  }
  return null;
}

declare global {
  interface Window { __hmrVersion?: number; }
}

function cacheBust(path: string): string {
  const v = window.__hmrVersion || 0;
  return v ? `${path}?v=${v}` : path;
}

/**
 * Dynamically import a page and its layout chain, plus optional boundary modules.
 */
async function loadRouteModules(routeMatch: RouteMatch): Promise<LoadedRoute> {
  const { route, params } = routeMatch;

  const [pageModule, ...layoutModules] = await Promise.all([
    import(/* @vite-ignore */ cacheBust(route.pagePath)),
    ...route.layoutPaths.map((p) => import(/* @vite-ignore */ cacheBust(p))),
  ]);

  const [loadingModule, errorModule] = await Promise.all([
    route.loadingPath ? import(/* @vite-ignore */ cacheBust(route.loadingPath)) : null,
    route.errorPath ? import(/* @vite-ignore */ cacheBust(route.errorPath)) : null,
  ]);

  return {
    page: pageModule.default,
    layouts: layoutModules.map((m) => m.default),
    params,
    loading: loadingModule?.default,
    error: errorModule?.default,
  };
}

/**
 * Find the not-found info from the route table: path + layout paths.
 * The route scanner inherits notFoundPath, so any route that has one
 * can provide it — we pick the first one that exists (they all inherit
 * from root if app/not-found.tsx exists).
 */
function findNotFoundInfo(routes: ClientRoute[]): { notFoundPath: string; layoutPaths: string[] } | null {
  for (const route of routes) {
    if (route.notFoundPath) return { notFoundPath: route.notFoundPath, layoutPaths: route.layoutPaths };
  }
  return null;
}

export function Router() {
  const [routes, setRoutes] = useState<ClientRoute[] | null>(null);
  const [loaded, setLoaded] = useState<LoadedRoute | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [notFoundComponent, setNotFoundComponent] = useState<ComponentType | null>(null);
  const [notFoundLayouts, setNotFoundLayouts] = useState<ComponentType<{ children: ReactNode; params: Record<string, string> }>[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Resolve a pathname: match route, load modules, update state
  const resolve = useCallback(
    async (pathname: string, routeTable: ClientRoute[]) => {
      setNotFound(false);
      setError(null);

      const match = matchRoute(pathname, routeTable);
      if (!match) {
        setNotFound(true);
        setLoaded(null);

        // Try to load a custom not-found component + its layouts
        const nfInfo = findNotFoundInfo(routeTable);
        if (nfInfo) {
          try {
            const [nfModule, ...layoutModules] = await Promise.all([
              import(/* @vite-ignore */ cacheBust(nfInfo.notFoundPath)),
              ...nfInfo.layoutPaths.map((p) => import(/* @vite-ignore */ cacheBust(p))),
            ]);
            setNotFoundComponent(() => nfModule.default);
            setNotFoundLayouts(layoutModules.map((m) => m.default));
          } catch {
            // Fall back to hardcoded 404
            setNotFoundComponent(null);
            setNotFoundLayouts([]);
          }
        }
        return;
      }

      try {
        const result = await loadRouteModules(match);
        setLoaded(result);
      } catch (err: any) {
        console.error("Failed to load route modules:", err);
        setError(err.message || "Failed to load page");
      }
    },
    [],
  );

  // Fetch route table on mount
  useEffect(() => {
    let cancelled = false;

    fetch("/__routes")
      .then((res) => res.json())
      .then(({ routes: fetchedRoutes }: { routes: ClientRoute[] }) => {
        if (cancelled) return;
        setRoutes(fetchedRoutes);
        resolve(window.location.pathname, fetchedRoutes);
      })
      .catch((err) => {
        console.error("Failed to fetch routes:", err);
        if (!cancelled) setError("Failed to fetch route table");
      });

    return () => {
      cancelled = true;
    };
  }, [resolve]);

  // Register global navigate function, popstate listener, and link interception
  useEffect(() => {
    if (!routes) return;

    routerNavigate = (href: string) => {
      const url = new URL(href, window.location.origin);
      history.pushState({}, "", url.pathname);
      resolve(url.pathname, routes);
    };

    const onPopState = () => {
      resolve(window.location.pathname, routes);
    };

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const anchor = (e.target as Element).closest("a");
      if (!anchor) return;
      if (anchor.hasAttribute("download") || anchor.getAttribute("target") === "_blank") return;
      if (anchor.getAttribute("rel")?.includes("external")) return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) return;

      try {
        const url = new URL(href, window.location.origin);
        if (url.origin !== window.location.origin) return;
        e.preventDefault();
        if (url.pathname !== window.location.pathname) {
          routerNavigate!(url.href);
        }
      } catch {
        return;
      }
    };

    window.addEventListener("popstate", onPopState);
    document.addEventListener("click", onClick);

    return () => {
      routerNavigate = null;
      window.removeEventListener("popstate", onPopState);
      document.removeEventListener("click", onClick);
    };
  }, [routes, resolve]);

  if (error) {
    return <div style={{ padding: "2rem", color: "red" }}><h1>Error</h1><p>{error}</p></div>;
  }

  if (!routes) {
    return <div style={{ padding: "2rem" }}>Loading...</div>;
  }

  if (notFound) {
    const NotFound = notFoundComponent || (() => <div style={{ padding: "2rem" }}><h1>404 — Page not found</h1></div>);
    if (notFoundLayouts.length > 0) {
      return (
        <LayoutRenderer
          layouts={notFoundLayouts}
          page={NotFound}
          params={{}}
        />
      );
    }
    return <NotFound />;
  }

  if (!loaded) {
    return <div style={{ padding: "2rem" }}>Loading...</div>;
  }

  return (
    <LayoutRenderer
      layouts={loaded.layouts}
      page={loaded.page}
      params={loaded.params}
      loading={loaded.loading}
      error={loaded.error}
    />
  );
}
